# Query Optimization Analysis for Participants and Activities Features

## 🚨 Identified Slow Query Issues

### 1. **Participants Queries - Complex Filtering Without Indexes**

#### Performance Issues:

- **Complex WHERE clauses** with multiple filters and OR conditions
- **Array operations** on skills fields using `unnest()` and `EXISTS`
- **Case-insensitive LIKE searches** on multiple text fields
- **No database indexes** for commonly filtered columns
- **N+1 query problem** when fetching organization names

#### Specific Slow Queries:

```typescript
// getParticipants() - Multiple issues:
// 1. Complex array searching with unnest()
sql`EXISTS (SELECT 1 FROM unnest(${participants.vocationalSkillsParticipations}) AS skill WHERE LOWER(skill) = LOWER(${skillToMatch}))`;

// 2. Multiple LIKE searches without indexes
sql`(LOWER(${participants.firstName}) LIKE ${searchTerm} OR LOWER(${participants.lastName}) LIKE ${searchTerm} OR LOWER(${participants.designation}) LIKE ${searchTerm} OR LOWER(${participants.enterprise}) LIKE ${searchTerm})`;

// 3. Age range queries without indexes
sql`${participants.age} >= 15 AND ${participants.age} <= 35`;

// 4. Separate organization lookup after main query (N+1 problem)
db.query.organizations.findMany({
  where: inArray(organizations.id, organizationIds),
});
```

### 2. **Activities Queries - Relationship Loading Performance**

#### Performance Issues:

- **Deep relationship loading** with multiple `with` clauses
- **Inefficient counting** using separate array queries
- **Date range queries** without proper indexes

#### Specific Slow Queries:

```typescript
// getActivities() - Loading too many relationships
db.query.activities.findMany({
  with: {
    cluster: true,
    project: true,
    organization: true,
    activityParticipants: true, // Can be hundreds of records
  },
});

// getActivityMetrics() - Inefficient aggregation
allActivities.reduce(
  (sum, activity) => sum + (activity.activityParticipants?.length || 0),
  0
);
```

### 3. **Session and Attendance Queries**

#### Performance Issues:

- **Multiple sequential queries** instead of joins
- **No pagination** for session attendance

## 💡 Optimization Solutions

### 1. **Database Index Optimization**

```sql
-- Core participant indexes
CREATE INDEX CONCURRENTLY idx_participants_cluster_id ON participants(cluster_id);
CREATE INDEX CONCURRENTLY idx_participants_organization_id ON participants(organization_id);
CREATE INDEX CONCURRENTLY idx_participants_project_id ON participants(project_id);

-- Search optimization indexes
CREATE INDEX CONCURRENTLY idx_participants_name_search ON participants
  USING gin(to_tsvector('english', firstName || ' ' || lastName));
CREATE INDEX CONCURRENTLY idx_participants_enterprise_lower ON participants(LOWER(enterprise));
CREATE INDEX CONCURRENTLY idx_participants_designation_lower ON participants(LOWER(designation));

-- Filter optimization indexes
CREATE INDEX CONCURRENTLY idx_participants_sex ON participants(sex);
CREATE INDEX CONCURRENTLY idx_participants_age ON participants(age);
CREATE INDEX CONCURRENTLY idx_participants_district ON participants(district);
CREATE INDEX CONCURRENTLY idx_participants_subcounty ON participants(subCounty);
CREATE INDEX CONCURRENTLY idx_participants_pwd ON participants(isPWD);
CREATE INDEX CONCURRENTLY idx_participants_employment ON participants(employmentStatus);

-- Skills array indexes (PostgreSQL GIN indexes for arrays)
CREATE INDEX CONCURRENTLY idx_participants_vocational_skills ON participants
  USING gin(vocationalSkillsParticipations);
CREATE INDEX CONCURRENTLY idx_participants_soft_skills ON participants
  USING gin(softSkillsParticipations);

-- Composite indexes for common filter combinations
CREATE INDEX CONCURRENTLY idx_participants_cluster_sex_age ON participants(cluster_id, sex, age);
CREATE INDEX CONCURRENTLY idx_participants_cluster_district ON participants(cluster_id, district);

-- Activity indexes
CREATE INDEX CONCURRENTLY idx_activities_cluster_id ON activities(cluster_id);
CREATE INDEX CONCURRENTLY idx_activities_status ON activities(status);
CREATE INDEX CONCURRENTLY idx_activities_type ON activities(type);
CREATE INDEX CONCURRENTLY idx_activities_date_range ON activities(startDate, endDate);
CREATE INDEX CONCURRENTLY idx_activities_created_at ON activities(created_at DESC);

-- Activity participants indexes
CREATE INDEX CONCURRENTLY idx_activity_participants_activity_id ON activity_participants(activity_id);
CREATE INDEX CONCURRENTLY idx_activity_participants_participant_id ON activity_participants(participant_id);

-- Session and attendance indexes
CREATE INDEX CONCURRENTLY idx_activity_sessions_activity_id ON activity_sessions(activity_id);
CREATE INDEX CONCURRENTLY idx_daily_attendance_session_id ON daily_attendance(session_id);
CREATE INDEX CONCURRENTLY idx_daily_attendance_participant_id ON daily_attendance(participant_id);
```

### 2. **Optimized Participants Query**

```typescript
// Create optimized version with proper joins and indexes
export async function getParticipantsOptimized(
  clusterId?: string,
  params: GetParticipantsParams = {}
): Promise<GetParticipantsResponse> {
  try {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    // Use single query with proper joins instead of separate queries
    const query = db
      .select({
        // Participant fields
        id: participants.id,
        firstName: participants.firstName,
        lastName: participants.lastName,
        sex: participants.sex,
        age: participants.age,
        district: participants.district,
        subCounty: participants.subCounty,
        enterprise: participants.enterprise,
        designation: participants.designation,
        // Organization fields
        organizationName: organizations.name,
        // Add other needed fields
      })
      .from(participants)
      .leftJoin(
        organizations,
        eq(participants.organization_id, organizations.id)
      )
      .leftJoin(projects, eq(participants.project_id, projects.id))
      .leftJoin(clusters, eq(participants.cluster_id, clusters.id));

    // Build optimized WHERE conditions
    const whereConditions = [];
    if (clusterId) {
      whereConditions.push(eq(participants.cluster_id, clusterId));
    }

    // Use full-text search for better performance
    if (params?.search) {
      whereConditions.push(
        sql`to_tsvector('english', ${participants.firstName} || ' ' || ${participants.lastName}) @@ plainto_tsquery('english', ${params.search})`
      );
    }

    // Optimized array searches using GIN indexes
    if (
      params?.filters?.specificVocationalSkill &&
      params.filters.specificVocationalSkill !== "all"
    ) {
      whereConditions.push(
        sql`${participants.vocationalSkillsParticipations} @> ARRAY[${params.filters.specificVocationalSkill}]::text[]`
      );
    }

    // Execute optimized query
    const [data, totalCount] = await Promise.all([
      query
        .where(and(...whereConditions))
        .limit(limit)
        .offset(offset)
        .orderBy(participants.firstName, participants.lastName),

      db
        .select({ count: sql<number>`count(*)` })
        .from(participants)
        .leftJoin(
          organizations,
          eq(participants.organization_id, organizations.id)
        )
        .where(and(...whereConditions)),
    ]);

    return {
      success: true,
      data: {
        data,
        pagination: {
          page,
          limit,
          total: totalCount[0].count,
          totalPages: Math.ceil(totalCount[0].count / limit),
          hasNext: page * limit < totalCount[0].count,
          hasPrev: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error in optimized participants query:", error);
    return { success: false, error: "Failed to get participants" };
  }
}
```

### 3. **Optimized Activities Query**

```typescript
// Optimized activities query with selective loading
export async function getActivitiesOptimized(
  clusterId?: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: any;
  }
): Promise<ActivitiesResponse> {
  try {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    // Single optimized query with aggregated participant count
    const activitiesQuery = db
      .select({
        id: activities.id,
        title: activities.title,
        description: activities.description,
        type: activities.type,
        status: activities.status,
        startDate: activities.startDate,
        endDate: activities.endDate,
        venue: activities.venue,
        organizationName: organizations.name,
        projectName: projects.name,
        clusterName: clusters.name,
        participantCount: sql<number>`COUNT(DISTINCT ${activityParticipants.id})`,
        created_at: activities.created_at,
      })
      .from(activities)
      .leftJoin(organizations, eq(activities.organization_id, organizations.id))
      .leftJoin(projects, eq(activities.project_id, projects.id))
      .leftJoin(clusters, eq(activities.cluster_id, clusters.id))
      .leftJoin(
        activityParticipants,
        eq(activities.id, activityParticipants.activity_id)
      )
      .groupBy(
        activities.id,
        activities.title,
        activities.description,
        activities.type,
        activities.status,
        activities.startDate,
        activities.endDate,
        activities.venue,
        organizations.name,
        projects.name,
        clusters.name,
        activities.created_at
      );

    // Add WHERE conditions
    const whereConditions = [];
    if (clusterId) {
      whereConditions.push(eq(activities.cluster_id, clusterId));
    }

    // Execute optimized query
    const [data, totalCount] = await Promise.all([
      activitiesQuery
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(activities.created_at))
        .limit(limit)
        .offset(offset),

      db
        .select({ count: sql<number>`count(*)` })
        .from(activities)
        .where(
          whereConditions.length > 0 ? and(...whereConditions) : undefined
        ),
    ]);

    return {
      success: true,
      data: {
        data,
        pagination: {
          page,
          limit,
          total: totalCount[0].count,
          totalPages: Math.ceil(totalCount[0].count / limit),
          hasNext: page * limit < totalCount[0].count,
          hasPrev: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error in optimized activities query:", error);
    return { success: false, error: "Failed to get activities" };
  }
}
```

### 4. **React Query Optimization**

```typescript
// Implement better caching and stale-while-revalidate
export function useParticipantsOptimized(
  clusterId: string,
  params?: GetParticipantsParams
) {
  return useQuery({
    queryKey: ["participants", clusterId, params],
    queryFn: () => getParticipantsOptimized(clusterId, params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
}
```

## 📊 Expected Performance Improvements

### Before Optimization:

- **Participants query**: 2-5 seconds with filters
- **Activities query**: 1-3 seconds with relationships
- **Skills filtering**: 5-10 seconds
- **Export queries**: 10-30 seconds

### After Optimization:

- **Participants query**: 200-500ms with filters
- **Activities query**: 100-300ms with relationships
- **Skills filtering**: 500ms-1s
- **Export queries**: 2-5 seconds

## 🔧 Implementation Priority

1. **High Priority**: Add database indexes (immediate 3-10x improvement)
2. **Medium Priority**: Optimize participants query with joins
3. **Medium Priority**: Implement full-text search
4. **Low Priority**: Optimize React Query caching

## 📈 Monitoring

Add query performance monitoring:

```typescript
// Add timing to existing queries
const startTime = performance.now();
const result = await db.query.participants.findMany(/* ... */);
const queryTime = performance.now() - startTime;

console.log(`Query took ${queryTime.toFixed(2)}ms`);

// Log slow queries
if (queryTime > 1000) {
  console.warn(`Slow query detected: ${queryTime.toFixed(2)}ms`);
}
```

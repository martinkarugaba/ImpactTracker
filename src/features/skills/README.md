# Skills Dashboard Feature

## Overview

The Skills Dashboard provides comprehensive tracking and analysis of participant
skills acquisition across the KPI Edge platform. It allows users to view,
filter, and analyze skills data for vocational, soft, and business skills.

## Features

### 1. Skills Overview Dashboard (`/dashboard/skills`)

- **Metrics Summary**
  - Total unique skills tracked
  - Total participants with skills
  - Average completion rate
  - Average certification rate
- **Skills Breakdown by Type**
  - Vocational skills count
  - Soft skills count
  - Business skills count

- **Top Skills**
  - Top 10 most popular skills
  - Participant count per skill
- **Skills Grid**
  - Card-based view of all skills
  - Filter by skill type (vocational/soft/business)
  - Search functionality
  - Quick metrics per skill

### 2. Individual Skill Details Page (`/dashboard/skills/[skillName]`)

- **Skill Header**
  - Skill name and type badge
  - Breadcrumb navigation
- **Detailed Metrics**
  - Total participants with skill
  - Participation count and rate
  - Completion count and rate
  - Certification count and rate
- **Participants Table with Tabs**
  - All Participants
  - Participations Only
  - Completions
  - Certifications
- **Participant Information**
  - Name and designation
  - Contact details
  - Demographics (sex, age)
  - Location (district, subcounty)
  - Employment status
  - Skill status badge
  - Link to participant details

## Architecture

### Directory Structure

```
src/features/skills/
├── actions/
│   ├── index.ts
│   └── skills.ts                 # Server actions for skills data
├── components/
│   ├── cards/
│   │   └── skill-summary-card.tsx    # Skill overview card
│   ├── container/
│   │   └── skills-container.tsx      # Main container with filters
│   ├── data-table/
│   │   └── skill-participants-table.tsx  # Participants table
│   └── index.ts
├── hooks/
│   └── use-skills.ts             # React Query hooks
└── types/
    └── types.ts                  # TypeScript type definitions
```

### Pages

```
src/app/dashboard/skills/
├── page.tsx                       # Main skills dashboard
└── [skillName]/
    └── page.tsx                   # Individual skill details
```

## Data Flow

### Server Actions

1. **getSkillsMetrics(clusterId?)** - Returns overall platform metrics
2. **getSkillsSummary(clusterId?, skillType?)** - Returns list of all skills
   with summary data
3. **getSkillDetails(skillName, status?, clusterId?)** - Returns detailed info
   for a specific skill including participants

### React Query Hooks

- `useSkillsMetrics(clusterId)` - Fetches skills metrics
- `useSkillsSummary(clusterId, skillType)` - Fetches skills summary
- `useSkillDetails(skillName, status, clusterId)` - Fetches skill details

### Database Queries

Skills data is extracted from the `participants` table using Drizzle ORM:

- `vocationalSkillsParticipations` (text array)
- `vocationalSkillsCompletions` (text array)
- `vocationalSkillsCertifications` (text array)
- `softSkillsParticipations` (text array)
- `softSkillsCompletions` (text array)
- `softSkillsCertifications` (text array)

## Type Definitions

### SkillType

- `vocational` - Technical and trade skills
- `soft` - Communication and interpersonal skills
- `business` - Entrepreneurship and management skills

### SkillStatus

- `participation` - Participated in skill training
- `completion` - Completed skill training
- `certification` - Certified in the skill

### Key Interfaces

- `SkillSummary` - Overview statistics for a skill
- `SkillDetails` - Detailed information including participants
- `SkillParticipant` - Participant with skill information
- `SkillsMetrics` - Platform-wide skills metrics

## Navigation

The Skills Dashboard is accessible from the main sidebar navigation under
"Skills" with the certificate icon. It appears between "Activities" and "VSLAs"
in the KPIs section.

## Permissions

Skills data respects cluster-based permissions:

- **Super Admin**: Can view all skills across all clusters
- **Cluster Manager**: Can view skills for their assigned cluster
- **Organization User**: Can view skills for their organization's cluster

## UI Components Used

- **shadcn/ui**: Card, Badge, Button, Tabs, Select, Input
- **Custom**: MetricCard, DataTable
- **Icons**: Lucide React icons (Award, Users, TrendingUp, etc.)

## Performance Considerations

- Server-side data fetching with Next.js Server Components
- React Query for client-side caching
- Suspense boundaries for progressive loading
- Optimized database queries with proper indexing
- Cluster-scoped queries to reduce data load

## Future Enhancements

Potential improvements for the skills dashboard:

1. Export functionality for skills data
2. Skills trends over time (time-series charts)
3. Skills comparison between clusters/organizations
4. Skills gap analysis
5. Skills recommendations based on participant profiles
6. Bulk skills assignment
7. Skills certification tracking with documents
8. Integration with external certification bodies

## Usage Examples

### Viewing All Skills

Navigate to `/dashboard/skills` to see the overview of all tracked skills with
filtering and search capabilities.

### Viewing Specific Skill Details

Click on any skill card or navigate to `/dashboard/skills/[skillName]` (e.g.,
`/dashboard/skills/Tailoring`) to view detailed participant information.

### Filtering Skills

Use the filter dropdowns to view only vocational, soft, or business skills. Use
the search bar to find specific skills by name.

### Analyzing Skill Status

In the skill details page, use the tabs to view participants by their skill
status (participation, completion, or certification).

## Dependencies

- Next.js 15.5.4
- React Query (TanStack Query)
- Drizzle ORM
- Lucide React (icons)
- date-fns (date formatting)
- Tailwind CSS

## Related Features

- **Participants**: Source of skills data
- **Activities**: Skills acquisition through training activities
- **Reports**: Skills can be included in custom reports

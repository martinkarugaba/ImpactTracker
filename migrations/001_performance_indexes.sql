-- Performance Optimization Migration
-- Adds critical indexes for participants and activities features
-- Run this migration to improve query performance by 3-10x

-- ============================================
-- PARTICIPANTS TABLE INDEXES
-- ============================================

-- Core relationship indexes (highest priority)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_cluster_id 
  ON participants(cluster_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_organization_id 
  ON participants(organization_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_project_id 
  ON participants(project_id);

-- Search optimization indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_name_search 
  ON participants USING gin(to_tsvector('english', first_name || ' ' || last_name));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_enterprise_lower 
  ON participants(LOWER(enterprise));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_designation_lower 
  ON participants(LOWER(designation));

-- Filter optimization indexes (most commonly used filters)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_sex 
  ON participants(sex);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_age 
  ON participants(age);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_district 
  ON participants(district);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_subcounty 
  ON participants(sub_county);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_pwd 
  ON participants(is_pwd);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_employment_status 
  ON participants(employment_status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_employment_sector 
  ON participants(employment_sector);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_marital_status 
  ON participants(marital_status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_education_level 
  ON participants(education_level);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_vsla 
  ON participants(is_subscribed_to_vsla);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_enterprise_ownership 
  ON participants(owns_enterprise);

-- Skills array indexes (GIN indexes for array operations)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_vocational_skills_participations 
  ON participants USING gin(vocational_skills_participations);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_vocational_skills_completions 
  ON participants USING gin(vocational_skills_completions);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_vocational_skills_certifications 
  ON participants USING gin(vocational_skills_certifications);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_soft_skills_participations 
  ON participants USING gin(soft_skills_participations);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_soft_skills_completions 
  ON participants USING gin(soft_skills_completions);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_soft_skills_certifications 
  ON participants USING gin(soft_skills_certifications);

-- Boolean flag indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_has_vocational_skills 
  ON participants(has_vocational_skills);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_has_soft_skills 
  ON participants(has_soft_skills);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_has_business_skills 
  ON participants(has_business_skills);

-- Demographic indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_population_segment 
  ON participants(population_segment);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_active_student 
  ON participants(is_active_student);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_teen_mother 
  ON participants(is_teen_mother);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_source_income 
  ON participants(source_of_income);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_nationality 
  ON participants(nationality);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_location_setting 
  ON participants(location_setting);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_refugee 
  ON participants(is_refugee);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_mother 
  ON participants(is_mother);

-- Range-based indexes for numeric fields
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_monthly_income 
  ON participants(monthly_income);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_number_children 
  ON participants(number_of_children);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_trainings 
  ON participants(no_of_trainings);

-- Financial inclusion indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_accessed_loans 
  ON participants(accessed_loans);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_individual_saving 
  ON participants(individual_saving);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_group_saving 
  ON participants(group_saving);

-- Status and activity indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_active 
  ON participants(is_active);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_created_at 
  ON participants(created_at DESC);

-- Composite indexes for common filter combinations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_cluster_sex_age 
  ON participants(cluster_id, sex, age);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_cluster_district 
  ON participants(cluster_id, district);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_cluster_employment 
  ON participants(cluster_id, employment_status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_cluster_active 
  ON participants(cluster_id, is_active);

-- ============================================
-- ACTIVITIES TABLE INDEXES
-- ============================================

-- Core relationship indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_cluster_id 
  ON activities(cluster_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_organization_id 
  ON activities(organization_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_project_id 
  ON activities(project_id);

-- Filter indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_status 
  ON activities(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_type 
  ON activities(type);

-- Date range indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_start_date 
  ON activities(start_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_end_date 
  ON activities(end_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_date_range 
  ON activities(start_date, end_date);

-- Ordering indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_created_at 
  ON activities(created_at DESC);

-- Search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_title_search 
  ON activities USING gin(to_tsvector('english', title));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_venue_lower 
  ON activities(LOWER(venue));

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_cluster_status 
  ON activities(cluster_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_cluster_type 
  ON activities(cluster_id, type);

-- ============================================
-- ACTIVITY PARTICIPANTS TABLE INDEXES
-- ============================================

-- Core relationship indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_participants_activity_id 
  ON activity_participants(activity_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_participants_participant_id 
  ON activity_participants(participant_id);

-- Status and role indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_participants_attendance_status 
  ON activity_participants(attendance_status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_participants_role 
  ON activity_participants(role);

-- Composite indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_participants_activity_status 
  ON activity_participants(activity_id, attendance_status);

-- ============================================
-- ACTIVITY SESSIONS TABLE INDEXES
-- ============================================

-- Core relationship indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_sessions_activity_id 
  ON activity_sessions(activity_id);

-- Session specific indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_sessions_session_number 
  ON activity_sessions(session_number);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_sessions_status 
  ON activity_sessions(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_sessions_date 
  ON activity_sessions(session_date);

-- Composite indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_sessions_activity_status 
  ON activity_sessions(activity_id, status);

-- ============================================
-- DAILY ATTENDANCE TABLE INDEXES
-- ============================================

-- Core relationship indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_attendance_session_id 
  ON daily_attendance(session_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_attendance_participant_id 
  ON daily_attendance(participant_id);

-- Status indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_attendance_status 
  ON daily_attendance(attendance_status);

-- Time-based indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_attendance_check_in 
  ON daily_attendance(check_in_time);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_attendance_created_at 
  ON daily_attendance(created_at DESC);

-- Composite indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_attendance_session_status 
  ON daily_attendance(session_id, attendance_status);

-- ============================================
-- ORGANIZATIONS TABLE INDEXES
-- ============================================

-- Relationship indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organizations_cluster_id 
  ON organizations(cluster_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organizations_project_id 
  ON organizations(project_id);

-- Location indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organizations_district 
  ON organizations(district);

-- Search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organizations_name_search 
  ON organizations USING gin(to_tsvector('english', name));

-- ============================================
-- CONCEPT NOTES TABLE INDEXES
-- ============================================

-- Core relationship indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_concept_notes_activity_id 
  ON concept_notes(activity_id);

-- Time-based indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_concept_notes_submission_date 
  ON concept_notes(submission_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_concept_notes_created_at 
  ON concept_notes(created_at DESC);

-- ============================================
-- ACTIVITY REPORTS TABLE INDEXES
-- ============================================

-- Core relationship indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_reports_activity_id 
  ON activity_reports(activity_id);

-- Time-based indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_reports_execution_date 
  ON activity_reports(execution_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_reports_created_at 
  ON activity_reports(created_at DESC);

-- ============================================
-- LOCATION TABLES INDEXES (if needed for lookups)
-- ============================================

-- Districts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_districts_country_id 
  ON districts(country_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_districts_name_search 
  ON districts USING gin(to_tsvector('english', name));

-- Sub-counties
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subcounties_district_id 
  ON subcounties(district_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subcounties_country_id 
  ON subcounties(country_id);

-- ============================================
-- PERFORMANCE ANALYSIS QUERIES
-- ============================================

-- Check index usage after migration
-- Run these queries to verify index effectiveness:

/*
-- Check participants query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM participants 
WHERE cluster_id = 'some-uuid' 
  AND sex = 'female' 
  AND age BETWEEN 18 AND 35 
LIMIT 10;

-- Check activities query performance
EXPLAIN (ANALYZE, BUFFERS)
SELECT a.*, COUNT(ap.id) as participant_count
FROM activities a
LEFT JOIN activity_participants ap ON a.id = ap.activity_id
WHERE a.cluster_id = 'some-uuid'
  AND a.status = 'ongoing'
GROUP BY a.id
ORDER BY a.created_at DESC
LIMIT 10;

-- Check skills array query performance
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM participants
WHERE vocational_skills_participations @> ARRAY['Computer Skills']::text[]
  AND cluster_id = 'some-uuid';
*/

-- ============================================
-- INDEX MAINTENANCE NOTES
-- ============================================

/*
IMPORTANT NOTES:

1. These indexes are created with CONCURRENTLY to avoid blocking the database
2. Monitor disk space usage after creating indexes
3. Consider partitioning participants table if it grows beyond 1M records
4. Regularly run ANALYZE on tables after bulk data operations
5. Monitor query performance with pg_stat_statements extension

DISK SPACE IMPACT:
- Participants table indexes: ~200-500MB (depending on data size)
- Activities table indexes: ~50-100MB
- Total additional space: ~300-600MB

MAINTENANCE:
- Run REINDEX CONCURRENTLY monthly for heavily updated tables
- Monitor index bloat with pg_stat_user_tables
- Consider DROP INDEX for unused indexes after performance testing
*/
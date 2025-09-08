-- Add sample cluster associations for existing users (if any)
-- This is optional and can be run after the application is deployed

-- Note: The clusterUsers and organizationMembers tables should already exist
-- based on the schema definitions in src/lib/db/schema.ts

-- You can manually insert associations for existing users like:
-- INSERT INTO cluster_users (cluster_id, user_id, role) 
-- VALUES ('cluster-uuid', 'user-id', 'cluster_manager');

-- INSERT INTO organization_members (organization_id, user_id, role)
-- VALUES ('org-uuid', 'user-id', 'organization_admin');

-- This file serves as a placeholder for any manual data migrations needed
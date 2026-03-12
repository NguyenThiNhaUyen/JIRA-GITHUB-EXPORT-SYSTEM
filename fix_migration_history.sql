-- Insert missing migration history records into __EFMigrationsHistory
-- This tells EF Core that these migrations are already applied to Supabase, 
-- preventing it from trying to recreate existing tables like github_repositories.

INSERT INTO public."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260131092937_AddPBLFeaturesTables', '8.0.0')
ON CONFLICT ("MigrationId") DO NOTHING;

INSERT INTO public."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260303085059_AddIntegrationApprovalWorkflow', '8.0.0')
ON CONFLICT ("MigrationId") DO NOTHING;

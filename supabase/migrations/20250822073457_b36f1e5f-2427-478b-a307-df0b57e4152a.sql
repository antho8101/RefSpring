-- Modifier le type de user_id pour accepter les Firebase UID
ALTER TABLE shopify_oauth_states ALTER COLUMN user_id TYPE text;
ALTER TABLE shopify_integrations ALTER COLUMN user_id TYPE text;
-- Supprimer temporairement les politiques RLS
DROP POLICY "Users can manage their own OAuth states" ON shopify_oauth_states;
DROP POLICY "Users can view their own integrations" ON shopify_integrations;
DROP POLICY "Users can create their own integrations" ON shopify_integrations;
DROP POLICY "Users can update their own integrations" ON shopify_integrations;
DROP POLICY "Users can delete their own integrations" ON shopify_integrations;

-- Modifier le type de user_id pour accepter les Firebase UID (text)
ALTER TABLE shopify_oauth_states ALTER COLUMN user_id TYPE text;
ALTER TABLE shopify_integrations ALTER COLUMN user_id TYPE text;

-- Recréer les politiques RLS avec le bon type
CREATE POLICY "Users can manage their own OAuth states" ON shopify_oauth_states 
FOR ALL TO authenticated 
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can view their own integrations" ON shopify_integrations 
FOR SELECT TO authenticated 
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own integrations" ON shopify_integrations 
FOR INSERT TO authenticated 
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own integrations" ON shopify_integrations 
FOR UPDATE TO authenticated 
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own integrations" ON shopify_integrations 
FOR DELETE TO authenticated 
USING (user_id = auth.uid()::text);
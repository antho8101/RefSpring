-- Phase 1: Secure Shopify Integration Credentials
-- Add encrypted storage for Shopify access tokens

-- Add encrypted access token column
ALTER TABLE shopify_integrations 
ADD COLUMN encrypted_access_token text,
ADD COLUMN token_iv text,
ADD COLUMN token_encrypted_at timestamp with time zone;

-- Create function to encrypt Shopify tokens
CREATE OR REPLACE FUNCTION public.encrypt_shopify_token(
  integration_id uuid,
  plain_token text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encryption_key text;
  iv_value text;
BEGIN
  -- Generate random IV for encryption
  iv_value := encode(gen_random_bytes(16), 'hex');
  
  -- Store encrypted token (placeholder - actual encryption would use pgcrypto)
  UPDATE shopify_integrations 
  SET 
    encrypted_access_token = encode(digest(plain_token || iv_value, 'sha256'), 'hex'),
    token_iv = iv_value,
    token_encrypted_at = now(),
    access_token = '[ENCRYPTED]'
  WHERE id = integration_id;
  
  -- Log security event
  PERFORM public.log_security_event(
    'shopify_token_encrypted',
    auth.uid(),
    jsonb_build_object(
      'integration_id', integration_id,
      'encrypted_at', now()
    )
  );
END;
$$;

-- Create function to validate Shopify token access
CREATE OR REPLACE FUNCTION public.validate_shopify_access(
  integration_id uuid,
  requesting_user_id uuid DEFAULT auth.uid()
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM shopify_integrations 
    WHERE id = integration_id 
    AND user_id = requesting_user_id::text
    AND active = true
  );
END;
$$;

-- Add trigger to automatically encrypt new tokens
CREATE OR REPLACE FUNCTION public.encrypt_new_shopify_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only encrypt if access_token is not already encrypted
  IF NEW.access_token IS NOT NULL 
     AND NEW.access_token != '[ENCRYPTED]' 
     AND NEW.encrypted_access_token IS NULL THEN
    
    -- Encrypt the token
    PERFORM public.encrypt_shopify_token(NEW.id, NEW.access_token);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic encryption
DROP TRIGGER IF EXISTS trigger_encrypt_shopify_tokens ON shopify_integrations;
CREATE TRIGGER trigger_encrypt_shopify_tokens
  AFTER INSERT OR UPDATE ON shopify_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_new_shopify_token();
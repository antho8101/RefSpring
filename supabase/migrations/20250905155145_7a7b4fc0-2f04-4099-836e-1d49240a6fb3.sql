-- Phase 1: Database Function Security Improvements

-- Update existing handle_new_user function with proper security settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Update existing update_updated_at_column function with proper security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add security audit function for sensitive operations
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  user_id uuid DEFAULT auth.uid(),
  details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This would typically log to a security_audit_logs table
  -- For now, we'll use RAISE NOTICE for visibility
  RAISE NOTICE 'SECURITY EVENT: % by user % with details %', event_type, user_id, details;
END;
$$;

-- Add function to validate affiliate creation permissions
CREATE OR REPLACE FUNCTION public.validate_affiliate_access(
  campaign_id uuid,
  requesting_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  campaign_owner uuid;
BEGIN
  -- Get campaign owner
  SELECT user_id INTO campaign_owner 
  FROM campaigns 
  WHERE id = campaign_id;
  
  -- Check if requesting user owns the campaign
  RETURN (campaign_owner = requesting_user_id);
END;
$$;

-- Add function to check suspicious activity patterns
CREATE OR REPLACE FUNCTION public.check_suspicious_activity(
  user_id uuid DEFAULT auth.uid(),
  activity_type text DEFAULT 'general'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_activities integer;
BEGIN
  -- Count recent activities (last 5 minutes)
  SELECT COUNT(*) INTO recent_activities
  FROM clicks
  WHERE created_at > (now() - interval '5 minutes')
  AND affiliate_id IN (
    SELECT id FROM affiliates WHERE user_id = check_suspicious_activity.user_id
  );
  
  -- Flag as suspicious if more than 50 activities in 5 minutes
  RETURN (recent_activities > 50);
END;
$$;
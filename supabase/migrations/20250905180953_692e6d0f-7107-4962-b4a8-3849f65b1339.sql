-- Fix security vulnerability: Allow affiliates to access their own data
-- This addresses the issue where affiliates couldn't see their own profile information

-- Add policy to allow affiliates to view their own data
CREATE POLICY "Affiliates can view their own data" 
ON public.affiliates 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add policy to allow affiliates to update their own basic profile data
-- Note: Sensitive fields like commission_rate, tracking_code should only be updateable by campaign owners
CREATE POLICY "Affiliates can update their own basic profile" 
ON public.affiliates 
FOR UPDATE 
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);

-- Add security function to validate affiliate data access
CREATE OR REPLACE FUNCTION public.validate_affiliate_data_access(affiliate_id uuid, requesting_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  affiliate_user_id uuid;
  campaign_owner_id uuid;
BEGIN
  -- Get affiliate user_id and campaign owner
  SELECT a.user_id, c.user_id INTO affiliate_user_id, campaign_owner_id
  FROM affiliates a
  JOIN campaigns c ON c.id = a.campaign_id
  WHERE a.id = affiliate_id;
  
  -- Allow access if user is the affiliate or campaign owner
  RETURN (requesting_user_id = affiliate_user_id OR requesting_user_id = campaign_owner_id);
END;
$function$;

-- Log security event for affiliate data access
CREATE OR REPLACE FUNCTION public.log_affiliate_data_access(affiliate_id uuid, access_type text)
RETURNS void
LANGUAGE plpgsql  
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.log_security_event(
    'affiliate_data_access',
    auth.uid(),
    jsonb_build_object(
      'affiliate_id', affiliate_id,
      'access_type', access_type,
      'timestamp', now()
    )
  );
END;
$function$;

-- Create trigger to prevent affiliates from modifying sensitive fields
CREATE OR REPLACE FUNCTION public.prevent_affiliate_sensitive_field_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  is_campaign_owner boolean;
BEGIN
  -- Check if current user is the campaign owner
  SELECT EXISTS (
    SELECT 1 FROM campaigns 
    WHERE id = NEW.campaign_id AND user_id = auth.uid()
  ) INTO is_campaign_owner;
  
  -- If not campaign owner, prevent changes to sensitive fields
  IF NOT is_campaign_owner THEN
    -- Preserve original values for sensitive fields
    NEW.commission_rate := OLD.commission_rate;
    NEW.tracking_code := OLD.tracking_code;
    NEW.campaign_id := OLD.campaign_id;
    NEW.stripe_account_id := OLD.stripe_account_id;
    NEW.stripe_account_status := OLD.stripe_account_status;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Apply the trigger to affiliates table
CREATE TRIGGER prevent_affiliate_sensitive_changes
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_affiliate_sensitive_field_changes();
-- Fix security vulnerability: Allow affiliates to access their own data
-- This addresses the issue where affiliates couldn't see their own profile information

-- Add policy to allow affiliates to view their own data
CREATE POLICY "Affiliates can view their own data" 
ON public.affiliates 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add policy to allow affiliates to update their own data (except sensitive fields)
CREATE POLICY "Affiliates can update their own profile" 
ON public.affiliates 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND OLD.campaign_id = NEW.campaign_id  -- Prevent changing campaign
  AND OLD.tracking_code = NEW.tracking_code  -- Prevent changing tracking code
  AND OLD.commission_rate = NEW.commission_rate  -- Prevent changing commission rate
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
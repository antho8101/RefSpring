-- Phase 2: Enhanced Security Configuration and Monitoring

-- Create comprehensive security audit table
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  event_data JSONB DEFAULT '{}',
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed BOOLEAN DEFAULT false,
  alert_sent BOOLEAN DEFAULT false
);

-- Enable RLS on security audit logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_event_type ON public.security_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON public.security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_severity ON public.security_audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at ON public.security_audit_logs(created_at);

-- Enhanced security event logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text, 
  user_id uuid DEFAULT auth.uid(), 
  details jsonb DEFAULT '{}',
  severity_level text DEFAULT 'low'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert security event with enhanced metadata
  INSERT INTO public.security_audit_logs (
    event_type,
    user_id,
    event_data,
    severity,
    ip_address,
    user_agent,
    session_id
  ) VALUES (
    event_type,
    user_id,
    COALESCE(details, '{}') || jsonb_build_object(
      'timestamp', now(),
      'function_called_from', 'log_security_event'
    ),
    COALESCE(severity_level, 'low'),
    CASE WHEN current_setting('request.headers', true) IS NOT NULL 
         THEN (current_setting('request.headers', true)::jsonb->>'cf-connecting-ip')::inet
         ELSE NULL 
    END,
    CASE WHEN current_setting('request.headers', true) IS NOT NULL 
         THEN current_setting('request.headers', true)::jsonb->>'user-agent'
         ELSE NULL 
    END,
    COALESCE((details->>'session_id')::text, gen_random_uuid()::text)
  );

  -- Log critical events immediately
  IF severity_level = 'critical' THEN
    RAISE WARNING 'CRITICAL SECURITY EVENT: % by user % with details %', 
                  event_type, user_id, details;
  END IF;
END;
$function$;

-- Enhanced affiliate access validation with security logging
CREATE OR REPLACE FUNCTION public.validate_affiliate_data_access_enhanced(
  affiliate_id uuid, 
  requesting_user_id uuid DEFAULT auth.uid(),
  log_access boolean DEFAULT true
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  affiliate_user_id uuid;
  campaign_owner_id uuid;
  has_access boolean := false;
BEGIN
  -- Get affiliate user_id and campaign owner
  SELECT a.user_id, c.user_id INTO affiliate_user_id, campaign_owner_id
  FROM affiliates a
  JOIN campaigns c ON c.id = a.campaign_id
  WHERE a.id = affiliate_id;
  
  -- Allow access if user is the affiliate or campaign owner
  has_access := (requesting_user_id = affiliate_user_id OR requesting_user_id = campaign_owner_id);
  
  -- Log access attempt if enabled
  IF log_access THEN
    IF has_access THEN
      PERFORM public.log_security_event(
        'affiliate_data_access_granted',
        requesting_user_id,
        jsonb_build_object(
          'affiliate_id', affiliate_id,
          'affiliate_user_id', affiliate_user_id,
          'campaign_owner_id', campaign_owner_id,
          'access_type', CASE 
            WHEN requesting_user_id = affiliate_user_id THEN 'self_access'
            WHEN requesting_user_id = campaign_owner_id THEN 'campaign_owner_access'
            ELSE 'unknown'
          END
        ),
        'low'
      );
    ELSE
      PERFORM public.log_security_event(
        'affiliate_data_access_denied',
        requesting_user_id,
        jsonb_build_object(
          'affiliate_id', affiliate_id,
          'affiliate_user_id', affiliate_user_id,
          'campaign_owner_id', campaign_owner_id,
          'reason', 'insufficient_permissions'
        ),
        'medium'
      );
    END IF;
  END IF;
  
  RETURN has_access;
END;
$function$;

-- Enhanced campaign ownership validation
CREATE OR REPLACE FUNCTION public.validate_campaign_ownership_enhanced(
  campaign_id uuid, 
  user_id uuid DEFAULT auth.uid(),
  log_access boolean DEFAULT true
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  campaign_owner_id uuid;
  has_ownership boolean := false;
BEGIN
  -- Get campaign owner
  SELECT campaigns.user_id INTO campaign_owner_id
  FROM campaigns 
  WHERE campaigns.id = campaign_id;
  
  has_ownership := (campaign_owner_id = user_id);
  
  -- Log access attempt if enabled
  IF log_access THEN
    IF has_ownership THEN
      PERFORM public.log_security_event(
        'campaign_ownership_validated',
        user_id,
        jsonb_build_object(
          'campaign_id', campaign_id,
          'campaign_owner_id', campaign_owner_id
        ),
        'low'
      );
    ELSE
      PERFORM public.log_security_event(
        'campaign_ownership_violation',
        user_id,
        jsonb_build_object(
          'campaign_id', campaign_id,
          'campaign_owner_id', campaign_owner_id,
          'requesting_user_id', user_id
        ),
        'high'
      );
    END IF;
  END IF;
  
  RETURN has_ownership;
END;
$function$;

-- RLS policies for security audit logs
CREATE POLICY "Security logs viewable by system admins only" 
ON public.security_audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = 'admin@refspring.com'
  )
);

-- Users can view their own security events (limited)
CREATE POLICY "Users can view their own security events" 
ON public.security_audit_logs 
FOR SELECT 
USING (
  user_id = auth.uid() 
  AND severity IN ('low', 'medium')
  AND event_type NOT LIKE '%admin%'
);

-- No direct insert/update/delete for regular users
CREATE POLICY "System only can modify security logs" 
ON public.security_audit_logs 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY "No direct updates to security logs" 
ON public.security_audit_logs 
FOR UPDATE 
USING (false);

CREATE POLICY "No direct deletes of security logs" 
ON public.security_audit_logs 
FOR DELETE 
USING (false);

-- Create function to check for suspicious activity patterns
CREATE OR REPLACE FUNCTION public.check_suspicious_activity_enhanced(
  user_id uuid DEFAULT auth.uid(), 
  activity_type text DEFAULT 'general',
  time_window_minutes integer DEFAULT 5,
  threshold integer DEFAULT 20
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  recent_activities integer;
  suspicious_events integer;
  result jsonb;
BEGIN
  -- Count recent activities
  SELECT COUNT(*) INTO recent_activities
  FROM clicks
  WHERE created_at > (now() - interval '1 minute' * time_window_minutes)
  AND affiliate_id IN (
    SELECT id FROM affiliates WHERE affiliates.user_id = check_suspicious_activity_enhanced.user_id
  );
  
  -- Count suspicious security events
  SELECT COUNT(*) INTO suspicious_events
  FROM security_audit_logs
  WHERE security_audit_logs.user_id = check_suspicious_activity_enhanced.user_id
  AND created_at > (now() - interval '1 minute' * time_window_minutes)
  AND severity IN ('high', 'critical');
  
  result := jsonb_build_object(
    'is_suspicious', (recent_activities > threshold OR suspicious_events > 0),
    'recent_activities', recent_activities,
    'suspicious_events', suspicious_events,
    'threshold', threshold,
    'time_window_minutes', time_window_minutes,
    'checked_at', now()
  );
  
  -- Log if suspicious
  IF (recent_activities > threshold OR suspicious_events > 0) THEN
    PERFORM public.log_security_event(
      'suspicious_activity_detected',
      check_suspicious_activity_enhanced.user_id,
      result,
      'high'
    );
  END IF;
  
  RETURN result;
END;
$function$;
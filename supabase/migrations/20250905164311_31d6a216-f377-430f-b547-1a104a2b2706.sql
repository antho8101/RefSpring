-- Add security monitoring functions for billing records

-- Create security audit function for billing record access
CREATE OR REPLACE FUNCTION public.log_billing_access(record_id uuid, access_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log financial data access for security monitoring
  PERFORM public.log_security_event(
    'billing_record_access', 
    auth.uid(), 
    jsonb_build_object(
      'record_id', record_id,
      'access_type', access_type,
      'timestamp', now()
    )
  );
END;
$$;

-- Create function to validate billing record ownership before sensitive operations
CREATE OR REPLACE FUNCTION public.validate_billing_record_ownership(record_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  record_owner uuid;
BEGIN
  SELECT user_id INTO record_owner 
  FROM billing_records 
  WHERE id = record_id;
  
  RETURN (record_owner = auth.uid());
END;
$$;
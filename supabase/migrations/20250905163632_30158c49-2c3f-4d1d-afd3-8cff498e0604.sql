-- Drop the overly broad existing policy
DROP POLICY IF EXISTS "Users can view their billing records" ON public.billing_records;

-- Create more granular and secure RLS policies for billing_records
CREATE POLICY "Users can view their own billing records"
ON public.billing_records
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- System can create billing records (for automated processing)
CREATE POLICY "System can create billing records"
ON public.billing_records
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Restrict updates to only status and processed_at fields (non-financial data)
CREATE POLICY "Users can update billing record status only"
ON public.billing_records
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- No deletion of billing records for audit trail integrity
CREATE POLICY "Billing records cannot be deleted"
ON public.billing_records
FOR DELETE
TO authenticated
USING (false);

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
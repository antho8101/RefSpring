-- Add remaining policies for billing_records security

-- System can create billing records (for automated processing)
CREATE POLICY "System can create billing records"
ON public.billing_records
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow limited updates (only status field changes)
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
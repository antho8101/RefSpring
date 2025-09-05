-- First, just drop the existing policy and create a more secure SELECT policy
DROP POLICY IF EXISTS "Users can view their billing records" ON public.billing_records;

CREATE POLICY "Users can view their own billing records"
ON public.billing_records
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
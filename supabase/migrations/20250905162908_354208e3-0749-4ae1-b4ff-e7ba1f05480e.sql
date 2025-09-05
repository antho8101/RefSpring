-- Drop existing policies that may be incorrectly configured
DROP POLICY IF EXISTS "Users can create affiliates for their campaigns" ON public.affiliates;
DROP POLICY IF EXISTS "Users can delete affiliates of their campaigns" ON public.affiliates;
DROP POLICY IF EXISTS "Users can update affiliates of their campaigns" ON public.affiliates;
DROP POLICY IF EXISTS "Users can view affiliates of their campaigns" ON public.affiliates;

-- Create secure RLS policies that check campaign ownership instead of direct user_id matching
CREATE POLICY "Users can view affiliates of their own campaigns"
ON public.affiliates
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = affiliates.campaign_id 
    AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create affiliates for their own campaigns"
ON public.affiliates
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = affiliates.campaign_id 
    AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update affiliates of their own campaigns"
ON public.affiliates
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = affiliates.campaign_id 
    AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete affiliates of their own campaigns"
ON public.affiliates
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = affiliates.campaign_id 
    AND campaigns.user_id = auth.uid()
  )
);

-- Add additional security function to validate campaign ownership
CREATE OR REPLACE FUNCTION public.validate_campaign_ownership(campaign_id uuid, user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM campaigns 
    WHERE id = campaign_id AND campaigns.user_id = validate_campaign_ownership.user_id
  );
END;
$$;
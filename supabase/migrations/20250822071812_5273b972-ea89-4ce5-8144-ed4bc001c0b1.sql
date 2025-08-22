-- Create table for Shopify integrations
CREATE TABLE public.shopify_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campaign_id TEXT NOT NULL,
  shop_domain TEXT NOT NULL,
  access_token TEXT NOT NULL,
  shop_info JSONB,
  settings JSONB DEFAULT '{"scriptsInstalled": false, "webhooksInstalled": false, "autoInject": true}'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(shop_domain, campaign_id)
);

-- Enable RLS
ALTER TABLE public.shopify_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own integrations" 
ON public.shopify_integrations 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own integrations" 
ON public.shopify_integrations 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own integrations" 
ON public.shopify_integrations 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own integrations" 
ON public.shopify_integrations 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_shopify_integrations_updated_at
BEFORE UPDATE ON public.shopify_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for OAuth state management
CREATE TABLE public.shopify_oauth_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state_token TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  campaign_id TEXT NOT NULL,
  shop_domain TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '10 minutes')
);

-- Enable RLS for OAuth states
ALTER TABLE public.shopify_oauth_states ENABLE ROW LEVEL SECURITY;

-- Policies for OAuth states
CREATE POLICY "Users can manage their own OAuth states" 
ON public.shopify_oauth_states 
FOR ALL 
USING (auth.uid()::text = user_id::text);

-- Index for performance
CREATE INDEX idx_shopify_integrations_user_campaign ON public.shopify_integrations(user_id, campaign_id);
CREATE INDEX idx_shopify_oauth_states_token ON public.shopify_oauth_states(state_token);
CREATE INDEX idx_shopify_oauth_states_expires ON public.shopify_oauth_states(expires_at);
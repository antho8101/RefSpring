-- Create profiles table for user data (since we're migrating auth to Supabase)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  target_url TEXT NOT NULL,
  tracking_script TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  default_commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  stripe_customer_id TEXT,
  stripe_setup_intent_id TEXT,
  stripe_payment_method_id TEXT,
  payment_configured BOOLEAN NOT NULL DEFAULT false,
  is_draft BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create affiliates table
CREATE TABLE public.affiliates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tracking_code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  stripe_account_id TEXT,
  stripe_account_status TEXT CHECK (stripe_account_status IN ('pending', 'verified', 'incomplete')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create conversions table
CREATE TABLE public.conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  commission DECIMAL(10,2) NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'suspicious')),
  verification_notes TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  webhook_validated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create clicks table
CREATE TABLE public.clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create conversion audit logs table
CREATE TABLE public.conversion_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversion_id UUID NOT NULL REFERENCES conversions(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'status_changed', 'amount_updated', 'verified', 'rejected', 'webhook_received')),
  old_value JSONB,
  new_value JSONB,
  performed_by TEXT NOT NULL, -- 'system' or user ID
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create conversion verification queue table
CREATE TABLE public.conversion_verification_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversion_id UUID NOT NULL REFERENCES conversions(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  assigned_to UUID REFERENCES auth.users(id),
  retry_count INTEGER NOT NULL DEFAULT 0,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create conversion webhooks table
CREATE TABLE public.conversion_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversion_id UUID NOT NULL REFERENCES conversions(id) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'success', 'failed', 'timeout')),
  response_code INTEGER,
  response_body TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  sent_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create billing records table
CREATE TABLE public.billing_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  period TEXT NOT NULL, -- YYYY-MM format
  total_revenue DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  commission_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  fee_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  stripe_charge_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, campaign_id, period)
);

-- Create payment distributions table
CREATE TABLE public.payment_distributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('campaign_deletion', 'monthly_payment')),
  total_revenue DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_commissions DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  platform_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  affiliate_payments JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  stripe_payment_links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_verification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_distributions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view and update their own profile" 
ON public.profiles 
FOR ALL 
USING (auth.uid() = id);

-- Create RLS policies for campaigns
CREATE POLICY "Users can view their own campaigns" 
ON public.campaigns 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns" 
ON public.campaigns 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" 
ON public.campaigns 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" 
ON public.campaigns 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for affiliates (users can manage affiliates of their campaigns)
CREATE POLICY "Users can view affiliates of their campaigns" 
ON public.affiliates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create affiliates for their campaigns" 
ON public.affiliates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update affiliates of their campaigns" 
ON public.affiliates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete affiliates of their campaigns" 
ON public.affiliates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for conversions (users can see conversions of their campaigns)
CREATE POLICY "Users can view conversions of their campaigns" 
ON public.conversions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM campaigns c 
    WHERE c.id = campaign_id AND c.user_id = auth.uid()
  )
);

CREATE POLICY "System can create conversions" 
ON public.conversions 
FOR INSERT 
WITH CHECK (true); -- Allow public insert for tracking

CREATE POLICY "Users can update conversions of their campaigns" 
ON public.conversions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM campaigns c 
    WHERE c.id = campaign_id AND c.user_id = auth.uid()
  )
);

-- Create RLS policies for clicks (allow public insert for tracking, users can view their campaign clicks)
CREATE POLICY "Users can view clicks of their campaigns" 
ON public.clicks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM campaigns c 
    WHERE c.id = campaign_id AND c.user_id = auth.uid()
  )
);

CREATE POLICY "System can create clicks" 
ON public.clicks 
FOR INSERT 
WITH CHECK (true); -- Allow public insert for tracking

-- Create RLS policies for audit logs
CREATE POLICY "Users can view audit logs of their campaign conversions" 
ON public.conversion_audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM conversions conv 
    JOIN campaigns c ON c.id = conv.campaign_id 
    WHERE conv.id = conversion_id AND c.user_id = auth.uid()
  )
);

CREATE POLICY "System can create audit logs" 
ON public.conversion_audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for other tables (user ownership through campaigns)
CREATE POLICY "Users can view verification queue of their campaigns" 
ON public.conversion_verification_queue 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM campaigns c 
    WHERE c.id = campaign_id AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view webhooks of their campaigns" 
ON public.conversion_webhooks 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM conversions conv 
    JOIN campaigns c ON c.id = conv.campaign_id 
    WHERE conv.id = conversion_id AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their billing records" 
ON public.billing_records 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their payment distributions" 
ON public.payment_distributions 
FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_affiliates_campaign_id ON affiliates(campaign_id);
CREATE INDEX idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX idx_conversions_campaign_id ON conversions(campaign_id);
CREATE INDEX idx_conversions_affiliate_id ON conversions(affiliate_id);
CREATE INDEX idx_conversions_created_at ON conversions(created_at);
CREATE INDEX idx_clicks_campaign_id ON clicks(campaign_id);
CREATE INDEX idx_clicks_affiliate_id ON clicks(affiliate_id);
CREATE INDEX idx_clicks_created_at ON clicks(created_at);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON affiliates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversions_updated_at
  BEFORE UPDATE ON conversions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
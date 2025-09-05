-- Create short_links table for URL shortening functionality
CREATE TABLE public.short_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code TEXT NOT NULL UNIQUE,
  campaign_id UUID NOT NULL,
  affiliate_id UUID NOT NULL,
  target_url TEXT NOT NULL,
  click_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_short_links_short_code ON public.short_links(short_code);
CREATE INDEX idx_short_links_campaign_affiliate ON public.short_links(campaign_id, affiliate_id);

-- Enable Row Level Security
ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;

-- Anyone can read short links (for public access)
CREATE POLICY "Short links are publicly readable" ON public.short_links
  FOR SELECT USING (true);

-- Only authenticated users can create/update short links
CREATE POLICY "Authenticated users can create short links" ON public.short_links
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update short links" ON public.short_links
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Add updated_at trigger
CREATE TRIGGER update_short_links_updated_at
  BEFORE UPDATE ON public.short_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
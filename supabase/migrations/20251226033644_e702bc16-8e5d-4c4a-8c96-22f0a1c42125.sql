-- Add price tier columns to trip_packages
ALTER TABLE public.trip_packages 
ADD COLUMN IF NOT EXISTS early_bird_price numeric,
ADD COLUMN IF NOT EXISTS early_bird_seats integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS early_bird_deadline date,
ADD COLUMN IF NOT EXISTS regular_price numeric,
ADD COLUMN IF NOT EXISTS last_call_price numeric,
ADD COLUMN IF NOT EXISTS last_call_start_date date,
ADD COLUMN IF NOT EXISTS total_seats integer DEFAULT 12,
ADD COLUMN IF NOT EXISTS booked_seats integer DEFAULT 0;

-- Create campaigns table for marketing campaigns
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('flash', 'group_deal', 'referral', 'seasonal', 'addon')),
  title TEXT NOT NULL,
  description TEXT,
  copywriting TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed', 'addon')),
  discount_value numeric,
  min_participants integer DEFAULT 1,
  max_participants integer,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  priority integer DEFAULT 0,
  badge_text TEXT,
  badge_color TEXT DEFAULT 'primary',
  applies_to_packages UUID[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trust_proofs table for credibility indicators
CREATE TABLE public.trust_proofs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proof_type TEXT NOT NULL CHECK (proof_type IN ('trip_count', 'repeat_customer', 'zero_cancelled', 'custom')),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  icon TEXT,
  display_order integer DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral_codes table
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  referrer_name TEXT NOT NULL,
  referrer_email TEXT,
  referrer_phone TEXT,
  discount_for_referrer numeric DEFAULT 0,
  discount_for_referee numeric DEFAULT 0,
  usage_count integer DEFAULT 0,
  max_usage integer,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create addon_experiences table for upsells
CREATE TABLE public.addon_experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price numeric DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  icon TEXT,
  package_ids UUID[],
  is_active BOOLEAN DEFAULT true,
  display_order integer DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addon_experiences ENABLE ROW LEVEL SECURITY;

-- Create public read policies for campaigns (everyone can see active campaigns)
CREATE POLICY "Anyone can view active campaigns" 
ON public.campaigns 
FOR SELECT 
USING (is_active = true);

-- Admin policies for campaigns
CREATE POLICY "Admins can manage campaigns" 
ON public.campaigns 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Public read for trust proofs
CREATE POLICY "Anyone can view active trust proofs" 
ON public.trust_proofs 
FOR SELECT 
USING (is_active = true);

-- Admin policies for trust proofs
CREATE POLICY "Admins can manage trust proofs" 
ON public.trust_proofs 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Public read for referral codes (to validate codes)
CREATE POLICY "Anyone can view active referral codes" 
ON public.referral_codes 
FOR SELECT 
USING (is_active = true);

-- Admin policies for referral codes
CREATE POLICY "Admins can manage referral codes" 
ON public.referral_codes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Public read for addon experiences
CREATE POLICY "Anyone can view active addon experiences" 
ON public.addon_experiences 
FOR SELECT 
USING (is_active = true);

-- Admin policies for addon experiences
CREATE POLICY "Admins can manage addon experiences" 
ON public.addon_experiences 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default trust proofs
INSERT INTO public.trust_proofs (proof_type, label, value, icon, display_order) VALUES
('trip_count', 'Total Trip', '27+', 'Map', 1),
('repeat_customer', 'Repeat Customer', '98%', 'Users', 2),
('zero_cancelled', 'Trip Cancelled', '0', 'Shield', 3);
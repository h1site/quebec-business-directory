-- Migration: Add business claims table for ownership verification
-- This allows users to claim their business listings

-- Create business_claims table
CREATE TABLE IF NOT EXISTS public.business_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Claim status
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  verification_method VARCHAR(50), -- email_domain, google_business, manual

  -- User info at time of claim
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  user_phone VARCHAR(50),

  -- Verification data
  verification_data JSONB, -- Store proof (Google Business verification, documents, etc.)
  notes TEXT, -- Admin notes

  -- Timestamps
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(business_id, user_id) -- One claim per user per business
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_business_claims_business_id ON public.business_claims(business_id);
CREATE INDEX IF NOT EXISTS idx_business_claims_user_id ON public.business_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_business_claims_status ON public.business_claims(status);

-- Add claimed_by field to businesses table
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN DEFAULT FALSE;

-- Create index for claimed businesses
CREATE INDEX IF NOT EXISTS idx_businesses_claimed ON public.businesses(is_claimed);
CREATE INDEX IF NOT EXISTS idx_businesses_claimed_by ON public.businesses(claimed_by);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_business_claims_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER business_claims_updated_at
  BEFORE UPDATE ON public.business_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_business_claims_updated_at();

-- RLS Policies for business_claims

-- Enable RLS
ALTER TABLE public.business_claims ENABLE ROW LEVEL SECURITY;

-- Users can view their own claims
CREATE POLICY "Users can view their own claims"
  ON public.business_claims
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create claims
CREATE POLICY "Users can create claims"
  ON public.business_claims
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending claims
CREATE POLICY "Users can update their own pending claims"
  ON public.business_claims
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all claims
CREATE POLICY "Admins can view all claims"
  ON public.business_claims
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt()->>'email' IN ('karpe_25@hotmail.com', 'info@h1site.com')
  );

-- Admins can update all claims
CREATE POLICY "Admins can update all claims"
  ON public.business_claims
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt()->>'email' IN ('karpe_25@hotmail.com', 'info@h1site.com')
  );

-- Function to check if email domain matches website domain
CREATE OR REPLACE FUNCTION check_email_domain_match(
  p_email VARCHAR(255),
  p_website VARCHAR(500)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_email_domain VARCHAR(255);
  v_website_domain VARCHAR(255);
BEGIN
  -- Extract domain from email (after @)
  v_email_domain := LOWER(SUBSTRING(p_email FROM '@(.*)$'));

  -- Extract domain from website (remove protocol, www, path)
  v_website_domain := LOWER(p_website);
  v_website_domain := REGEXP_REPLACE(v_website_domain, '^https?://', '');
  v_website_domain := REGEXP_REPLACE(v_website_domain, '^www\.', '');
  v_website_domain := REGEXP_REPLACE(v_website_domain, '/.*$', '');

  -- Check if domains match
  RETURN v_email_domain = v_website_domain;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-approve claim if email domain matches website
CREATE OR REPLACE FUNCTION auto_approve_claim_if_domain_match()
RETURNS TRIGGER AS $$
DECLARE
  v_business_website VARCHAR(500);
  v_domain_match BOOLEAN;
BEGIN
  -- Only process if status is pending
  IF NEW.status != 'pending' THEN
    RETURN NEW;
  END IF;

  -- Get business website
  SELECT website INTO v_business_website
  FROM public.businesses
  WHERE id = NEW.business_id;

  -- Check if website exists and domain matches
  IF v_business_website IS NOT NULL AND v_business_website != '' THEN
    v_domain_match := check_email_domain_match(NEW.user_email, v_business_website);

    IF v_domain_match THEN
      -- Auto-approve
      NEW.status := 'approved';
      NEW.verification_method := 'email_domain';
      NEW.verified_at := NOW();
      NEW.verified_by := NEW.user_id;

      -- Update business
      UPDATE public.businesses
      SET
        claimed_by = NEW.user_id,
        claimed_at = NOW(),
        is_claimed = TRUE
      WHERE id = NEW.business_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-approve on insert
CREATE TRIGGER auto_approve_business_claim
  BEFORE INSERT ON public.business_claims
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_claim_if_domain_match();

-- Comments
COMMENT ON TABLE public.business_claims IS 'Stores business ownership claims and verification status';
COMMENT ON COLUMN public.business_claims.verification_method IS 'How the claim was verified: email_domain (auto), google_business, manual';
COMMENT ON COLUMN public.business_claims.verification_data IS 'JSON data for verification proof (Google Business info, document URLs, etc.)';

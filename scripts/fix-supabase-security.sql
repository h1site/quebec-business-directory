-- =============================================================================
-- Fix Supabase Security Issues
-- =============================================================================
-- This script fixes:
-- 1. Security Definer Views -> Convert to Security Invoker
-- 2. RLS Disabled Tables -> Enable RLS with appropriate policies
-- =============================================================================

-- =============================================================================
-- PART 1: Fix Security Definer Views (convert to Security Invoker)
-- =============================================================================

-- Note: In PostgreSQL 15+, you can use: ALTER VIEW ... SET (security_invoker = true)
-- For older versions, you need to recreate the view without SECURITY DEFINER

ALTER VIEW public.act_econ_mappings_view SET (security_invoker = true);
ALTER VIEW public.businesses_enriched SET (security_invoker = true);
ALTER VIEW public.bot_visit_stats SET (security_invoker = true);
ALTER VIEW public.non_indexable_pages SET (security_invoker = true);
ALTER VIEW public.business_reviews_with_profiles SET (security_invoker = true);

-- =============================================================================
-- PART 2: Enable RLS on all public tables
-- =============================================================================

-- Reference/Lookup tables (read-only public access)
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.act_econ_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.act_econ_category_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.act_econ_main ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.main_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_business_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_service_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_service_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_accessibility_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scian_category_mapping ENABLE ROW LEVEL SECURITY;

-- Business data tables
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_service_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_accessibility_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_special_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_claims ENABLE ROW LEVEL SECURITY;

-- System/Analytics tables
ALTER TABLE public.bot_visit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_ip_tracking ENABLE ROW LEVEL SECURITY;

-- Note: spatial_ref_sys is a PostGIS system table - skip it (owned by postgres)

-- =============================================================================
-- PART 3: Create RLS Policies
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Reference/Lookup tables - Public read access (everyone can SELECT)
-- -----------------------------------------------------------------------------

CREATE POLICY "Allow public read access" ON public.business_categories
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.act_econ_codes
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.act_econ_category_mappings
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.act_econ_main
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.main_categories
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.sub_categories
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.lookup_business_sizes
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.lookup_service_languages
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.lookup_service_modes
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.lookup_certifications
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.lookup_accessibility_features
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.lookup_payment_methods
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.scian_category_mapping
    FOR SELECT USING (true);

-- Note: spatial_ref_sys is a PostGIS system table - skip it

-- -----------------------------------------------------------------------------
-- Business data tables - Public read access
-- -----------------------------------------------------------------------------

CREATE POLICY "Allow public read access" ON public.businesses
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.business_languages
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.business_service_modes
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.business_certifications
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.business_accessibility_features
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.business_payment_methods
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.business_tags
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.business_hours
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.business_special_hours
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.business_media
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.business_social_links
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.business_promotions
    FOR SELECT USING (true);

-- -----------------------------------------------------------------------------
-- Business claims - Users can only see their own claims
-- -----------------------------------------------------------------------------

CREATE POLICY "Users can view their own claims" ON public.business_claims
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own claims" ON public.business_claims
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own claims" ON public.business_claims
    FOR UPDATE USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Analytics/System tables - Service role only (no public access)
-- -----------------------------------------------------------------------------

CREATE POLICY "Service role only" ON public.bot_visit_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role only" ON public.sponsor_ip_tracking
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- VERIFICATION: Check that all issues are resolved
-- =============================================================================

-- To verify views are now using security_invoker, run:
-- SELECT viewname, viewowner FROM pg_views WHERE schemaname = 'public';

-- To verify RLS is enabled, run:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- =============================================================================
-- Fix Supabase Security Warnings
-- =============================================================================
-- This script fixes:
-- 1. Functions without fixed search_path
-- 2. Extensions in public schema (move to extensions schema)
-- 3. Overly permissive RLS policies (WITH CHECK (true) for INSERT/UPDATE/DELETE)
-- =============================================================================

-- =============================================================================
-- PART 1: Fix function search_path (set to public schema)
-- =============================================================================
-- This prevents search_path injection attacks

ALTER FUNCTION public.update_one_category SET search_path = public;
ALTER FUNCTION public.track_sponsor_impression SET search_path = public;
ALTER FUNCTION public.business_categories_sync_trigger SET search_path = public;
ALTER FUNCTION public.reset_monthly_stats SET search_path = public;
ALTER FUNCTION public.refresh_business_categories SET search_path = public;
ALTER FUNCTION public.track_cta_click SET search_path = public;
ALTER FUNCTION public.increment_sponsor_click SET search_path = public;
ALTER FUNCTION public.record_business_view SET search_path = public;
ALTER FUNCTION public.calculate_business_average_rating SET search_path = public;
ALTER FUNCTION public.cleanup_old_sponsor_ip_tracking SET search_path = public;
ALTER FUNCTION public.update_business_claims_updated_at SET search_path = public;
ALTER FUNCTION public.get_business_cta_stats SET search_path = public;
ALTER FUNCTION public.track_sponsor_click SET search_path = public;
ALTER FUNCTION public.count_business_reviews SET search_path = public;
ALTER FUNCTION public.assign_categories_from_act_econ SET search_path = public;
ALTER FUNCTION public.increment_sponsor_impression SET search_path = public;
ALTER FUNCTION public.get_sponsor_stats SET search_path = public;
ALTER FUNCTION public.get_sponsor_stats_summary SET search_path = public;
ALTER FUNCTION public.update_updated_at_column SET search_path = public;
ALTER FUNCTION public.handle_updated_at SET search_path = public;
ALTER FUNCTION public.businesses_search_vector_trigger SET search_path = public;
ALTER FUNCTION public.is_admin_ip SET search_path = public;
ALTER FUNCTION public.update_categories_batch SET search_path = public;
ALTER FUNCTION public.record_website_click SET search_path = public;

-- =============================================================================
-- PART 2: Move extensions to 'extensions' schema
-- =============================================================================
-- Note: Moving extensions can break existing queries that reference them
-- without schema qualification. This is a potentially breaking change.
-- Uncomment if you want to proceed.

-- First, create the extensions schema if it doesn't exist
-- CREATE SCHEMA IF NOT EXISTS extensions;

-- Move extensions (requires superuser/owner privileges)
-- ALTER EXTENSION pg_trgm SET SCHEMA extensions;
-- ALTER EXTENSION postgis SET SCHEMA extensions;
-- ALTER EXTENSION unaccent SET SCHEMA extensions;

-- After moving, add 'extensions' to search_path in Supabase Dashboard:
-- Settings > Database > Connection Pooling > Search path: public, extensions

-- =============================================================================
-- PART 3: Fix overly permissive RLS policies
-- =============================================================================
-- These policies use USING (true) or WITH CHECK (true) for write operations
-- which effectively bypasses RLS. We need to add proper conditions.

-- -----------------------------------------------------------------------------
-- business_reviews: Require authenticated user for inserts
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "business_reviews_insert_policy" ON public.business_reviews;
CREATE POLICY "business_reviews_insert_policy" ON public.business_reviews
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- -----------------------------------------------------------------------------
-- user_profiles: Users can only insert their own profile
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON public.user_profiles;
CREATE POLICY "user_profiles_insert_policy" ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- cta_clicks: Allow anonymous tracking (intentional - keep as is but add rate limiting note)
-- This is analytics data, public INSERT is acceptable
-- -----------------------------------------------------------------------------
-- Note: cta_clicks INSERT policy is intentionally permissive for analytics tracking

-- -----------------------------------------------------------------------------
-- cta_daily_stats: Should only be updatable by service role
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "System can update CTA daily stats" ON public.cta_daily_stats;
CREATE POLICY "Service role can manage CTA daily stats" ON public.cta_daily_stats
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- sponsor_click_tracking: Allow anonymous tracking (intentional for analytics)
-- -----------------------------------------------------------------------------
-- Note: sponsor_click_tracking INSERT policy is intentionally permissive for analytics

-- -----------------------------------------------------------------------------
-- sponsor_impression_tracking: Allow anonymous tracking (intentional for analytics)
-- -----------------------------------------------------------------------------
-- Note: sponsor_impression_tracking INSERT policy is intentionally permissive for analytics

-- -----------------------------------------------------------------------------
-- sponsor_stats: Restrict to service role only (not all authenticated users)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated can manage sponsor stats" ON public.sponsor_stats;
CREATE POLICY "Service role can manage sponsor stats" ON public.sponsor_stats
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Keep read access for authenticated users
CREATE POLICY "Authenticated can read sponsor stats" ON public.sponsor_stats
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- sponsors: Restrict management to service role (admin operations)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated can delete sponsors" ON public.sponsors;
DROP POLICY IF EXISTS "Authenticated can insert sponsors" ON public.sponsors;
DROP POLICY IF EXISTS "Authenticated can update sponsors" ON public.sponsors;

CREATE POLICY "Service role can manage sponsors" ON public.sponsors
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Keep read access for everyone (sponsors are public content)
CREATE POLICY "Anyone can read active sponsors" ON public.sponsors
    FOR SELECT
    USING (is_active = true);

-- =============================================================================
-- PART 4: Auth settings (must be done in Supabase Dashboard)
-- =============================================================================
-- Enable "Leaked Password Protection" in:
-- Supabase Dashboard > Authentication > Providers > Email > "Enable Leaked Password Protection"
-- This checks passwords against HaveIBeenPwned.org database

-- =============================================================================
-- VERIFICATION
-- =============================================================================
-- Run the Supabase linter again to verify all issues are resolved

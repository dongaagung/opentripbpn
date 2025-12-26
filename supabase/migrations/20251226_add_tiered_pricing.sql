-- Migration: Add 3-Tier Pricing System to Trip Packages
-- Created: 2025-12-26
-- Description: Adds early bird, regular, and last call pricing tiers with manual tier selection

-- =====================================================
-- 1. Add new columns to trip_packages table
-- =====================================================

ALTER TABLE public.trip_packages
  ADD COLUMN IF NOT EXISTS early_bird_price DECIMAL(12, 2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS regular_price DECIMAL(12, 2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS last_call_price DECIMAL(12, 2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS use_tiered_pricing BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS active_pricing_tier VARCHAR(20) DEFAULT 'regular';

-- Add column comments for documentation
COMMENT ON COLUMN public.trip_packages.early_bird_price IS 'Early bird pricing tier (optional)';
COMMENT ON COLUMN public.trip_packages.regular_price IS 'Regular pricing tier (default/required when using tiered pricing)';
COMMENT ON COLUMN public.trip_packages.last_call_price IS 'Last call pricing tier (optional)';
COMMENT ON COLUMN public.trip_packages.use_tiered_pricing IS 'Enable/disable tiered pricing for this package';
COMMENT ON COLUMN public.trip_packages.active_pricing_tier IS 'Currently active pricing tier: early_bird, regular, or last_call';

-- =====================================================
-- 2. Migrate existing package prices to regular_price
-- =====================================================

UPDATE public.trip_packages
SET
  regular_price = price,
  use_tiered_pricing = false,
  active_pricing_tier = 'regular'
WHERE regular_price IS NULL;

-- =====================================================
-- 3. Create pricing history/audit log table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.trip_package_pricing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.trip_packages(id) ON DELETE CASCADE,

  -- What changed
  field_changed VARCHAR(50) NOT NULL,
  old_value TEXT,
  new_value TEXT,

  -- Who and when
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  -- Additional metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for query performance
CREATE INDEX IF NOT EXISTS idx_pricing_history_package
  ON public.trip_package_pricing_history(package_id);

CREATE INDEX IF NOT EXISTS idx_pricing_history_date
  ON public.trip_package_pricing_history(changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_pricing_history_field
  ON public.trip_package_pricing_history(field_changed);

-- =====================================================
-- 4. Add database constraints
-- =====================================================

-- Ensure pricing tiers are non-negative
ALTER TABLE public.trip_packages
  ADD CONSTRAINT IF NOT EXISTS packages_early_bird_price_positive
    CHECK (early_bird_price IS NULL OR early_bird_price >= 0);

ALTER TABLE public.trip_packages
  ADD CONSTRAINT IF NOT EXISTS packages_regular_price_positive
    CHECK (regular_price IS NULL OR regular_price >= 0);

ALTER TABLE public.trip_packages
  ADD CONSTRAINT IF NOT EXISTS packages_last_call_price_positive
    CHECK (last_call_price IS NULL OR last_call_price >= 0);

-- Ensure active tier is valid
ALTER TABLE public.trip_packages
  ADD CONSTRAINT IF NOT EXISTS packages_active_tier_valid
    CHECK (active_pricing_tier IN ('early_bird', 'regular', 'last_call'));

-- =====================================================
-- 5. Create trigger function for auto-logging price changes
-- =====================================================

CREATE OR REPLACE FUNCTION public.log_pricing_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Log legacy price field changes
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    INSERT INTO public.trip_package_pricing_history
      (package_id, field_changed, old_value, new_value, changed_by)
    VALUES
      (NEW.id, 'price', OLD.price::TEXT, NEW.price::TEXT, auth.uid());
  END IF;

  -- Log early_bird_price changes
  IF OLD.early_bird_price IS DISTINCT FROM NEW.early_bird_price THEN
    INSERT INTO public.trip_package_pricing_history
      (package_id, field_changed, old_value, new_value, changed_by)
    VALUES
      (NEW.id, 'early_bird_price', OLD.early_bird_price::TEXT, NEW.early_bird_price::TEXT, auth.uid());
  END IF;

  -- Log regular_price changes
  IF OLD.regular_price IS DISTINCT FROM NEW.regular_price THEN
    INSERT INTO public.trip_package_pricing_history
      (package_id, field_changed, old_value, new_value, changed_by)
    VALUES
      (NEW.id, 'regular_price', OLD.regular_price::TEXT, NEW.regular_price::TEXT, auth.uid());
  END IF;

  -- Log last_call_price changes
  IF OLD.last_call_price IS DISTINCT FROM NEW.last_call_price THEN
    INSERT INTO public.trip_package_pricing_history
      (package_id, field_changed, old_value, new_value, changed_by)
    VALUES
      (NEW.id, 'last_call_price', OLD.last_call_price::TEXT, NEW.last_call_price::TEXT, auth.uid());
  END IF;

  -- Log active tier changes
  IF OLD.active_pricing_tier IS DISTINCT FROM NEW.active_pricing_tier THEN
    INSERT INTO public.trip_package_pricing_history
      (package_id, field_changed, old_value, new_value, changed_by)
    VALUES
      (NEW.id, 'active_pricing_tier', OLD.active_pricing_tier, NEW.active_pricing_tier, auth.uid());
  END IF;

  -- Log tiered pricing toggle
  IF OLD.use_tiered_pricing IS DISTINCT FROM NEW.use_tiered_pricing THEN
    INSERT INTO public.trip_package_pricing_history
      (package_id, field_changed, old_value, new_value, changed_by)
    VALUES
      (NEW.id, 'use_tiered_pricing', OLD.use_tiered_pricing::TEXT, NEW.use_tiered_pricing::TEXT, auth.uid());
  END IF;

  RETURN NEW;
END;
$$;

-- =====================================================
-- 6. Attach trigger to trip_packages table
-- =====================================================

DROP TRIGGER IF EXISTS log_trip_package_pricing_changes ON public.trip_packages;

CREATE TRIGGER log_trip_package_pricing_changes
  AFTER UPDATE ON public.trip_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.log_pricing_changes();

-- =====================================================
-- 7. Enable RLS on pricing history table
-- =====================================================

ALTER TABLE public.trip_package_pricing_history ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. Create RLS policies for pricing history
-- =====================================================

-- Admins can view all pricing history
DROP POLICY IF EXISTS "Admins can view pricing history" ON public.trip_package_pricing_history;
CREATE POLICY "Admins can view pricing history"
  ON public.trip_package_pricing_history FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert pricing history (auto-logging)
DROP POLICY IF EXISTS "Admins can insert pricing history" ON public.trip_package_pricing_history;
CREATE POLICY "Admins can insert pricing history"
  ON public.trip_package_pricing_history FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- No one can update or delete pricing history (immutable audit log)
-- This ensures data integrity and prevents tampering with audit trail

-- =====================================================
-- 9. Grant necessary permissions
-- =====================================================

-- Grant select on pricing history to authenticated users (filtered by RLS)
GRANT SELECT ON public.trip_package_pricing_history TO authenticated;
GRANT INSERT ON public.trip_package_pricing_history TO authenticated;

-- =====================================================
-- Migration complete
-- =====================================================

-- To verify the migration:
-- 1. Check new columns exist: SELECT * FROM trip_packages LIMIT 1;
-- 2. Check pricing history table: SELECT * FROM trip_package_pricing_history;
-- 3. Verify trigger works by updating a price
-- 4. Regenerate TypeScript types:
--    supabase gen types typescript --local > src/integrations/supabase/types.ts

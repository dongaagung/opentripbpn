-- Add visited_cities column to trip_leaders
ALTER TABLE public.trip_leaders 
ADD COLUMN visited_cities text[] DEFAULT '{}'::text[];

-- Remove old columns
ALTER TABLE public.trip_leaders 
DROP COLUMN IF EXISTS experience_years,
DROP COLUMN IF EXISTS trips_led;
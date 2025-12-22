-- Add new columns for detailed package information
ALTER TABLE public.trip_packages 
ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS target_participants TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS inclusions TEXT[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS exclusions TEXT[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS meeting_point TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS departure_time TIME DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.trip_packages.itinerary IS 'JSON array of daily itinerary items with day number, title, and activities';
COMMENT ON COLUMN public.trip_packages.target_participants IS 'Target audience description (e.g., family, solo traveler, couples)';
COMMENT ON COLUMN public.trip_packages.inclusions IS 'What is included in the package';
COMMENT ON COLUMN public.trip_packages.exclusions IS 'What is NOT included in the package';
COMMENT ON COLUMN public.trip_packages.meeting_point IS 'Meeting point for departure';
COMMENT ON COLUMN public.trip_packages.departure_time IS 'Departure time';
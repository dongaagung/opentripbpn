-- Add database constraints for input validation as defense layer

-- Gallery table constraints
ALTER TABLE public.gallery 
  ADD CONSTRAINT gallery_title_length CHECK (char_length(title) <= 200),
  ADD CONSTRAINT gallery_description_length CHECK (description IS NULL OR char_length(description) <= 2000),
  ADD CONSTRAINT gallery_file_url_length CHECK (char_length(file_url) <= 2000),
  ADD CONSTRAINT gallery_category_length CHECK (category IS NULL OR char_length(category) <= 100);

-- Trip packages table constraints  
ALTER TABLE public.trip_packages
  ADD CONSTRAINT packages_title_length CHECK (char_length(title) <= 200),
  ADD CONSTRAINT packages_destination_length CHECK (char_length(destination) <= 200),
  ADD CONSTRAINT packages_description_length CHECK (description IS NULL OR char_length(description) <= 5000),
  ADD CONSTRAINT packages_cover_url_length CHECK (cover_image_url IS NULL OR char_length(cover_image_url) <= 2000),
  ADD CONSTRAINT packages_price_positive CHECK (price >= 0),
  ADD CONSTRAINT packages_duration_positive CHECK (duration_days > 0),
  ADD CONSTRAINT packages_seats_positive CHECK (available_seats IS NULL OR available_seats >= 0);

-- Testimonials table constraints
ALTER TABLE public.testimonials
  ADD CONSTRAINT testimonials_name_length CHECK (char_length(customer_name) <= 100),
  ADD CONSTRAINT testimonials_text_length CHECK (char_length(testimonial_text) <= 2000),
  ADD CONSTRAINT testimonials_destination_length CHECK (trip_destination IS NULL OR char_length(trip_destination) <= 200),
  ADD CONSTRAINT testimonials_photo_url_length CHECK (customer_photo_url IS NULL OR char_length(customer_photo_url) <= 2000),
  ADD CONSTRAINT testimonials_rating_range CHECK (rating >= 1 AND rating <= 5);

-- Profiles table constraints
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_fullname_length CHECK (full_name IS NULL OR char_length(full_name) <= 200),
  ADD CONSTRAINT profiles_avatar_url_length CHECK (avatar_url IS NULL OR char_length(avatar_url) <= 2000);
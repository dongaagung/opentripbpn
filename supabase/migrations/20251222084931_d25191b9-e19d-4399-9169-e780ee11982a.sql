-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create trip_packages table
CREATE TABLE public.trip_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 5,
    price DECIMAL(12, 2) NOT NULL,
    description TEXT,
    highlights TEXT[] DEFAULT '{}',
    cover_image_url TEXT,
    available_seats INTEGER DEFAULT 20,
    start_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_packages ENABLE ROW LEVEL SECURITY;

-- Create gallery table
CREATE TABLE public.gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'image',
    category TEXT DEFAULT 'General',
    tags TEXT[] DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Create testimonials table
CREATE TABLE public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_photo_url TEXT,
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    testimonial_text TEXT NOT NULL,
    trip_destination TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for media
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Storage policies
CREATE POLICY "Public can view media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Admins can upload media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete media"
ON storage.objects FOR DELETE
USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles (only admins can manage)
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for trip_packages
CREATE POLICY "Anyone can view active packages"
ON public.trip_packages FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage packages"
ON public.trip_packages FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for gallery
CREATE POLICY "Anyone can view published gallery"
ON public.gallery FOR SELECT
USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage gallery"
ON public.gallery FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for testimonials
CREATE POLICY "Anyone can view published testimonials"
ON public.testimonials FOR SELECT
USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage testimonials"
ON public.testimonials FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trip_packages_updated_at
  BEFORE UPDATE ON public.trip_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gallery_updated_at
  BEFORE UPDATE ON public.gallery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
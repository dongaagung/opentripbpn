
-- Table for FAQs
CREATE TABLE public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Policies for FAQs
CREATE POLICY "Anyone can view published FAQs" 
ON public.faqs 
FOR SELECT 
USING (is_published = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage FAQs" 
ON public.faqs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Table for Hero Stats
CREATE TABLE public.hero_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active hero stats" 
ON public.hero_stats 
FOR SELECT 
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage hero stats" 
ON public.hero_stats 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Table for Trip Leader Profile
CREATE TABLE public.trip_leaders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT NOT NULL,
  photo_url TEXT,
  experience_years INTEGER DEFAULT 0,
  trips_led INTEGER DEFAULT 0,
  languages TEXT[] DEFAULT '{}'::text[],
  specialties TEXT[] DEFAULT '{}'::text[],
  philosophy TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_leaders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active trip leaders" 
ON public.trip_leaders 
FOR SELECT 
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage trip leaders" 
ON public.trip_leaders 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Table for Comparison Items (WhyUs Section)
CREATE TABLE public.comparison_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  our_way_title TEXT NOT NULL,
  our_way_description TEXT NOT NULL,
  our_way_icon TEXT DEFAULT 'check',
  other_way_title TEXT NOT NULL,
  other_way_description TEXT NOT NULL,
  other_way_icon TEXT DEFAULT 'x',
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.comparison_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published comparison items" 
ON public.comparison_items 
FOR SELECT 
USING (is_published = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage comparison items" 
ON public.comparison_items 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_faqs_updated_at
BEFORE UPDATE ON public.faqs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trip_leaders_updated_at
BEFORE UPDATE ON public.trip_leaders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample FAQs data
INSERT INTO public.faqs (question, answer, display_order) VALUES
('Apakah aman ikut open trip dengan orang yang belum dikenal?', 'Sangat aman! Kami selalu melakukan screening peserta dan membuat grup WhatsApp sebelum keberangkatan. 90% peserta kami justru mendapat teman baru yang lasting. Trip leader kami juga selalu memastikan semua peserta nyaman dan terkoneksi.', 1),
('Saya tidak bisa bahasa Jepang, apakah akan kesulitan?', 'Tidak sama sekali! Trip leader kami fasih berbahasa Jepang dan akan mendampingi di setiap aktivitas. Kami juga menyediakan pocket guide dengan frasa-frasa penting yang berguna selama perjalanan.', 2),
('Apakah ada biaya tambahan yang tersembunyi?', 'Tidak ada hidden cost. Semua biaya yang termasuk dan tidak termasuk kami jelaskan dengan transparan di setiap paket. Yang perlu kamu siapkan sendiri hanya: tiket pesawat, belanja pribadi, dan beberapa makanan yang tidak termasuk dalam paket.', 3),
('Bagaimana jika saya ingin explore sendiri di waktu tertentu?', 'Tentu boleh! Itinerary kami fleksibel. Ada waktu-waktu free time yang bisa kamu gunakan untuk explore sendiri. Trip leader akan memberikan rekomendasi tempat dan cara transportasi yang aman.', 4),
('Berapa lama sebelum keberangkatan saya harus mendaftar?', 'Idealnya 2-3 bulan sebelum keberangkatan untuk mendapatkan harga tiket pesawat terbaik. Namun, selama kuota masih tersedia, kamu masih bisa mendaftar hingga 3 minggu sebelum keberangkatan.', 5),
('Apakah bisa request itinerary custom?', 'Untuk group private (minimal 6 orang), kami bisa membuat itinerary custom sesuai keinginan kalian. Hubungi kami untuk konsultasi gratis!', 6);

-- Insert sample Hero Stats
INSERT INTO public.hero_stats (label, value, display_order) VALUES
('Peserta Happy', '500+', 1),
('Trip Sukses', '50+', 2),
('Rating', '4.9★', 3);

-- Insert sample Trip Leader
INSERT INTO public.trip_leaders (name, role, bio, experience_years, trips_led, languages, specialties, philosophy, is_primary) VALUES
('Yuki Tanaka', 'Founder & Lead Trip Leader', 'Lahir dan besar di Jakarta, tapi jatuh cinta dengan Jepang sejak pertama kali menginjakkan kaki di Tokyo tahun 2015. Setelah tinggal 3 tahun di Osaka untuk kuliah, saya memutuskan untuk berbagi pengalaman dan pengetahuan tentang Jepang yang "sesungguhnya" - bukan yang ada di brosur travel biasa.', 8, 50, ARRAY['Indonesia', 'Jepang', 'Inggris'], ARRAY['Hidden Gems', 'Street Food', 'Culture', 'Photography'], 'Saya percaya travel bukan tentang berapa banyak tempat yang dikunjungi, tapi seberapa dalam kita merasakan setiap momen. Di setiap trip, saya ingin peserta pulang bukan hanya dengan foto, tapi dengan cerita dan teman baru.', true);

-- Insert sample Comparison Items
INSERT INTO public.comparison_items (category, our_way_title, our_way_description, our_way_icon, other_way_title, other_way_description, other_way_icon, display_order) VALUES
('Experience', 'Local Experience', 'Makan di izakaya favorit warga lokal, jalan-jalan di gang tersembunyi, ngobrol dengan orang Jepang asli', 'heart', 'Tourist Trap', 'Makan di restoran turis, foto di spot mainstream yang penuh sesak', 'users', 1),
('Group Size', 'Max 12 Orang', 'Intimate group, semua bisa kenal, trip leader bisa perhatikan satu-satu', 'users', '30-40 Orang', 'Grup besar, seperti rombongan, susah koordinasi', 'users', 2),
('Transport', 'Transportasi Publik', 'Naik kereta seperti warga lokal, fleksibel, bisa explore lebih', 'train', 'Bus Pariwisata', 'Terjebak di bus, rute terbatas, pengalaman standar', 'bus', 3),
('Pace', 'Santai & Mindful', 'Waktu untuk menikmati, foto, dan meresapi setiap tempat', 'coffee', 'Kejar Setoran', '15 menit per spot, foto buru-buru, lanjut ke tempat berikutnya', 'clock', 4),
('Guide', 'Trip Leader = Teman', 'Berbagi pengalaman, rekomendasi personal, available 24/7', 'heart', 'Tour Guide Formal', 'Baca script, tidak personal, jam kerja terbatas', 'briefcase', 5),
('Flexibility', 'Itinerary Fleksibel', 'Ada waktu free time, bisa request, menyesuaikan mood grup', 'shuffle', 'Jadwal Kaku', 'Tidak bisa diubah, harus ikut semua agenda', 'lock', 6);

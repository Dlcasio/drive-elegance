
-- Roles enum + user_roles table (security best practice)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Brands
CREATE TABLE public.brands (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  country TEXT
);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Cars
CREATE TABLE public.cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id INT REFERENCES public.brands(id),
  model TEXT NOT NULL,
  year INT NOT NULL,
  price NUMERIC NOT NULL,
  mileage INT,
  fuel_type TEXT CHECK (fuel_type IN ('petrol','diesel','electric','hybrid')),
  transmission TEXT CHECK (transmission IN ('automatic','manual')),
  body_type TEXT,
  color TEXT,
  engine_cc INT,
  power_hp INT,
  torque_nm INT,
  seats INT,
  drive_type TEXT,
  description TEXT,
  primary_image_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  views INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.car_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);
ALTER TABLE public.car_images ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.car_features (
  id SERIAL PRIMARY KEY,
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  feature TEXT NOT NULL
);
ALTER TABLE public.car_features ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, car_id)
);
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','replied','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "roles_admin_all" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- brands: public read, admin write
CREATE POLICY "brands_public_read" ON public.brands FOR SELECT USING (true);
CREATE POLICY "brands_admin_write" ON public.brands FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- cars
CREATE POLICY "cars_public_read" ON public.cars FOR SELECT USING (true);
CREATE POLICY "cars_admin_write" ON public.cars FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- car_images
CREATE POLICY "car_images_public_read" ON public.car_images FOR SELECT USING (true);
CREATE POLICY "car_images_admin_write" ON public.car_images FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- car_features
CREATE POLICY "car_features_public_read" ON public.car_features FOR SELECT USING (true);
CREATE POLICY "car_features_admin_write" ON public.car_features FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- wishlists
CREATE POLICY "wishlists_own" ON public.wishlists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- bookings
CREATE POLICY "bookings_insert_any" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "bookings_select_own" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookings_admin_all" ON public.bookings FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- inquiries
CREATE POLICY "inquiries_insert_any" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "inquiries_select_own" ON public.inquiries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "inquiries_admin_all" ON public.inquiries FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

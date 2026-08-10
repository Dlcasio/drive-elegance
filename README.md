# Drive Elegance

🚗 Car Store Website — Full-Stack Development Prompt

Budget: $400 | Stack: React + Supabase + Tailwind CSS (or custom CSS) | Goal: A stunning, conversion-optimized car dealership website with full authentication and real-time database.

🎯 Project Overview

Build a premium car dealership website called "VELOCE Motors" (or rebrand as needed). The site targets car buyers and admins managing inventory. It must feel like a luxury automotive brand — think Tesla meets Genesis meets Rolls-Royce digital showroom. Dark, cinematic, and immersive.

🎨 Design Direction

Aesthetic

Theme: Dark luxury / Cinematic automotive

Primary Color: Deep charcoal black #0A0A0C

Accent Color: Molten gold / amber #C9A84C with electric red #E02020 for CTAs

Secondary: Cool steel gray #1C1C22 for cards/surfaces

Text: Off-white #F0EDE8 and muted #8A8A96

Font Pairing:

Display: Bebas Neue or Monument Extended — for headings, hero section

Body: DM Sans or Neue Haas Grotesk — for readable body text

Mono accents: JetBrains Mono — for specs/numbers

Visual Language

Full-bleed hero with animated 3D car model (Three.js or Spline embed)

Cinematic parallax layers on scroll

Glassmorphism cards with subtle border glow

Grain texture overlay across the site for depth

Section dividers using diagonal cuts or angled backgrounds

Custom cursor: a small gold dot that scales on hover

✨ Scroll, Hover & Toggle Effects

Scroll Effects

Section Effect Hero Car rotates 360° on Y-axis as user scrolls down Features Cards slide in from left/right alternately (Intersection Observer) Gallery Horizontal scroll carousel triggered by vertical scroll Stats Counter numbers animate up when scrolled into view Testimonials Fade and translate up sequentially Footer Background color shifts from dark to deep navy on approach

Hover Effects

Car cards: 3D tilt effect (CSS perspective + JS mouse tracking), gold glow border appears, "View Car" button slides up from bottom

Navigation links: Underline slides in from left with gold color

CTA buttons: Shimmer/glint sweep animation across button surface

Gallery images: Scale up with blur on siblings (focus effect)

Social icons: Rotate 15° and change color on hover

Price tag: Background flashes briefly to gold on hover

Toggle Effects

Dark/Light Mode toggle: Smooth transition with CSS variables swap + sun/moon morphing icon

Filter toggles (on inventory page): Pill buttons that fill with gradient on select

Accordion FAQ: Smooth expand/collapse with rotating chevron

Mobile nav: Full-screen overlay slides in from right with staggered link animations

Compare Cars: Toggle compare mode — selected cars slide into a comparison tray at the bottom

🗂️ Pages & Sections

1. 🏠 Home / Landing Page

Hero Section

Full-viewport dark hero

Animated headline: "DRIVE SOMETHING EXTRAORDINARY" (letter-by-letter reveal)

3D rotating car (Three.js / Spline embed / Lottie animation)

Two CTAs: Explore Inventory (primary) + Book a Test Drive (ghost)

Scroll indicator: animated arrow + "SCROLL" label

Brand Strip: Logos of featured car brands (BMW, Mercedes, Audi, Toyota, Ford) — horizontal marquee

Featured Cars Section

3-column grid of car cards

Each card: car image, name, year, price, fuel type, mileage badges

Hover: 3D tilt + glow + "Quick View" modal trigger

Why Choose Us / Stats

4 animated counters: 500+ Cars, 12 Years, 98% Satisfied, 50+ Brands

Glassmorphism stat cards

How It Works (3-step process)

Browse → Test Drive → Drive Home

Icon + short text + connecting animated line

Testimonials Carousel

Auto-play with manual controls

Star ratings, customer photo, name, quote

Newsletter CTA Banner

Full-width diagonal section

Email input + subscribe button

2. 🚘 Inventory / Car Listings Page

Sidebar Filters:

Brand (multi-select checkboxes)

Price range (dual-handle slider)

Year range

Fuel type (toggle pills: Petrol, Diesel, Electric, Hybrid)

Transmission (Auto / Manual)

Body type (Sedan, SUV, Coupe, etc.)

Mileage range

Color (visual color dot selectors)

Listings Grid:

Toggle between Grid view and List view

Sort by: Price, Year, Mileage, Newest

Car card: image carousel (swipeable), specs badges, wishlist heart icon, compare checkbox

Lazy loading + skeleton loading state

Comparison Tray (sticky bottom bar when ≥2 cars selected)

3. 🔍 Single Car Detail Page

Full-width image gallery with thumbnail strip + fullscreen lightbox

360° view toggle (if 360 images available)

Specs Table: Engine, Power, Torque, Transmission, Fuel, Mileage, Seats, Drive Type

Feature Highlights: Animated icon list

Pricing Card: Price, EMI calculator, "Book Now" + "Test Drive" buttons

Similar Cars section (horizontal scroll)

Inquiry Form (connected to Supabase)

4. 📅 Book a Test Drive Page

Date & time picker

Car selection dropdown (pre-filled if coming from a car page)

Personal details form

Confirmation screen with animated checkmark

5. 💰 Finance / EMI Calculator Page

Interactive sliders: Car price, Down payment, Interest rate, Loan tenure

Real-time EMI breakdown chart (Recharts or Chart.js)

Breakdown table: Principal, Interest, Total

6. 📞 Contact Page

Split layout: Contact form (left) + Map embed + office details (right)

Social links with hover effects

FAQ accordion section

7. 🔐 Auth Pages

Login Page: Minimal, centered card on dark gradient background. Email + password. Google OAuth button. "Forgot password" link.

Register Page: Same aesthetic. Name, email, password, confirm password. Role selection hidden (users register as user, admins are set manually in Supabase).

Forgot Password / Reset Password pages

8. 👤 User Dashboard (/dashboard)

Profile: Edit name, email, phone, avatar upload

My Wishlist: Saved/favorited cars grid

My Inquiries: List of submitted inquiries with status

Test Drive Bookings: Upcoming and past bookings

Notifications: System alerts

9. 🛠️ Admin Panel (/admin)

Overview Dashboard: Stats cards — total cars, total users, bookings today, inquiries

Car Management (CRUD):

Add car form (all fields + multiple image upload to Supabase Storage)

Edit car

Delete car (with confirmation modal)

Toggle featured status

Toggle availability

Booking Management: View all test drive bookings, update status (Pending → Confirmed → Completed → Cancelled)

Inquiry Management: View and reply to inquiries, mark as resolved

User Management: View all users, promote/demote admin role, ban users

Analytics: Basic charts — cars by brand, bookings per month, top-viewed cars

🗃️ Supabase Database Schema

-- Users (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Car Brands
CREATE TABLE brands (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  country TEXT
);

-- Cars
CREATE TABLE cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id INT REFERENCES brands(id),
  model TEXT NOT NULL,
  year INT NOT NULL,
  price NUMERIC NOT NULL,
  mileage INT,
  fuel_type TEXT CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid')),
  transmission TEXT CHECK (transmission IN ('automatic', 'manual')),
  body_type TEXT,
  color TEXT,
  engine_cc INT,
  power_hp INT,
  torque_nm INT,
  seats INT,
  drive_type TEXT,
  description TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  views INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Car Images
CREATE TABLE car_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0
);

-- Car Features
CREATE TABLE car_features (
  id SERIAL PRIMARY KEY,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  feature TEXT NOT NULL
);

-- Wishlists
CREATE TABLE wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, car_id)
);

-- Test Drive Bookings
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  car_id UUID REFERENCES cars(id),
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inquiries
CREATE TABLE inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  car_id UUID REFERENCES cars(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'replied', 'closed')),
  admin_reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


Supabase RLS Policies (Key Rules)

profiles: Users can read/update their own profile. Admins can read all.

cars: Public read. Only admins can insert/update/delete.

car_images: Public read. Admin write.

wishlists: Users can CRUD only their own rows.

bookings: Users can read/insert their own. Admins can read/update all.

inquiries: Users can insert + read their own. Admins can read/update all.

notifications: Users can read/update their own only.

Supabase Storage Buckets

car-images — public bucket for car photos

avatars — public bucket for user profile pictures

🔐 Authentication & Authorization

Auth Flow (Supabase Auth)

Sign Up → Supabase creates auth.users entry → trigger creates profiles row with role = 'user'

Login → Supabase session + JWT → store in context

Google OAuth → Supabase handles, same trigger fires

Protected Routes → React Router + auth guard HOC

Admin Check → read profiles.role === 'admin' after session load

Password Reset → Supabase resetPasswordForEmail() + redirect to reset page

Route Guards

/dashboard/* → must be logged in (any role)
/admin/*     → must be logged in AND role === 'admin'


Supabase Auth Trigger (auto-create profile)

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


🛠️ Tech Stack

Layer Technology Frontend Framework React 18 + Vite Styling Tailwind CSS v3 + custom CSS animations Routing React Router v6 State Management Zustand (lightweight global store) Backend / DB Supabase (Postgres + Auth + Storage + Realtime) 3D / Animation Three.js (hero car) + GSAP (scroll animations) Charts Recharts (admin analytics) Form Handling React Hook Form + Zod validation Image Upload Supabase Storage SDK Date Picker React Day Picker Icons Lucide React Notifications React Hot Toast SEO React Helmet Async Deployment Vercel (free tier)

📦 Component Structure

src/
├── assets/           # Static images, fonts, icons
├── components/
│   ├── ui/           # Button, Input, Modal, Badge, Skeleton, etc.
│   ├── layout/       # Navbar, Footer, Sidebar
│   ├── cars/         # CarCard, CarGrid, CarFilter, CarGallery
│   ├── auth/         # LoginForm, RegisterForm, AuthGuard
│   ├── admin/        # AdminSidebar, CarForm, BookingTable
│   └── home/         # Hero, FeaturedCars, Stats, Testimonials
├── pages/
│   ├── Home.jsx
│   ├── Inventory.jsx
│   ├── CarDetail.jsx
│   ├── BookTestDrive.jsx
│   ├── Finance.jsx
│   ├── Contact.jsx
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── ResetPassword.jsx
│   ├── dashboard/
│   │   ├── Profile.jsx
│   │   ├── Wishlist.jsx
│   │   ├── Bookings.jsx
│   │   └── Inquiries.jsx
│   └── admin/
│       ├── Dashboard.jsx
│       ├── ManageCars.jsx
│       ├── ManageBookings.jsx
│       ├── ManageInquiries.jsx
│       └── ManageUsers.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useCars.js
│   ├── useWishlist.js
│   └── useAdmin.js
├── lib/
│   ├── supabase.js    # Supabase client init
│   └── utils.js       # Formatters, helpers
├── store/
│   └── authStore.js   # Zustand auth store
└── styles/
    ├── globals.css    # CSS variables, resets, animations
    └── animations.css # GSAP + scroll keyframes


🎬 Key Animations to Implement

Hero Car Rotation (GSAP + ScrollTrigger)

gsap.to(carModel.rotation, {
  y: Math.PI * 2,
  scrollTrigger: {
    trigger: "#hero",
    start: "top top",
    end: "bottom top",
    scrub: 1.5,
  }
});


Section Entrance (Intersection Observer)

// Cards slide in alternately from left and right
gsap.fromTo(".feature-card:nth-child(odd)", 
  { x: -80, opacity: 0 },
  { x: 0, opacity: 1, scrollTrigger: { trigger: ".features", scrub: true } }
);


Counter Animation

gsap.from(".stat-number", {
  textContent: 0,
  duration: 2,
  snap: { textContent: 1 },
  scrollTrigger: { trigger: ".stats-section", start: "top 80%" }
});


Card 3D Tilt (Vanilla JS)

card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  card.style.transform = `perspective(800px) rotateX(${-y * 12}deg) rotateY(${x * 12}deg)`;
});


💡 UX Requirements

Performance: Lazy load all images, code-split by route, skeleton screens on all data loads

Accessibility: ARIA labels, keyboard navigation, focus rings, color contrast AA compliant

Responsive: Mobile-first. Fully functional on 320px → 1920px

Empty States: Beautiful illustrated empty states for wishlist, no search results, etc.

Error Handling: Graceful error boundaries, user-friendly toast notifications

Loading States: Shimmer skeleton for car cards, spinner for forms

Toast Notifications: Success/error/info toasts for all async actions

Confirmation Dialogs: For destructive actions (delete car, cancel booking)

Form Validation: Inline validation with clear error messages

📋 Development Phases & Budget Allocation

Phase Tasks Estimated Cost Phase 1 — Setup & Auth Project scaffolding, Supabase setup, auth pages, route guards $50 Phase 2 — Core UI Navbar, footer, home page, hero animation, car cards $80 Phase 3 — Inventory Filter sidebar, car grid, pagination, car detail page $70 Phase 4 — Features Booking form, EMI calculator, contact page, wishlist $60 Phase 5 — Dashboard User dashboard (profile, wishlist, bookings, inquiries) $50 Phase 6 — Admin Panel Full CRUD, analytics, user management $60 Phase 7 — Polish Animations, effects, responsive fixes, SEO, testing $30 Total $400

🚀 Deployment Checklist

[ ] Set Supabase URL + anon key in .env

[ ] Enable Google OAuth in Supabase dashboard

[ ] Set up RLS policies for all tables

[ ] Create storage buckets and set public access policies

[ ] Deploy to Vercel — connect GitHub repo

[ ] Set env vars in Vercel dashboard

[ ] Test auth flow end-to-end

[ ] Seed database with sample car data

[ ] Run Lighthouse audit — target 90+ score

📝 Sample .env File

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME=VELOCE Motors
VITE_APP_URL=https://yourdomain.com


This prompt is complete and self-contained. Hand it to any developer or AI coding assistant to build the full car store website within the $400 budget.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0b92182c-c874-4c68-b8fd-bd22f915cc31).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronDown, Sparkles, Award, Users, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CarCard, type CarCardData } from "@/components/cars/CarCard";
import { heroCarImage } from "@/lib/car-images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VELOCE Motors — Drive Something Extraordinary" },
      { name: "description", content: "Curated luxury and performance cars. Hand-selected, fully inspected." },
    ],
  }),
  component: Home,
});

const stats = [
  { value: "500+", label: "Cars Curated", icon: Sparkles },
  { value: "12", label: "Years of Craft", icon: Award },
  { value: "98%", label: "Satisfaction", icon: Users },
  { value: "50+", label: "Premium Brands", icon: Wrench },
];

const brands = ["Rolls-Royce", "Ferrari", "Porsche", "Mercedes-Benz", "BMW", "Audi", "Tesla", "Lamborghini"];

function Home() {
  const { data: featured } = useQuery({
    queryKey: ["cars", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("id, model, year, price, mileage, fuel_type, transmission, primary_image_url, brand:brands(name)")
        .eq("is_featured", true)
        .limit(6);
      if (error) throw error;
      return data as unknown as CarCardData[];
    },
  });

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[100vh] grain overflow-hidden flex items-end pb-16 pt-32">
        <div className="absolute inset-0">
          <img
            src={heroCarImage}
            alt="Luxury sports coupe in dark showroom"
            className="size-full object-cover opacity-95"
            width={1920}
            height={1280}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
          <div className="absolute inset-0 gradient-radial-spot" />
        </div>

        <div className="relative mx-auto max-w-7xl w-full px-6">
          <div className="max-w-3xl animate-fade-up">
            <div className="text-xs font-mono uppercase tracking-[0.4em] text-gold mb-6">
              — Curated Automotive Excellence
            </div>
            <h1 className="font-display text-[clamp(3rem,9vw,9rem)] leading-[0.85] tracking-tight">
              DRIVE<br />
              <span className="text-gold">SOMETHING</span><br />
              EXTRAORDINARY
            </h1>
            <p className="mt-8 max-w-xl text-base text-muted-foreground">
              A private showroom of the world's most exceptional vehicles — handpicked, fully inspected, delivered to your door.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/inventory"
                className="shimmer inline-flex items-center gap-2 bg-gold text-[oklch(0.12_0.005_270)] px-7 py-4 font-semibold uppercase tracking-widest text-sm hover:bg-gold/90 transition"
              >
                Explore Inventory <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 border border-foreground/30 px-7 py-4 font-semibold uppercase tracking-widest text-sm hover:border-gold hover:text-gold transition"
              >
                Book a Test Drive
              </Link>
            </div>
          </div>

          <div className="absolute right-6 bottom-8 hidden md:flex flex-col items-center gap-2 text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground">
            Scroll
            <ChevronDown className="size-4 animate-bounce text-gold" />
          </div>
        </div>
      </section>

      {/* Brand strip */}
      <section className="border-y border-border py-8 overflow-hidden bg-surface">
        <div className="marquee whitespace-nowrap">
          {[...brands, ...brands].map((b, i) => (
            <span key={i} className="font-display text-3xl tracking-[0.25em] text-foreground/40 hover:text-gold transition-colors">
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="py-28 mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.4em] text-gold mb-3">— Featured</div>
            <h2 className="font-display text-5xl md:text-7xl leading-none">The Collection</h2>
          </div>
          <Link to="/inventory" className="link-underline text-sm uppercase tracking-widest">
            View all
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(featured ?? []).map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
          {!featured && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-[16/14] bg-card animate-pulse rounded-lg" />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-28 bg-surface grain overflow-hidden">
        <div className="absolute inset-0 gradient-radial-spot opacity-50" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <div className="text-xs font-mono uppercase tracking-[0.4em] text-gold mb-3">— By the Numbers</div>
            <h2 className="font-display text-5xl md:text-7xl">Built on Trust</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="glass p-8 rounded-lg text-center">
                <s.icon className="size-6 mx-auto text-gold mb-4" />
                <div className="font-display text-5xl text-gold">{s.value}</div>
                <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-28 mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <div className="text-xs font-mono uppercase tracking-[0.4em] text-gold mb-3">— The Process</div>
          <h2 className="font-display text-5xl md:text-7xl">Three Steps Home</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {[
            { n: "01", title: "Browse", text: "Explore a curated inventory of exceptional machines, each fully inspected." },
            { n: "02", title: "Experience", text: "Book a private test drive at our showroom or your home." },
            { n: "03", title: "Drive Home", text: "Tailored financing and concierge delivery, anywhere in the country." },
          ].map((s) => (
            <div key={s.n} className="relative p-8 border border-border bg-card rounded-lg hover:border-gold/40 transition-colors">
              <div className="font-mono text-xs text-gold mb-6">{s.n}</div>
              <h3 className="font-display text-3xl mb-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-gold opacity-90" />
        <div className="relative mx-auto max-w-5xl px-6 text-center text-[oklch(0.12_0.005_270)]">
          <h2 className="font-display text-5xl md:text-7xl leading-none">Ready to drive?</h2>
          <p className="mt-4 text-lg opacity-80">Your next extraordinary chapter is one test drive away.</p>
          <Link
            to="/inventory"
            className="mt-8 inline-flex items-center gap-2 bg-[oklch(0.12_0.005_270)] text-foreground px-8 py-4 font-semibold uppercase tracking-widest text-sm hover:bg-[oklch(0.18_0.008_270)] transition"
          >
            Start exploring <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

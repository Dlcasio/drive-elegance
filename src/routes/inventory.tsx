import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CarCard, type CarCardData } from "@/components/cars/CarCard";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal } from "lucide-react";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — VELOCE Motors" },
      { name: "description", content: "Browse our curated inventory of luxury and performance cars." },
    ],
  }),
  component: Inventory,
});

type CarRow = CarCardData & { brand_id: number | null; body_type: string | null };
const FUEL_TYPES = ["petrol", "diesel", "electric", "hybrid"] as const;

function Inventory() {
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState(700000);
  const [selectedFuel, setSelectedFuel] = useState<string[]>([]);
  const [sort, setSort] = useState<"newest" | "price-asc" | "price-desc" | "year">("newest");

  const { data: cars } = useQuery({
    queryKey: ["cars", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("id, model, year, price, mileage, fuel_type, transmission, primary_image_url, brand_id, body_type, brand:brands(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as CarRow[];
    },
  });

  const filtered = useMemo(() => {
    if (!cars) return [];
    let r = cars.filter((c) => {
      if (c.price > maxPrice) return false;
      if (selectedFuel.length && !selectedFuel.includes(c.fuel_type ?? "")) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${c.brand?.name} ${c.model} ${c.body_type}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sort === "price-asc") r = [...r].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") r = [...r].sort((a, b) => b.price - a.price);
    if (sort === "year") r = [...r].sort((a, b) => b.year - a.year);
    return r;
  }, [cars, search, maxPrice, selectedFuel, sort]);

  return (
    <div className="min-h-screen">
      <Header />

      <section className="pt-32 pb-12 mx-auto max-w-7xl px-6">
        <div className="text-xs font-mono uppercase tracking-[0.4em] text-gold mb-3">— Inventory</div>
        <h1 className="font-display text-5xl md:text-7xl">The Showroom</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Every machine in our collection is hand-selected and fully inspected by master technicians.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 grid lg:grid-cols-[280px_1fr] gap-10">
        {/* Filters */}
        <aside className="space-y-8 lg:sticky lg:top-24 self-start">
          <div className="flex items-center gap-2 text-sm uppercase tracking-widest">
            <SlidersHorizontal className="size-4 text-gold" /> Filters
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Model, brand, body…"
                className="pl-9 bg-surface border-border"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-3 block">
              Max Price: <span className="text-gold font-mono">{formatPrice(maxPrice)}</span>
            </label>
            <Slider value={[maxPrice]} min={50000} max={700000} step={5000} onValueChange={(v) => setMaxPrice(v[0])} />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-3 block">Fuel Type</label>
            <div className="flex flex-wrap gap-2">
              {FUEL_TYPES.map((f) => {
                const active = selectedFuel.includes(f);
                return (
                  <button
                    key={f}
                    onClick={() =>
                      setSelectedFuel((s) => (s.includes(f) ? s.filter((x) => x !== f) : [...s, f]))
                    }
                    className={`px-3 py-1.5 text-xs uppercase tracking-widest rounded-full border transition-all ${
                      active
                        ? "bg-gold text-[oklch(0.12_0.005_270)] border-gold"
                        : "border-border text-muted-foreground hover:border-gold/40"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "car" : "cars"} found
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="bg-surface border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-gold"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="year">Year: Newest</option>
            </select>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c) => (
              <CarCard key={c.id} car={c} />
            ))}
          </div>
          {filtered.length === 0 && cars && (
            <div className="py-24 text-center text-muted-foreground">No cars match your filters.</div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Star, StarOff } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { resolveCarImage } from "@/lib/car-images";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) nav({ to: "/" });
  }, [user, isAdmin, loading, nav]);
  if (loading || !user) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <section className="pt-32 pb-24 mx-auto max-w-7xl px-6">
        <div className="text-xs font-mono uppercase tracking-[0.4em] text-gold mb-3">— Admin</div>
        <h1 className="font-display text-5xl md:text-7xl">Control Room</h1>

        <Stats />

        <div className="mt-16 grid lg:grid-cols-[1fr_360px] gap-10">
          <CarsTable />
          <AddCarForm />
        </div>

        <Bookings />
        <Inquiries />
      </section>
      <Footer />
    </div>
  );
}

function Stats() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [c, b, i, u] = await Promise.all([
        supabase.from("cars").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("inquiries").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      return { cars: c.count ?? 0, bookings: b.count ?? 0, inquiries: i.count ?? 0, users: u.count ?? 0 };
    },
  });
  const items = [
    { label: "Cars", v: data?.cars ?? 0 },
    { label: "Bookings", v: data?.bookings ?? 0 },
    { label: "Inquiries", v: data?.inquiries ?? 0 },
    { label: "Users", v: data?.users ?? 0 },
  ];
  return (
    <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((i) => (
        <div key={i.label} className="glass p-6 rounded-lg">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{i.label}</div>
          <div className="font-display text-4xl text-gold mt-1">{i.v}</div>
        </div>
      ))}
    </div>
  );
}

function CarsTable() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-cars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("id, model, year, price, is_featured, primary_image_url, brand:brands(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cars").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-cars"] }); toast.success("Car removed"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ id, v }: { id: string; v: boolean }) => {
      const { error } = await supabase.from("cars").update({ is_featured: !v }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-cars"] }),
  });

  return (
    <div className="p-6 bg-surface border border-border rounded-lg">
      <h2 className="font-display text-2xl mb-4">Inventory</h2>
      <div className="space-y-2">
        {(data ?? []).map((c) => (
          <div key={c.id} className="flex items-center gap-4 p-3 bg-card border border-border rounded">
            <img src={resolveCarImage(c.primary_image_url)} alt="" className="size-14 object-cover rounded" />
            <div className="flex-1">
              <div className="font-display text-lg leading-none">{c.model}</div>
              <div className="text-xs text-muted-foreground mt-1">{c.brand?.name} · {c.year} · {formatPrice(c.price)}</div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => toggleFeatured.mutate({ id: c.id, v: c.is_featured })}>
              {c.is_featured ? <Star className="size-4 text-gold fill-current" /> : <StarOff className="size-4" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={() => del.mutate(c.id)}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddCarForm() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ model: "", year: 2024, price: 100000, brand_id: 0 });
  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => (await supabase.from("brands").select("*").order("name")).data ?? [],
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("cars").insert({
        model: form.model, year: form.year, price: form.price,
        brand_id: form.brand_id || null,
        primary_image_url: "car-1",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-cars"] });
      qc.invalidateQueries({ queryKey: ["cars"] });
      toast.success("Car added");
      setForm({ model: "", year: 2024, price: 100000, brand_id: 0 });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 bg-surface border border-border rounded-lg h-fit">
      <h2 className="font-display text-2xl mb-4">Add a car</h2>
      <form onSubmit={(e) => { e.preventDefault(); add.mutate(); }} className="space-y-3">
        <select
          value={form.brand_id}
          onChange={(e) => setForm({ ...form, brand_id: Number(e.target.value) })}
          className="w-full bg-input border border-border rounded px-3 py-2 text-sm"
        >
          <option value={0}>Select brand…</option>
          {(brands ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <Input placeholder="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required />
        <Input type="number" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} required />
        <Input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
        <Button type="submit" disabled={add.isPending} className="w-full bg-gold text-[oklch(0.12_0.005_270)] hover:bg-gold/90">
          {add.isPending ? "Adding…" : "Add car"}
        </Button>
      </form>
    </div>
  );
}

function Bookings() {
  const { data } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => (await supabase.from("bookings").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  return (
    <div className="mt-12 p-6 bg-surface border border-border rounded-lg">
      <h2 className="font-display text-2xl mb-4">Bookings</h2>
      {!data?.length && <p className="text-sm text-muted-foreground">No bookings yet.</p>}
      <div className="space-y-2">
        {(data ?? []).map((b) => (
          <div key={b.id} className="p-3 bg-card border border-border rounded flex justify-between text-sm">
            <div><span className="font-mono text-gold">{b.name}</span> · {b.email}</div>
            <div className="text-muted-foreground">{b.booking_date} {b.booking_time} · <span className="capitalize">{b.status}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Inquiries() {
  const { data } = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: async () => (await supabase.from("inquiries").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  return (
    <div className="mt-8 p-6 bg-surface border border-border rounded-lg">
      <h2 className="font-display text-2xl mb-4">Inquiries</h2>
      {!data?.length && <p className="text-sm text-muted-foreground">No inquiries yet.</p>}
      <div className="space-y-2">
        {(data ?? []).map((i) => (
          <div key={i.id} className="p-4 bg-card border border-border rounded text-sm">
            <div className="flex justify-between">
              <span className="font-mono text-gold">{i.name}</span>
              <span className="text-muted-foreground capitalize text-xs">{i.status}</span>
            </div>
            <div className="text-xs text-muted-foreground">{i.email}</div>
            <p className="mt-2">{i.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

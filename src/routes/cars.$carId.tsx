import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { resolveCarImage } from "@/lib/car-images";
import { formatPrice, formatNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, Calendar, Mail } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";

export const Route = createFileRoute("/cars/$carId")({
  component: CarDetail,
});

const inquirySchema = z.object({
  name: z.string().trim().min(1, "Name required").max(120),
  email: z.string().trim().email("Valid email required").max(200),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().min(5, "Message too short").max(2000),
});

function CarDetail() {
  const { carId } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: car, isLoading } = useQuery({
    queryKey: ["car", carId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*, brand:brands(name), car_features(feature)")
        .eq("id", carId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: inWishlist } = useQuery({
    queryKey: ["wishlist", carId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("wishlists")
        .select("id")
        .eq("car_id", carId)
        .eq("user_id", user!.id)
        .maybeSingle();
      return !!data;
    },
  });

  const toggleWishlist = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in to save cars.");
      if (inWishlist) {
        const { error } = await supabase.from("wishlists").delete()
          .eq("user_id", user.id).eq("car_id", carId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("wishlists").insert({ user_id: user.id, car_id: carId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (!car) return <div className="min-h-screen grid place-items-center">Not found</div>;

  return (
    <div className="min-h-screen">
      <Header />

      <section className="pt-28 mx-auto max-w-7xl px-6">
        <Link to="/inventory" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold mb-6">
          <ArrowLeft className="size-4" /> Back to inventory
        </Link>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10">
          <div className="rounded-lg overflow-hidden bg-card border border-border">
            <img
              src={resolveCarImage(car.primary_image_url)}
              alt={`${car.brand?.name} ${car.model}`}
              className="w-full aspect-[16/10] object-cover"
            />
          </div>

          <div>
            <div className="text-xs font-mono uppercase tracking-[0.4em] text-gold mb-2">
              {car.brand?.name} · {car.year}
            </div>
            <h1 className="font-display text-5xl md:text-6xl leading-none">{car.model}</h1>
            <div className="mt-6 font-mono text-3xl text-gold">{formatPrice(car.price)}</div>

            <p className="mt-6 text-muted-foreground">{car.description}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="bg-gold text-[oklch(0.12_0.005_270)] hover:bg-gold/90">
                <a href="#inquiry"><Mail className="size-4 mr-2" /> Inquire</a>
              </Button>
              <Button variant="outline" className="border-border">
                <Calendar className="size-4 mr-2" /> Test Drive
              </Button>
              <Button
                variant="outline"
                onClick={() => toggleWishlist.mutate()}
                className={inWishlist ? "border-gold text-gold" : "border-border"}
              >
                <Heart className={`size-4 mr-2 ${inWishlist ? "fill-current" : ""}`} />
                {inWishlist ? "Saved" : "Save"}
              </Button>
            </div>
          </div>
        </div>

        {/* Specs */}
        <div className="mt-16">
          <h2 className="font-display text-3xl mb-6">Specifications</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-lg overflow-hidden">
            {[
              ["Body", car.body_type],
              ["Color", car.color],
              ["Fuel", car.fuel_type],
              ["Transmission", car.transmission],
              ["Engine", car.engine_cc ? `${formatNumber(car.engine_cc)} cc` : "—"],
              ["Power", car.power_hp ? `${car.power_hp} hp` : "—"],
              ["Torque", car.torque_nm ? `${car.torque_nm} Nm` : "—"],
              ["Mileage", car.mileage != null ? `${formatNumber(car.mileage)} mi` : "—"],
              ["Seats", car.seats ?? "—"],
              ["Drive", car.drive_type ?? "—"],
            ].map(([k, v]) => (
              <div key={k as string} className="bg-card p-5">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{k}</div>
                <div className="mt-2 font-mono capitalize">{v ?? "—"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        {car.car_features?.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-3xl mb-6">Highlights</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {car.car_features.map((f: { feature: string }, i: number) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-surface border border-border rounded-lg">
                  <div className="size-1.5 rounded-full bg-gold" />
                  <span className="text-sm">{f.feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inquiry */}
        <InquiryForm carId={car.id} carLabel={`${car.brand?.name} ${car.model}`} />
      </section>

      <Footer />
    </div>
  );
}

function InquiryForm({ carId, carLabel }: { carId: string; carLabel: string }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "", email: user?.email ?? "", phone: "", message: `I'm interested in the ${carLabel}.`,
  });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = inquirySchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("inquiries").insert({
      car_id: carId,
      user_id: user?.id ?? null,
      ...parsed.data,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Inquiry sent — we'll be in touch shortly.");
    setForm({ ...form, message: "" });
  };

  return (
    <div id="inquiry" className="mt-20 p-8 md:p-12 bg-surface border border-border rounded-lg">
      <h2 className="font-display text-3xl mb-2">Request more details</h2>
      <p className="text-muted-foreground mb-8">Our concierge team replies within one business hour.</p>
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
        <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="md:col-span-2" />
        <Textarea placeholder="Your message" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="md:col-span-2" />
        <Button type="submit" disabled={submitting} className="md:col-span-2 bg-gold text-[oklch(0.12_0.005_270)] hover:bg-gold/90">
          {submitting ? "Sending…" : "Send inquiry"}
        </Button>
      </form>
    </div>
  );
}

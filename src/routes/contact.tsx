import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — VELOCE Motors" }] }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().min(5).max(2000),
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    const { error } = await supabase.from("inquiries").insert({ ...parsed.data });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Message sent — we'll reply soon.");
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <section className="pt-32 pb-24 mx-auto max-w-7xl px-6">
        <div className="text-xs font-mono uppercase tracking-[0.4em] text-gold mb-3">— Contact</div>
        <h1 className="font-display text-5xl md:text-7xl">Visit the showroom</h1>

        <div className="mt-12 grid md:grid-cols-2 gap-12">
          <form onSubmit={submit} className="space-y-4">
            <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Textarea rows={6} placeholder="How can we help?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <Button type="submit" disabled={busy} className="bg-gold text-[oklch(0.12_0.005_270)] hover:bg-gold/90">
              {busy ? "Sending…" : "Send message"}
            </Button>
          </form>

          <div className="space-y-6">
            {[
              { icon: MapPin, t: "Showroom", v: "8800 Sunset Blvd, West Hollywood, CA 90069" },
              { icon: Phone, t: "Phone", v: "(310) 555-0142" },
              { icon: Mail, t: "Email", v: "concierge@veloce.motors" },
              { icon: Clock, t: "Hours", v: "Mon–Sat · 9:00 – 19:00 · Closed Sundays" },
            ].map((i) => (
              <div key={i.t} className="flex gap-4 p-6 bg-surface border border-border rounded-lg">
                <i.icon className="size-5 text-gold mt-0.5" />
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{i.t}</div>
                  <div className="mt-1">{i.v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

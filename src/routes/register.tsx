import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — VELOCE Motors" }] }),
  component: Register,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(120),
  email: z.string().trim().email().max(200),
  password: z.string().min(8, "At least 8 characters").max(72),
});

function Register() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) nav({ to: "/dashboard" }); }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: parsed.data.name },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — welcome!");
    nav({ to: "/dashboard" });
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error("Google sign-in failed");
  };

  return (
    <div className="min-h-screen">
      <Header />
      <section className="pt-32 pb-24 grid place-items-center px-6">
        <div className="w-full max-w-md p-8 bg-surface border border-border rounded-lg">
          <h1 className="font-display text-4xl">Create account</h1>
          <p className="text-sm text-muted-foreground mt-2">Join the VELOCE collection.</p>

          <form onSubmit={submit} className="mt-8 space-y-3">
            <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input type="password" placeholder="Password (8+ chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <Button type="submit" disabled={busy} className="w-full bg-gold text-[oklch(0.12_0.005_270)] hover:bg-gold/90">
              {busy ? "Creating…" : "Create account"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full border-border" onClick={google}>
            Continue with Google
          </Button>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            Already have an account? <Link to="/login" className="text-gold link-underline">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

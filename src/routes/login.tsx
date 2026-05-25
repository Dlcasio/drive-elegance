import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — VELOCE Motors" }] }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) nav({ to: "/dashboard" }); }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
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
          <h1 className="font-display text-4xl">Sign in</h1>
          <p className="text-sm text-muted-foreground mt-2">Welcome back to VELOCE.</p>

          <form onSubmit={submit} className="mt-8 space-y-3">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={pwd} onChange={(e) => setPwd(e.target.value)} required />
            <Button type="submit" disabled={busy} className="w-full bg-gold text-[oklch(0.12_0.005_270)] hover:bg-gold/90">
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full border-border" onClick={google}>
            Continue with Google
          </Button>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            New here? <Link to="/register" className="text-gold link-underline">Create an account</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

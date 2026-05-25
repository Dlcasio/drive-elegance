import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Mail, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { user, isAdmin } = useAuth();

  const { data: counts } = useQuery({
    queryKey: ["dashboard-counts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [w, i] = await Promise.all([
        supabase.from("wishlists").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      ]);
      return { wishlist: w.count ?? 0, inquiries: i.count ?? 0 };
    },
  });

  return (
    <div className="min-h-screen">
      <Header />
      <section className="pt-32 pb-24 mx-auto max-w-7xl px-6">
        <div className="text-xs font-mono uppercase tracking-[0.4em] text-gold mb-3">— Dashboard</div>
        <h1 className="font-display text-5xl md:text-7xl">Welcome back</h1>
        <p className="mt-3 text-muted-foreground">{user?.email}</p>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card to="/dashboard/wishlist" icon={Heart} title="Wishlist" value={counts?.wishlist ?? 0} />
          <Card to="/contact" icon={Mail} title="Inquiries" value={counts?.inquiries ?? 0} />
          {isAdmin && <Card to="/admin" icon={ShieldCheck} title="Admin Panel" value="→" />}
        </div>
      </section>
      <Footer />
    </div>
  );
}

function Card({ to, icon: Icon, title, value }: { to: string; icon: React.ComponentType<{ className?: string }>; title: string; value: number | string }) {
  return (
    <Link to={to} className="block p-8 bg-surface border border-border rounded-lg hover:border-gold/40 transition-colors group">
      <Icon className="size-6 text-gold mb-4" />
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{title}</div>
      <div className="font-display text-5xl text-foreground group-hover:text-gold transition-colors mt-1">{value}</div>
    </Link>
  );
}

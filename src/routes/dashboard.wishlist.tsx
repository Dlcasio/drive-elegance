import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CarCard, type CarCardData } from "@/components/cars/CarCard";

export const Route = createFileRoute("/dashboard/wishlist")({
  component: WishlistPage,
});

function WishlistPage() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["wishlist-cars", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlists")
        .select("car:cars(id, model, year, price, mileage, fuel_type, transmission, primary_image_url, brand:brands(name))")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.car).filter(Boolean) as unknown as CarCardData[];
    },
  });

  return (
    <div className="min-h-screen">
      <Header />
      <section className="pt-32 pb-24 mx-auto max-w-7xl px-6">
        <h1 className="font-display text-5xl">My Wishlist</h1>
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(data ?? []).map((c) => <CarCard key={c.id} car={c} />)}
        </div>
        {data && data.length === 0 && (
          <div className="py-24 text-center text-muted-foreground">Your wishlist is empty.</div>
        )}
      </section>
      <Footer />
    </div>
  );
}

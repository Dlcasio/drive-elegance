import { Link } from "@tanstack/react-router";
import { Fuel, Gauge, Settings2 } from "lucide-react";
import { resolveCarImage } from "@/lib/car-images";
import { formatPrice, formatNumber } from "@/lib/format";

export type CarCardData = {
  id: string;
  model: string;
  year: number;
  price: number;
  mileage: number | null;
  fuel_type: string | null;
  transmission: string | null;
  primary_image_url: string | null;
  brand?: { name: string } | null;
};

export function CarCard({ car }: { car: CarCardData }) {
  return (
    <Link
      to="/cars/$carId"
      params={{ carId: car.id }}
      className="group block tilt-card rounded-lg overflow-hidden bg-card border border-border hover:border-gold/40"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={resolveCarImage(car.primary_image_url)}
          alt={`${car.brand?.name ?? ""} ${car.model}`}
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
        <div className="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-widest bg-background/70 backdrop-blur px-2 py-1 rounded">
          {car.year}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-gold">{car.brand?.name}</div>
            <div className="font-display text-2xl leading-none mt-1">{car.model}</div>
          </div>
        </div>
      </div>

      <div className="p-5 flex items-center justify-between">
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {car.mileage != null && (
            <span className="flex items-center gap-1.5"><Gauge className="size-3.5" />{formatNumber(car.mileage)} mi</span>
          )}
          {car.fuel_type && (
            <span className="flex items-center gap-1.5 capitalize"><Fuel className="size-3.5" />{car.fuel_type}</span>
          )}
          {car.transmission && (
            <span className="flex items-center gap-1.5 capitalize"><Settings2 className="size-3.5" />{car.transmission}</span>
          )}
        </div>
      </div>

      <div className="px-5 pb-5 flex items-center justify-between">
        <div className="font-mono text-lg text-gold">{formatPrice(car.price)}</div>
        <span className="text-xs uppercase tracking-widest text-foreground/70 group-hover:text-gold transition-colors">
          View →
        </span>
      </div>
    </Link>
  );
}

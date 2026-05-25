import hero from "@/assets/hero-car.jpg";
import c1 from "@/assets/car-1.jpg";
import c2 from "@/assets/car-2.jpg";
import c3 from "@/assets/car-3.jpg";
import c4 from "@/assets/car-4.jpg";
import c5 from "@/assets/car-5.jpg";
import c6 from "@/assets/car-6.jpg";

const map: Record<string, string> = {
  "hero-car": hero,
  "car-1": c1,
  "car-2": c2,
  "car-3": c3,
  "car-4": c4,
  "car-5": c5,
  "car-6": c6,
};

export function resolveCarImage(key?: string | null): string {
  if (!key) return c1;
  if (key.startsWith("http")) return key;
  return map[key] ?? c1;
}

export const heroCarImage = hero;

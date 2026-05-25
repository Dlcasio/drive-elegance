import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Facebook, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-surface mt-32">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-sm gradient-gold grid place-items-center font-display text-xl text-[oklch(0.12_0.005_270)]">V</div>
            <span className="font-display text-3xl tracking-[0.2em]">VELOCE</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            A curated showroom of extraordinary machines. Hand-selected, fully inspected, delivered nationwide.
          </p>
          <div className="flex gap-3 mt-6">
            {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="size-9 rounded-full border border-border grid place-items-center text-muted-foreground hover:text-gold hover:border-gold transition-colors hover:rotate-12">
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/inventory" className="link-underline">Inventory</Link></li>
            <li><Link to="/finance" className="link-underline">Finance</Link></li>
            <li><Link to="/contact" className="link-underline">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Showroom</h4>
          <p className="text-sm text-muted-foreground">
            8800 Sunset Boulevard<br />
            West Hollywood, CA 90069<br />
            (310) 555‑0142
          </p>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} VELOCE Motors. All rights reserved.
      </div>
    </footer>
  );
}

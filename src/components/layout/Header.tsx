import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Menu, X, User as UserIcon, LogOut, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { to: "/", label: "Home" },
  { to: "/inventory", label: "Inventory" },
  { to: "/finance", label: "Finance" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const nav = useNavigate();

  return (
    <header className="fixed top-0 inset-x-0 z-50 glass">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-8 rounded-sm gradient-gold grid place-items-center font-display text-xl text-[oklch(0.12_0.005_270)]">
            V
          </div>
          <span className="font-display text-2xl tracking-[0.18em]">VELOCE</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="link-underline text-foreground/80 hover:text-foreground transition-colors"
              data-active={pathname === l.to}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full border border-border">
                  <UserIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{user.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => nav({ to: "/dashboard" })}>Dashboard</DropdownMenuItem>
                <DropdownMenuItem onClick={() => nav({ to: "/dashboard/wishlist" })}>Wishlist</DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => nav({ to: "/admin" })}>
                    <ShieldCheck className="size-4 mr-2 text-gold" /> Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="size-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-gold text-[oklch(0.12_0.005_270)] hover:bg-gold/90">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-surface">
          <nav className="px-6 py-6 flex flex-col gap-4 uppercase tracking-widest text-sm">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="py-1">
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
                {isAdmin && <Link to="/admin" onClick={() => setOpen(false)}>Admin</Link>}
                <button onClick={() => signOut()} className="text-left text-destructive">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>Sign in</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="text-gold">Get Started</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

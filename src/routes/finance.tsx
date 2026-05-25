import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Slider } from "@/components/ui/slider";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/finance")({
  head: () => ({ meta: [{ title: "Finance — VELOCE Motors" }] }),
  component: Finance,
});

function Finance() {
  const [price, setPrice] = useState(120000);
  const [down, setDown] = useState(24000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(5);

  const { emi, total, interest } = useMemo(() => {
    const principal = Math.max(price - down, 0);
    const r = rate / 100 / 12;
    const n = years * 12;
    const emi = r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;
    return { emi: Math.round(emi), total: Math.round(total), interest: Math.round(total - principal) };
  }, [price, down, rate, years]);

  return (
    <div className="min-h-screen">
      <Header />
      <section className="pt-32 pb-24 mx-auto max-w-5xl px-6">
        <div className="text-xs font-mono uppercase tracking-[0.4em] text-gold mb-3">— Finance</div>
        <h1 className="font-display text-5xl md:text-7xl">EMI Calculator</h1>
        <p className="mt-4 text-muted-foreground max-w-xl">
          Tailored financing through our partner lenders. Estimate your monthly payment in seconds.
        </p>

        <div className="mt-12 grid md:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-8 p-8 bg-surface border border-border rounded-lg">
            <Field label="Car price" value={formatPrice(price)}>
              <Slider value={[price]} min={50000} max={700000} step={5000} onValueChange={(v) => setPrice(v[0])} />
            </Field>
            <Field label="Down payment" value={formatPrice(down)}>
              <Slider value={[down]} min={0} max={price} step={1000} onValueChange={(v) => setDown(v[0])} />
            </Field>
            <Field label="Interest rate" value={`${rate.toFixed(2)}%`}>
              <Slider value={[rate]} min={0} max={20} step={0.1} onValueChange={(v) => setRate(v[0])} />
            </Field>
            <Field label="Loan term" value={`${years} years`}>
              <Slider value={[years]} min={1} max={8} step={1} onValueChange={(v) => setYears(v[0])} />
            </Field>
          </div>

          <div className="p-8 rounded-lg gradient-gold text-[oklch(0.12_0.005_270)]">
            <div className="text-xs uppercase tracking-widest opacity-70">Monthly Payment</div>
            <div className="font-display text-6xl mt-2 leading-none">{formatPrice(emi)}</div>
            <div className="mt-8 space-y-3 text-sm">
              <Row k="Principal" v={formatPrice(price - down)} />
              <Row k="Interest" v={formatPrice(interest)} />
              <Row k="Total payment" v={formatPrice(total)} />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function Field({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
        <span className="font-mono text-gold">{value}</span>
      </div>
      {children}
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-[oklch(0.12_0.005_270/0.15)] pb-2">
      <span className="opacity-70">{k}</span>
      <span className="font-mono">{v}</span>
    </div>
  );
}

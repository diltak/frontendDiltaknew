"use client";

import { useEffect, useState } from "react";
import { Droplets, Loader2, Plus } from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import ServerAddress from "@/constent/ServerAddress";
import type { HydrationTodayResponse, BeverageType } from "@/types/physical-health";

const BEVERAGES: { value: BeverageType; label: string; emoji: string; multiplier: number }[] = [
  { value: "water", label: "Water", emoji: "💧", multiplier: 1.0 },
  { value: "tea", label: "Tea", emoji: "🍵", multiplier: 0.9 },
  { value: "coffee", label: "Coffee", emoji: "☕", multiplier: 0.8 },
  { value: "juice", label: "Juice", emoji: "🧃", multiplier: 0.85 },
  { value: "other", label: "Other", emoji: "🥤", multiplier: 0.7 },
];

const QUICK_AMOUNTS = [150, 250, 350, 500];

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatTime(iso: string) {
  try { return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }); }
  catch { return iso; }
}

export default function HydrationTab() {
  const [today, setToday] = useState<HydrationTodayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState("250");
  const [beverage, setBeverage] = useState<BeverageType>("water");

  const fetchToday = async () => {
    try {
      const res = await axios.get(`${ServerAddress}/physical-health/hydration/today`, { headers: authHeaders() });
      setToday(res.data);
    } catch { setToday(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchToday(); }, []);

  const onLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const ml = parseInt(amount);
    if (!ml || ml < 50 || ml > 2000) { toast({ title: "Enter 50–2000 ml", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      await axios.post(`${ServerAddress}/physical-health/hydration/log`, { amount_ml: ml, beverage_type: beverage }, { headers: authHeaders() });
      toast({ title: `${ml} ml logged` });
      setAmount("250");
      await fetchToday();
    } catch (err) {
      toast({ title: "Log failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const pct = today ? Math.min(100, Math.round(today.percentage)) : 0;
  const barColor = pct >= 80 ? "bg-success" : pct >= 50 ? "bg-warning" : "bg-destructive";

  return (
    <div className="space-y-5">
      {/* Today summary */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
          <Droplets className="h-5 w-5 text-info" /> Today's Hydration
        </h3>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-4 mb-4">
              <div>
                <p className="text-3xl font-bold text-foreground">{today?.total_ml ?? 0} <span className="text-base font-normal text-muted-foreground">ml</span></p>
                <p className="text-xs text-muted-foreground">of {today?.target_ml ?? 2500} ml target</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${today?.on_track ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                {today?.on_track ? "On track ✓" : "Drink more"}
              </span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
              <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mb-4">{pct}% of daily target</p>

            {/* Beverage breakdown */}
            {today && Object.keys(today.beverage_breakdown).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(today.beverage_breakdown).map(([bev, ml]) => {
                  const meta = BEVERAGES.find(b => b.value === bev);
                  return (
                    <span key={bev} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-foreground">
                      {meta?.emoji ?? "🥤"} {meta?.label ?? bev}: {ml} ml
                    </span>
                  );
                })}
              </div>
            )}

            {/* Log entries */}
            {today && today.logs.length > 0 && (
              <div className="mt-4 space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Today's logs</p>
                {today.logs.map((log: any, i: number) => {
                  const meta = BEVERAGES.find(b => b.value === log.beverage_type);
                  return (
                    <div key={log.log_id ?? i} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-sm">
                      <span>{meta?.emoji ?? "🥤"} {meta?.label ?? log.beverage_type} — {log.amount_ml} ml</span>
                      <span className="text-xs text-muted-foreground">{formatTime(log.logged_at)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Log form */}
      <form onSubmit={onLog} className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
        <h3 className="flex items-center gap-2 text-base font-semibold text-foreground"><Plus className="h-5 w-5 text-primary" /> Log Hydration</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {QUICK_AMOUNTS.map(ml => (
            <button key={ml} type="button" onClick={() => setAmount(String(ml))}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${amount === String(ml) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}>
              {ml} ml
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Amount (ml)</label>
            <input type="number" min={50} max={2000} value={amount} onChange={e => setAmount(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Beverage</label>
            <div className="flex flex-wrap gap-2">
              {BEVERAGES.map(b => (
                <button key={b.value} type="button" onClick={() => setBeverage(b.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${beverage === b.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary"}`}>
                  {b.emoji} {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {submitting ? <><Loader2 className="h-5 w-5 animate-spin" />Logging…</> : <><Droplets className="h-5 w-5" />Log</>}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

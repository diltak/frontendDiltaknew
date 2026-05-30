"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Zap } from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import ServerAddress from "@/constent/ServerAddress";
import type { EnergyTodayResponse, TimeOfDay } from "@/types/physical-health";

const TIME_SLOTS: { value: TimeOfDay; label: string; emoji: string }[] = [
  { value: "morning", label: "Morning", emoji: "🌅" },
  { value: "afternoon", label: "Afternoon", emoji: "☀️" },
  { value: "evening", label: "Evening", emoji: "🌙" },
];

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function energyEmoji(level: number) {
  if (level >= 4) return "⚡";
  if (level >= 3) return "🔋";
  return "🪫";
}

function energyColor(level: number) {
  if (level >= 4) return "text-success";
  if (level >= 3) return "text-warning";
  return "text-destructive";
}

export default function EnergyTab() {
  const [today, setToday] = useState<EnergyTodayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [energyLevel, setEnergyLevel] = useState(3);
  const [focusLevel, setFocusLevel] = useState(3);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("morning");
  const [notes, setNotes] = useState("");

  const fetchToday = async () => {
    try {
      const res = await axios.get(`${ServerAddress}/physical-health/energy/today`, { headers: authHeaders() });
      setToday(res.data);
    } catch { setToday(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchToday(); }, []);

  const onLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${ServerAddress}/physical-health/energy/log`,
        { energy_level: energyLevel, focus_level: focusLevel, time_of_day: timeOfDay, notes: notes || undefined },
        { headers: authHeaders() }
      );
      toast({ title: "Energy check-in logged" });
      setNotes("");
      await fetchToday();
    } catch (err) {
      toast({ title: "Log failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-5">
      {/* Today summary */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
          <Zap className="h-5 w-5 text-warning" /> Today's Energy
        </h3>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : today && today.logs.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mb-4">
              <div className="rounded-lg border border-border p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Energy</p>
                <p className={`mt-0.5 text-2xl font-bold ${energyColor(today.avg_energy ?? 0)}`}>
                  {energyEmoji(today.avg_energy ?? 0)} {today.avg_energy?.toFixed(1) ?? "—"}<span className="text-sm font-normal">/5</span>
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Focus</p>
                <p className="mt-0.5 text-2xl font-bold text-foreground">{today.avg_focus?.toFixed(1) ?? "—"}<span className="text-sm font-normal">/5</span></p>
              </div>
              {today.pattern && (
                <div className="rounded-lg border border-border p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Pattern</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground capitalize">{today.pattern}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {today.logs.map((log: any, i: number) => {
                const slot = TIME_SLOTS.find(t => t.value === log.time_of_day);
                return (
                  <div key={log.log_id ?? i} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-sm">
                    <span className="text-muted-foreground">{slot?.emoji} {slot?.label ?? log.time_of_day}</span>
                    <div className="flex gap-4 text-xs">
                      <span className={`font-semibold ${energyColor(log.energy_level)}`}>Energy {log.energy_level}/5</span>
                      <span className="text-muted-foreground">Focus {log.focus_level}/5</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No energy check-ins today. Log up to 3 times daily.</p>
        )}
      </div>

      {/* Log form */}
      <form onSubmit={onLog} className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
        <h3 className="flex items-center gap-2 text-base font-semibold text-foreground"><Plus className="h-5 w-5 text-primary" /> Log Energy Check-in</h3>
        <div>
          <label className="mb-2 block text-xs text-muted-foreground">Time of Day</label>
          <div className="flex gap-2">
            {TIME_SLOTS.map(t => (
              <button key={t.value} type="button" onClick={() => setTimeOfDay(t.value)}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${timeOfDay === t.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary"}`}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs text-muted-foreground">Energy Level: <span className="font-semibold text-foreground">{energyEmoji(energyLevel)} {energyLevel}/5</span></label>
            <input type="range" min={1} max={5} step={1} value={energyLevel} onChange={e => setEnergyLevel(Number(e.target.value))} className="w-full accent-primary" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>1 · Exhausted</span><span>5 · Energised</span></div>
          </div>
          <div>
            <label className="mb-2 block text-xs text-muted-foreground">Focus Level: <span className="font-semibold text-foreground">{focusLevel}/5</span></label>
            <input type="range" min={1} max={5} step={1} value={focusLevel} onChange={e => setFocusLevel(Number(e.target.value))} className="w-full accent-primary" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>1 · Scattered</span><span>5 · Laser focus</span></div>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Notes (optional)</label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. had coffee, feeling alert" className={inputCls} />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Logging…</> : <><Zap className="h-4 w-4" />Log Energy</>}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";

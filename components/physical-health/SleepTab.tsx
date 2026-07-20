"use client";

import { useEffect, useState } from "react";
import { Loader2, Moon, Plus } from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import ServerAddress from "@/constent/ServerAddress";
import type { SleepLogResponse, SleepTrendsResponse } from "@/types/physical-health";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function fmt(iso: string) {
  try { return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" }); }
  catch { return iso; }
}

function scoreColor(s: number) {
  if (s >= 7) return "text-success";
  if (s >= 5) return "text-warning";
  return "text-destructive";
}

export default function SleepTab() {
  const [trends, setTrends] = useState<SleepTrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastLog, setLastLog] = useState<SleepLogResponse | null>(null);

  // form
  const [bedtime, setBedtime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [quality, setQuality] = useState(3);
  const [interruptions, setInterruptions] = useState(0);
  const [dreamRecall, setDreamRecall] = useState(false);
  const [notes, setNotes] = useState("");

  const fetchTrends = async () => {
    try {
      const res = await axios.get(`${ServerAddress}/physical-health/sleep/trends`, { params: { days: 14 }, headers: authHeaders() });
      setTrends(res.data);
    } catch { setTrends(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTrends(); }, []);

  const onLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bedtime || !wakeTime) { toast({ title: "Enter bedtime and wake time", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const res = await axios.post<SleepLogResponse>(
        `${ServerAddress}/physical-health/sleep/log`,
        { bedtime: new Date(bedtime).toISOString(), wake_time: new Date(wakeTime).toISOString(), quality_score: quality, interruptions, dream_recall: dreamRecall, notes: notes || undefined },
        { headers: authHeaders() }
      );
      setLastLog(res.data);
      toast({ title: `Sleep logged — ${res.data.duration_hours.toFixed(1)}h, score ${res.data.sleep_score.toFixed(1)}` });
      setBedtime(""); setWakeTime(""); setQuality(3); setInterruptions(0); setDreamRecall(false); setNotes("");
      await fetchTrends();
    } catch (err) {
      toast({ title: "Log failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-5">
      {/* Trends summary */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : trends && trends.logs.length > 0 ? (
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-foreground"><Moon className="h-5 w-5 text-primary" /> 14-Day Sleep Summary</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCell label="Avg Duration" value={`${trends.avg_duration.toFixed(1)}h`} />
            <StatCell label="Avg Quality" value={`${trends.avg_quality.toFixed(1)}/5`} />
            <StatCell label="Avg Score" value={trends.avg_score.toFixed(1)} colorClass={scoreColor(trends.avg_score)} />
            <StatCell label="Weekly Debt" value={`${trends.weekly_debt_hours.toFixed(1)}h`} colorClass={trends.weekly_debt_hours > 2 ? "text-destructive" : "text-success"} />
          </div>
          {trends.chronotype && <p className="text-xs text-muted-foreground">Chronotype: <span className="font-medium text-foreground capitalize">{trends.chronotype.replace("_", " ")}</span></p>}
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[360px]">
              <thead><tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-1.5 pr-3 font-medium">Date</th>
                <th className="py-1.5 pr-3 font-medium">Duration</th>
                <th className="py-1.5 pr-3 font-medium">Quality</th>
                <th className="py-1.5 font-medium">Score</th>
              </tr></thead>
              <tbody>
                {trends.logs.slice(0, 10).map(l => (
                  <tr key={l.log_id} className="border-b border-border/50">
                    <td className="py-1.5 pr-3 text-muted-foreground">{fmt(l.bedtime)}</td>
                    <td className="py-1.5 pr-3 font-medium text-foreground">{l.duration_hours.toFixed(1)}h</td>
                    <td className="py-1.5 pr-3 text-foreground">{l.quality_score}/5</td>
                    <td className={`py-1.5 font-semibold ${scoreColor(l.sleep_score)}`}>{l.sleep_score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Last log result */}
      {lastLog && (
        <div className="rounded-lg border border-success/30 bg-success/10 p-4 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Sleep logged ✓</p>
          <p className="text-xs text-muted-foreground mt-1">Duration: {lastLog.duration_hours.toFixed(1)}h · Score: {lastLog.sleep_score.toFixed(1)} · Debt: {lastLog.debt_hours?.toFixed(1) ?? 0}h</p>
        </div>
      )}

      {/* Log form */}
      <form onSubmit={onLog} className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
        <h3 className="flex items-center gap-2 text-base font-semibold text-foreground"><Plus className="h-5 w-5 text-primary" /> Log Sleep Session</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Bedtime</label>
            <input type="datetime-local" value={bedtime} onChange={e => setBedtime(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Wake Time</label>
            <input type="datetime-local" value={wakeTime} onChange={e => setWakeTime(e.target.value)} className={inputCls} />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-xs text-muted-foreground">Sleep Quality: <span className="font-semibold text-foreground">{quality}/5</span></label>
          <input type="range" min={1} max={5} step={1} value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full accent-primary" />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>1 · Terrible</span><span>5 · Excellent</span></div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Interruptions</label>
            <input type="number" min={0} value={interruptions} onChange={e => setInterruptions(Number(e.target.value))} className={inputCls} />
          </div>
          <div className="flex items-center gap-3 pt-5">
            <input type="checkbox" id="dream" checked={dreamRecall} onChange={e => setDreamRecall(e.target.checked)} className="accent-primary" />
            <label htmlFor="dream" className="text-sm text-foreground cursor-pointer">Dream recall</label>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="e.g. woke up feeling refreshed" className={`${inputCls} resize-none`} />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {submitting ? <><Loader2 className="h-5 w-5 animate-spin" />Logging…</> : <><Moon className="h-5 w-5" />Log Sleep</>}
          </button>
        </div>
      </form>
    </div>
  );
}

function StatCell({ label, value, colorClass = "text-foreground" }: { label: string; value: string; colorClass?: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`mt-0.5 text-lg font-bold ${colorClass}`}>{value}</p>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";

"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, Loader2, Plus } from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import ServerAddress from "@/constent/ServerAddress";
import type { VitalLatestItem, VitalLogRequest, VitalLogResponse, VitalTrendResponse, VitalType } from "@/types/physical-health";

const VITAL_TYPES: { value: VitalType; label: string; unit: string; primaryLabel: string; hasSecondary?: boolean; secondaryLabel?: string }[] = [
  { value: "bp", label: "Blood Pressure", unit: "mmHg", primaryLabel: "Systolic", hasSecondary: true, secondaryLabel: "Diastolic" },
  { value: "blood_sugar", label: "Blood Sugar", unit: "mg/dL", primaryLabel: "Glucose" },
  { value: "heart_rate", label: "Heart Rate", unit: "bpm", primaryLabel: "BPM" },
  { value: "weight", label: "Weight", unit: "kg", primaryLabel: "Weight (kg)" },
  { value: "spo2", label: "SpO2", unit: "%", primaryLabel: "Oxygen Saturation %" },
];
const CONTEXTS = ["fasting", "post_meal", "resting", "post_exercise"];

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function alertColor(tier: string) {
  if (tier === "critical") return "text-destructive bg-destructive/10 border-destructive/30";
  if (tier === "warning") return "text-warning bg-warning/10 border-warning/30";
  return "text-success bg-success/10 border-success/30";
}

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return iso; }
}

export default function VitalsTab() {
  const [latest, setLatest] = useState<VitalLatestItem[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [trend, setTrend] = useState<VitalTrendResponse | null>(null);
  const [trendType, setTrendType] = useState<VitalType>("bp");
  const [loadingTrend, setLoadingTrend] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // form
  const [vitalType, setVitalType] = useState<VitalType>("bp");
  const [primary, setPrimary] = useState("");
  const [secondary, setSecondary] = useState("");
  const [context, setContext] = useState("");

  const selectedMeta = VITAL_TYPES.find(v => v.value === vitalType)!;

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${ServerAddress}/physical-health/vitals/latest`, { headers: authHeaders() });
        setLatest(res.data ?? []);
      } catch { /* no vitals yet */ }
      finally { setLoadingLatest(false); }
    })();
  }, []);

  const fetchTrend = async (type: VitalType) => {
    setLoadingTrend(true);
    try {
      const res = await axios.get(`${ServerAddress}/physical-health/vitals/${type}`, { params: { days: 30 }, headers: authHeaders() });
      setTrend(res.data);
    } catch { setTrend(null); }
    finally { setLoadingTrend(false); }
  };

  useEffect(() => { fetchTrend(trendType); }, [trendType]);

  const onLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primary) { toast({ title: "Enter a value", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const payload: VitalLogRequest = { vital_type: vitalType, value_primary: parseFloat(primary) };
      if (secondary && selectedMeta.hasSecondary) payload.value_secondary = parseFloat(secondary);
      if (context) payload.context = context as VitalLogRequest["context"];
      const res = await axios.post<VitalLogResponse>(`${ServerAddress}/physical-health/vitals/log`, payload, { headers: authHeaders() });
      toast({ title: "Vital logged", description: res.data.alert_message ?? `${res.data.value_primary} ${res.data.unit} — ${res.data.alert_tier}` });
      setPrimary(""); setSecondary(""); setContext("");
      // refresh latest
      const latestRes = await axios.get(`${ServerAddress}/physical-health/vitals/latest`, { headers: authHeaders() });
      setLatest(latestRes.data ?? []);
      if (trendType === vitalType) fetchTrend(vitalType);
    } catch (err) {
      toast({ title: "Log failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-5">
      {/* Latest readings */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
          <Activity className="h-5 w-5 text-primary" /> Latest Readings
        </h3>
        {loadingLatest ? (
          <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : latest.length === 0 ? (
          <p className="text-sm text-muted-foreground">No vitals logged yet. Use the form below to add your first reading.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {latest.map(v => {
              const meta = VITAL_TYPES.find(t => t.value === v.vital_type);
              return (
                <div key={v.vital_type} className={`rounded-lg border p-3 ${alertColor(v.alert_tier)}`}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{meta?.label ?? v.vital_type}</p>
                  <p className="mt-1 text-lg font-bold">
                    {v.value_primary}{v.value_secondary != null ? `/${v.value_secondary}` : ""} <span className="text-xs font-normal">{v.unit}</span>
                  </p>
                  <p className="text-[10px] opacity-60">{v.days_ago === 0 ? "today" : `${v.days_ago}d ago`}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log form */}
      <form onSubmit={onLog} className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
        <h3 className="flex items-center gap-2 text-base font-semibold text-foreground"><Plus className="h-5 w-5 text-primary" /> Log a Reading</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Vital Type</label>
            <select value={vitalType} onChange={e => { setVitalType(e.target.value as VitalType); setSecondary(""); }} className={inputCls}>
              {VITAL_TYPES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">{selectedMeta.primaryLabel}</label>
            <input type="number" step="any" value={primary} onChange={e => setPrimary(e.target.value)} placeholder={selectedMeta.unit} className={inputCls} />
          </div>
          {selectedMeta.hasSecondary && (
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">{selectedMeta.secondaryLabel}</label>
              <input type="number" step="any" value={secondary} onChange={e => setSecondary(e.target.value)} placeholder="mmHg" className={inputCls} />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Context (optional)</label>
            <select value={context} onChange={e => setContext(e.target.value)} className={inputCls}>
              <option value="">None</option>
              {CONTEXTS.map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {submitting ? <><Loader2 className="h-5 w-5 animate-spin" />Logging…</> : "Log Reading"}
          </button>
        </div>
      </form>

      {/* Trend */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-foreground">30-Day Trend</h3>
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {VITAL_TYPES.map(v => (
              <button key={v.value} onClick={() => setTrendType(v.value)}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${trendType === v.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {v.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
        {loadingTrend ? (
          <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : !trend || trend.count === 0 ? (
          <p className="text-sm text-muted-foreground">No readings for this period.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="text-muted-foreground">Trend: <span className="font-medium text-foreground capitalize">{trend.trend}</span></span>
              <span className="text-muted-foreground">Readings: <span className="font-medium text-foreground">{trend.count}</span></span>
              {trend.latest_alert !== "normal" && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${alertColor(trend.latest_alert)}`}>
                  <AlertTriangle className="h-3 w-3" />{trend.latest_alert}
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[400px]">
                <thead><tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-1.5 pr-3 font-medium">Date</th>
                  <th className="py-1.5 pr-3 font-medium">Value</th>
                  <th className="py-1.5 pr-3 font-medium">Context</th>
                  <th className="py-1.5 font-medium">Alert</th>
                </tr></thead>
                <tbody>
                  {trend.readings.slice(0, 10).map(r => (
                    <tr key={r.log_id} className="border-b border-border/50">
                      <td className="py-1.5 pr-3 text-muted-foreground">{formatDate(r.measured_at)}</td>
                      <td className="py-1.5 pr-3 font-medium text-foreground">{r.value_primary}{r.value_secondary != null ? `/${r.value_secondary}` : ""}</td>
                      <td className="py-1.5 pr-3 text-muted-foreground capitalize">{r.context?.replace("_", " ") ?? "—"}</td>
                      <td className="py-1.5"><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${alertColor(r.alert_tier)}`}>{r.alert_tier}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";

"use client";

import { useEffect, useState } from "react";
import { Dumbbell, Loader2, Plus } from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import ServerAddress from "@/constent/ServerAddress";
import type { MovementWeeklyResponse, MovementActivityType, MovementIntensity } from "@/types/physical-health";

const ACTIVITIES: { value: MovementActivityType; label: string; emoji: string }[] = [
  { value: "walk", label: "Walk", emoji: "🚶" },
  { value: "run", label: "Run", emoji: "🏃" },
  { value: "gym", label: "Gym", emoji: "🏋️" },
  { value: "yoga", label: "Yoga", emoji: "🧘" },
  { value: "sport", label: "Sport", emoji: "⚽" },
  { value: "desk_stretch", label: "Desk Stretch", emoji: "🙆" },
  { value: "other", label: "Other", emoji: "🏅" },
];
const INTENSITIES: MovementIntensity[] = ["low", "moderate", "high"];

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function MovementTab() {
  const [weekly, setWeekly] = useState<MovementWeeklyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [activity, setActivity] = useState<MovementActivityType>("walk");
  const [duration, setDuration] = useState("30");
  const [intensity, setIntensity] = useState<MovementIntensity>("moderate");
  const [steps, setSteps] = useState("");
  const [notes, setNotes] = useState("");

  const fetchWeekly = async () => {
    try {
      const res = await axios.get(`${ServerAddress}/physical-health/movement/weekly`, { headers: authHeaders() });
      setWeekly(res.data);
    } catch { setWeekly(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWeekly(); }, []);

  const onLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const dur = parseInt(duration);
    if (!dur || dur < 1) { toast({ title: "Enter duration", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      await axios.post(`${ServerAddress}/physical-health/movement/log`,
        { activity_type: activity, duration_min: dur, intensity, steps: steps ? parseInt(steps) : undefined, notes: notes || undefined },
        { headers: authHeaders() }
      );
      toast({ title: `${dur} min ${activity} logged` });
      setDuration("30"); setSteps(""); setNotes("");
      await fetchWeekly();
    } catch (err) {
      toast({ title: "Log failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const pct = weekly ? Math.min(100, Math.round((weekly.total_minutes / weekly.med_target_min) * 100)) : 0;

  return (
    <div className="space-y-5">
      {/* Weekly summary */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
          <Dumbbell className="h-5 w-5 text-warning" /> This Week's Movement
        </h3>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : weekly ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-4">
              <StatCell label="Total Minutes" value={`${weekly.total_minutes}`} />
              <StatCell label="Target" value={`${weekly.med_target_min} min`} />
              <StatCell label="Active Days" value={`${weekly.active_days}/7`} />
              {weekly.total_steps != null && <StatCell label="Total Steps" value={weekly.total_steps.toLocaleString()} />}
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress to MED target</span>
                <span>{pct}%</span>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${weekly.on_track ? "bg-success" : "bg-warning"}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${weekly.on_track ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
              {weekly.on_track ? "On track ✓" : "Keep moving!"}
            </span>
            {Object.keys(weekly.activity_breakdown).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(weekly.activity_breakdown).map(([act, mins]) => {
                  const meta = ACTIVITIES.find(a => a.value === act);
                  return (
                    <span key={act} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-foreground">
                      {meta?.emoji ?? "🏅"} {meta?.label ?? act}: {mins} min
                    </span>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No movement logged this week yet.</p>
        )}
      </div>

      {/* Log form */}
      <form onSubmit={onLog} className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
        <h3 className="flex items-center gap-2 text-base font-semibold text-foreground"><Plus className="h-5 w-5 text-primary" /> Log Activity</h3>
        <div>
          <label className="mb-2 block text-xs text-muted-foreground">Activity Type</label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITIES.map(a => (
              <button key={a.value} type="button" onClick={() => setActivity(a.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${activity === a.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary"}`}>
                {a.emoji} {a.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Duration (min)</label>
            <input type="number" min={1} max={600} value={duration} onChange={e => setDuration(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-2 block text-xs text-muted-foreground">Intensity</label>
            <div className="flex gap-2">
              {INTENSITIES.map(i => (
                <button key={i} type="button" onClick={() => setIntensity(i)}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-medium capitalize transition-colors ${intensity === i ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary"}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Steps (optional)</label>
            <input type="number" min={0} value={steps} onChange={e => setSteps(e.target.value)} placeholder="e.g. 5000" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Notes (optional)</label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. morning jog in the park" className={inputCls} />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Logging…</> : <><Dumbbell className="h-4 w-4" />Log Activity</>}
          </button>
        </div>
      </form>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="mt-0.5 text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";

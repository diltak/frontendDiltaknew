"use client";

import { useState } from "react";
import { Brain, Loader2, Wind } from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import ServerAddress from "@/constent/ServerAddress";
import type { TensionArea, BreathingExerciseType, StressBodyScanResponse } from "@/types/physical-health";

const TENSION_AREAS: { value: TensionArea; label: string; emoji: string }[] = [
  { value: "head", label: "Head", emoji: "🧠" },
  { value: "neck", label: "Neck", emoji: "🦒" },
  { value: "shoulders", label: "Shoulders", emoji: "💪" },
  { value: "chest", label: "Chest", emoji: "❤️" },
  { value: "gut", label: "Gut", emoji: "🫁" },
  { value: "back", label: "Back", emoji: "🦴" },
  { value: "legs", label: "Legs", emoji: "🦵" },
];

const BREATHING_TYPES: { value: BreathingExerciseType; label: string; desc: string }[] = [
  { value: "4_7_8", label: "4-7-8", desc: "Inhale 4s · Hold 7s · Exhale 8s" },
  { value: "box", label: "Box", desc: "Inhale 4s · Hold 4s · Exhale 4s · Hold 4s" },
  { value: "deep", label: "Deep", desc: "Slow deep belly breathing" },
];

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function tensionColor(t: number) {
  if (t <= 3) return "text-success";
  if (t <= 6) return "text-warning";
  return "text-destructive";
}

export default function StressTab() {
  // Body scan
  const [selectedAreas, setSelectedAreas] = useState<TensionArea[]>([]);
  const [tension, setTension] = useState(5);
  const [scanNotes, setScanNotes] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<StressBodyScanResponse | null>(null);

  // Breathing
  const [breathType, setBreathType] = useState<BreathingExerciseType>("4_7_8");
  const [cycles, setCycles] = useState(4);
  const [breathing, setBreathing] = useState(false);
  const [breathDone, setBreathDone] = useState(false);

  const toggleArea = (area: TensionArea) => {
    setSelectedAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
  };

  const onBodyScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAreas.length === 0) { toast({ title: "Select at least one tension area", variant: "destructive" }); return; }
    setScanning(true);
    try {
      const res = await axios.post<StressBodyScanResponse>(
        `${ServerAddress}/physical-health/stress/body-scan`,
        { tension_areas: selectedAreas, overall_tension: tension, notes: scanNotes || undefined },
        { headers: authHeaders() }
      );
      setScanResult(res.data);
      toast({ title: "Body scan logged" });
      setSelectedAreas([]); setScanNotes("");
    } catch (err) {
      toast({ title: "Log failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally { setScanning(false); }
  };

  const onBreathing = async (e: React.FormEvent) => {
    e.preventDefault();
    setBreathing(true);
    try {
      await axios.post(`${ServerAddress}/physical-health/stress/breathing`,
        { exercise_type: breathType, cycles },
        { headers: authHeaders() }
      );
      setBreathDone(true);
      toast({ title: `${cycles} cycles of ${breathType} breathing logged ✓` });
      setTimeout(() => setBreathDone(false), 4000);
    } catch (err) {
      toast({ title: "Log failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally { setBreathing(false); }
  };

  return (
    <div className="space-y-5">
      {/* Body scan result */}
      {scanResult && (
        <div className="rounded-lg border border-success/30 bg-success/10 p-4 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Body scan logged ✓</p>
          {scanResult.insight && <p className="text-xs text-muted-foreground mt-1">{scanResult.insight}</p>}
        </div>
      )}

      {/* Body scan form */}
      <form onSubmit={onBodyScan} className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
        <h3 className="flex items-center gap-2 text-base font-semibold text-foreground"><Brain className="h-5 w-5 text-primary" /> Body Scan</h3>
        <p className="text-xs text-muted-foreground">Select areas where you feel tension right now.</p>
        <div className="flex flex-wrap gap-2">
          {TENSION_AREAS.map(a => (
            <button key={a.value} type="button" onClick={() => toggleArea(a.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${selectedAreas.includes(a.value) ? "border-destructive bg-destructive/10 text-destructive" : "border-border text-muted-foreground hover:border-destructive/50"}`}>
              {a.emoji} {a.label}
            </button>
          ))}
        </div>
        <div>
          <label className="mb-2 block text-xs text-muted-foreground">
            Overall Tension: <span className={`font-semibold ${tensionColor(tension)}`}>{tension}/10</span>
          </label>
          <input type="range" min={1} max={10} step={1} value={tension} onChange={e => setTension(Number(e.target.value))} className="w-full accent-primary" />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>1 · Relaxed</span><span>10 · Very tense</span></div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Notes (optional)</label>
          <input type="text" value={scanNotes} onChange={e => setScanNotes(e.target.value)} placeholder="e.g. stressful meeting earlier" className={inputCls} />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={scanning} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {scanning ? <><Loader2 className="h-5 w-5 animate-spin" />Logging…</> : <><Brain className="h-5 w-5" />Log Scan</>}
          </button>
        </div>
      </form>

      {/* Breathing exercise */}
      <form onSubmit={onBreathing} className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
        <h3 className="flex items-center gap-2 text-base font-semibold text-foreground"><Wind className="h-5 w-5 text-info" /> Breathing Exercise</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {BREATHING_TYPES.map(b => (
            <button key={b.value} type="button" onClick={() => setBreathType(b.value)}
              className={`rounded-lg border p-3 text-left transition-colors ${breathType === b.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
              <p className={`text-sm font-semibold ${breathType === b.value ? "text-primary" : "text-foreground"}`}>{b.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{b.desc}</p>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-muted-foreground">Cycles: <span className="font-semibold text-foreground">{cycles}</span></label>
            <input type="range" min={1} max={20} step={1} value={cycles} onChange={e => setCycles(Number(e.target.value))} className="w-full accent-primary" />
          </div>
          <button type="submit" disabled={breathing} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 flex-shrink-0">
            {breathing ? <><Loader2 className="h-5 w-5 animate-spin" />Logging…</> : breathDone ? "Logged ✓" : <><Wind className="h-5 w-5" />Log Session</>}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";

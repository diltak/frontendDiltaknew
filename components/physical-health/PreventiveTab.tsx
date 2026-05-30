"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CalendarCheck, CheckCircle2, Clock, Loader2, Plus } from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import ServerAddress from "@/constent/ServerAddress";
import type { PreventiveCalendarResponse, PreventiveCalendarItem } from "@/types/physical-health";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); }
  catch { return iso; }
}

function statusBadge(item: PreventiveCalendarItem) {
  if (item.overdue) return <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-[10px] font-semibold"><AlertTriangle className="h-3 w-3" />Overdue</span>;
  if (item.next_due) {
    const daysLeft = Math.ceil((new Date(item.next_due).getTime() - Date.now()) / 86400000);
    if (daysLeft <= 30) return <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 text-warning px-2 py-0.5 text-[10px] font-semibold"><Clock className="h-3 w-3" />Due soon</span>;
  }
  if (item.last_done) return <span className="inline-flex items-center gap-1 rounded-full bg-success/10 text-success px-2 py-0.5 text-[10px] font-semibold"><CheckCircle2 className="h-3 w-3" />Up to date</span>;
  return <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-semibold">Not logged</span>;
}

export default function PreventiveTab() {
  const [calendar, setCalendar] = useState<PreventiveCalendarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // form
  const [screeningType, setScreeningType] = useState("");
  const [dateDone, setDateDone] = useState("");
  const [resultSummary, setResultSummary] = useState("");
  const [nextDue, setNextDue] = useState("");
  const [provider, setProvider] = useState("");

  const fetchCalendar = async () => {
    try {
      const res = await axios.get(`${ServerAddress}/physical-health/preventive/calendar`, { headers: authHeaders() });
      setCalendar(res.data);
    } catch { setCalendar(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCalendar(); }, []);

  const onLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screeningType || !dateDone) { toast({ title: "Screening type and date are required", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      await axios.post(`${ServerAddress}/physical-health/preventive/screening/log`,
        { screening_type: screeningType, date_done: dateDone, result_summary: resultSummary || undefined, next_due: nextDue || undefined, provider: provider || undefined },
        { headers: authHeaders() }
      );
      toast({ title: "Screening logged" });
      setScreeningType(""); setDateDone(""); setResultSummary(""); setNextDue(""); setProvider("");
      setShowForm(false);
      await fetchCalendar();
    } catch (err) {
      toast({ title: "Log failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const overdue = calendar?.screenings.filter(s => s.overdue) ?? [];
  const dueSoon = calendar?.screenings.filter(s => !s.overdue && s.next_due && Math.ceil((new Date(s.next_due).getTime() - Date.now()) / 86400000) <= 30) ?? [];
  const upToDate = calendar?.screenings.filter(s => !s.overdue && s.last_done) ?? [];
  const notLogged = calendar?.screenings.filter(s => !s.overdue && !s.last_done) ?? [];

  return (
    <div className="space-y-5">
      {/* Summary banner */}
      {calendar && (calendar.overdue_count > 0 || calendar.due_soon_count > 0) && (
        <div className={`rounded-lg border p-4 shadow-sm ${calendar.overdue_count > 0 ? "border-destructive/30 bg-destructive/10" : "border-warning/30 bg-warning/10"}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${calendar.overdue_count > 0 ? "text-destructive" : "text-warning"}`} />
            <p className="text-sm font-semibold text-foreground">
              {calendar.overdue_count > 0 && `${calendar.overdue_count} overdue screening${calendar.overdue_count > 1 ? "s" : ""}`}
              {calendar.overdue_count > 0 && calendar.due_soon_count > 0 && " · "}
              {calendar.due_soon_count > 0 && `${calendar.due_soon_count} due soon`}
            </p>
          </div>
        </div>
      )}

      {/* Log button */}
      <div className="flex justify-end">
        <button onClick={() => setShowForm(v => !v)} className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
          <Plus className="h-4 w-4" />{showForm ? "Cancel" : "Log Screening"}
        </button>
      </div>

      {/* Log form */}
      {showForm && (
        <form onSubmit={onLog} className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-foreground"><CalendarCheck className="h-5 w-5 text-primary" /> Log Preventive Screening</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Screening Type *</label>
              <input type="text" value={screeningType} onChange={e => setScreeningType(e.target.value)} placeholder="e.g. blood_test, eye_exam, dental" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Date Done *</label>
              <input type="date" value={dateDone} onChange={e => setDateDone(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Next Due (optional)</label>
              <input type="date" value={nextDue} onChange={e => setNextDue(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Provider (optional)</label>
              <input type="text" value={provider} onChange={e => setProvider(e.target.value)} placeholder="e.g. Apollo Hospital" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-muted-foreground">Result Summary (optional)</label>
              <textarea value={resultSummary} onChange={e => setResultSummary(e.target.value)} rows={2} placeholder="e.g. All values normal" className={`${inputCls} resize-none`} />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : <><CalendarCheck className="h-4 w-4" />Save</>}
            </button>
          </div>
        </form>
      )}

      {/* Calendar */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : !calendar || calendar.screenings.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <CalendarCheck className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No screening calendar yet. Complete your health profile to get personalised recommendations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[
            { title: "Overdue", items: overdue, accent: "border-l-destructive" },
            { title: "Due Soon", items: dueSoon, accent: "border-l-warning" },
            { title: "Up to Date", items: upToDate, accent: "border-l-success" },
            { title: "Not Yet Logged", items: notLogged, accent: "border-l-muted-foreground" },
          ].filter(g => g.items.length > 0).map(group => (
            <div key={group.title} className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/30">
                <h4 className="text-sm font-semibold text-foreground">{group.title} <span className="text-muted-foreground font-normal">({group.items.length})</span></h4>
              </div>
              <ul className="divide-y divide-border">
                {group.items.map(item => (
                  <li key={item.screening_type} className={`px-5 py-3 border-l-4 ${group.accent}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.display_name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Frequency: {item.recommended_freq}
                          {item.last_done && ` · Last: ${formatDate(item.last_done)}`}
                          {item.next_due && ` · Next: ${formatDate(item.next_due)}`}
                        </p>
                        {item.notes && <p className="text-[11px] text-muted-foreground mt-0.5 italic">{item.notes}</p>}
                      </div>
                      {statusBadge(item)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";

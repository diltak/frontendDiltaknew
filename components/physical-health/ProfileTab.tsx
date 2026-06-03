"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, User } from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import ServerAddress from "@/constent/ServerAddress";
import type { PhysicalHealthProfileResponse, FamilyHistory } from "@/types/physical-health";

const BLOOD_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const SEX_OPTIONS = [{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }];
const SMOKING_OPTIONS = [{ value: "never", label: "Never" }, { value: "former", label: "Former" }, { value: "current", label: "Current" }];
const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentary" }, { value: "light", label: "Light" },
  { value: "moderate", label: "Moderate" }, { value: "active", label: "Active" }, { value: "very_active", label: "Very Active" },
];
const CHRONOTYPE_OPTIONS = [{ value: "early_bird", label: "Early Bird 🌅" }, { value: "intermediate", label: "Intermediate" }, { value: "night_owl", label: "Night Owl 🦉" }];
const FAMILY_HISTORY_FIELDS: { key: keyof FamilyHistory; label: string }[] = [
  { key: "diabetes", label: "Diabetes" }, { key: "heart_disease", label: "Heart Disease" },
  { key: "hypertension", label: "Hypertension" }, { key: "cancer", label: "Cancer" },
  { key: "thyroid", label: "Thyroid" }, { key: "mental_illness", label: "Mental Illness" },
];

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function bmiColor(cat?: string | null) {
  if (!cat) return "text-muted-foreground";
  const c = cat.toLowerCase();
  if (c.includes("normal")) return "text-success";
  if (c.includes("over") || c.includes("obese")) return "text-destructive";
  return "text-warning";
}

export default function ProfileTab() {
  const [profile, setProfile] = useState<PhysicalHealthProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // form state
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [chronicConditions, setChronicConditions] = useState("");
  const [medications, setMedications] = useState("");
  const [allergies, setAllergies] = useState("");
  const [smokingStatus, setSmokingStatus] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [chronotype, setChronotype] = useState("");
  const [familyHistory, setFamilyHistory] = useState<FamilyHistory>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${ServerAddress}/physical-health/profile`, { headers: authHeaders() });
        const p: PhysicalHealthProfileResponse = res.data;
        setProfile(p);
        setDob(p.dob ?? "");
        setSex(p.sex ?? "");
        setHeightCm(p.height_cm != null ? String(p.height_cm) : "");
        setWeightKg(p.weight_kg != null ? String(p.weight_kg) : "");
        setBloodGroup(p.blood_group ?? "");
        setChronicConditions((p.chronic_conditions ?? []).join(", "));
        setMedications((p.medications ?? []).join(", "));
        setAllergies((p.allergies ?? []).join(", "));
        setSmokingStatus(p.smoking_status ?? "");
        setActivityLevel(p.activity_level ?? "");
        setChronotype(p.chronotype ?? "");
        setFamilyHistory(p.family_history ?? {});
      } catch { /* no profile yet */ }
      finally { setLoading(false); }
    })();
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      if (dob) payload.dob = dob;
      if (sex) payload.sex = sex;
      if (heightCm) payload.height_cm = parseFloat(heightCm);
      if (weightKg) payload.weight_kg = parseFloat(weightKg);
      if (bloodGroup) payload.blood_group = bloodGroup;
      payload.chronic_conditions = chronicConditions.split(",").map(s => s.trim()).filter(Boolean);
      payload.medications = medications.split(",").map(s => s.trim()).filter(Boolean);
      payload.allergies = allergies.split(",").map(s => s.trim()).filter(Boolean);
      if (smokingStatus) payload.smoking_status = smokingStatus;
      if (activityLevel) payload.activity_level = activityLevel;
      if (chronotype) payload.chronotype = chronotype;
      payload.family_history = familyHistory;

      const res = await axios.post(`${ServerAddress}/physical-health/profile`, payload, { headers: authHeaders() });
      setProfile(res.data);
      toast({ title: "Profile saved" });
    } catch (err) {
      toast({ title: "Save failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5">
      {/* BMI card */}
      {profile?.bmi != null && (
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">BMI</p>
              <p className={`text-2xl font-bold ${bmiColor(profile.bmi_category)}`}>{profile.bmi.toFixed(1)}</p>
            </div>
          </div>
          {profile.bmi_category && (
            <span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${bmiColor(profile.bmi_category)} bg-muted`}>
              {profile.bmi_category}
            </span>
          )}
        </div>
      )}

      <form onSubmit={onSave} className="space-y-5">
        {/* Basic info */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-foreground">Basic Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Date of Birth"><input type="date" value={dob} onChange={e => setDob(e.target.value)} className={inputCls} /></Field>
            <Field label="Sex">
              <select value={sex} onChange={e => setSex(e.target.value)} className={inputCls}>
                <option value="">Select…</option>
                {SEX_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Blood Group">
              <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} className={inputCls}>
                <option value="">Select…</option>
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Height (cm)"><input type="number" min={50} max={250} step={0.1} value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="e.g. 170" className={inputCls} /></Field>
            <Field label="Weight (kg)"><input type="number" min={20} max={300} step={0.1} value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="e.g. 70" className={inputCls} /></Field>
            <Field label="Smoking Status">
              <select value={smokingStatus} onChange={e => setSmokingStatus(e.target.value)} className={inputCls}>
                <option value="">Select…</option>
                {SMOKING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Activity Level">
              <select value={activityLevel} onChange={e => setActivityLevel(e.target.value)} className={inputCls}>
                <option value="">Select…</option>
                {ACTIVITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Chronotype">
              <select value={chronotype} onChange={e => setChronotype(e.target.value)} className={inputCls}>
                <option value="">Select…</option>
                {CHRONOTYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* Medical history */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-foreground">Medical History</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Chronic Conditions (comma-separated)"><input type="text" value={chronicConditions} onChange={e => setChronicConditions(e.target.value)} placeholder="e.g. diabetes, asthma" className={inputCls} /></Field>
            <Field label="Medications (comma-separated)"><input type="text" value={medications} onChange={e => setMedications(e.target.value)} placeholder="e.g. metformin, aspirin" className={inputCls} /></Field>
            <Field label="Allergies (comma-separated)"><input type="text" value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="e.g. penicillin, peanuts" className={inputCls} /></Field>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Family History</p>
            <div className="flex flex-wrap gap-3">
              {FAMILY_HISTORY_FIELDS.map(f => (
                <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!familyHistory[f.key]} onChange={e => setFamilyHistory(prev => ({ ...prev, [f.key]: e.target.checked }))} className="accent-primary" />
                  <span className="text-sm text-foreground">{f.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? <><Loader2 className="h-5 w-5 animate-spin" />Saving…</> : <><Save className="h-5 w-5" />Save Profile</>}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";

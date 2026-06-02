/**
 * types/physical-health.ts
 *
 * TypeScript mirror of the Pydantic models in
 * `human/physical_health_schemas.py`. Field names are intentionally
 * snake_case to match the backend response shape 1:1 — do not rename.
 */

// ─── Enum-like string unions ─────────────────────────────────────────────────

export type TrendPeriod = '7d' | '14d' | '30d' | '90d';

export type ReportType = 'weekly' | 'monthly' | 'on_demand';

export type MedicalReportType =
  | 'lab_work'
  | 'blood_test'
  | 'xray_mri'
  | 'prescription'
  | 'general_checkup'
  | 'specialist'
  | 'other';

export type UrgencyLevel = 'routine' | 'follow_up' | 'urgent' | 'emergency';

export type DocStatus = 'uploaded' | 'processing' | 'analyzed' | 'failed' | 'unknown';

export type ExerciseType = 'walk' | 'gym' | 'yoga' | 'sport' | 'other' | 'none';

export type HealthLevel = 'low' | 'medium' | 'high';

export type FlaggedStatus = 'high' | 'low' | 'normal' | 'borderline';

export type TrendDirection = 'improving' | 'declining' | 'stable';

// ─── Check-in ────────────────────────────────────────────────────────────────

export interface PhysicalCheckInRequest {
  energy_level: number;        // 1-10
  sleep_quality: number;       // 1-10
  sleep_hours: number;         // 0-24
  exercise_done: boolean;
  exercise_minutes: number;    // 0+
  exercise_type: ExerciseType | string;
  nutrition_quality: number;   // 1-10
  pain_level: number;          // 1-10 (10 = no pain)
  hydration: number;           // 1-10
  notes?: string | null;
}

export interface PhysicalCheckInResponse {
  success: boolean;
  checkin_id: string;
  nudge?: string | null;
}

export interface CheckInHistoryItem {
  checkin_id: string;
  created_at: string;
  energy_level: number;
  sleep_quality: number;
  sleep_hours: number;
  exercise_done: boolean;
  exercise_minutes: number;
  exercise_type: string;
  nutrition_quality: number;
  pain_level: number;
  hydration: number;
  notes?: string | null;
}

export interface CheckInHistoryResponse {
  success: boolean;
  checkins: CheckInHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── Score & Trends ──────────────────────────────────────────────────────────

export interface PhysicalHealthScoreResponse {
  score: number;
  level: HealthLevel | string;
  last_checkin_date?: string | null;
  days_since_checkin?: number | null;
  streak_days: number;
  highlights: string[];
  concerns: string[];
}

export interface TrendPoint {
  date: string;
  energy_level?: number | null;
  sleep_quality?: number | null;
  sleep_hours?: number | null;
  exercise_minutes?: number | null;
  nutrition_quality?: number | null;
  pain_level?: number | null;
  hydration?: number | null;
}

export interface HealthTrendsAverages {
  energy_level: number;
  sleep_quality: number;
  sleep_hours: number;
  nutrition_quality: number;
  pain_level: number;
  hydration: number;
  exercise_days_per_week: number;
  [key: string]: number;
}

export interface HealthTrendsResponse {
  period: string;
  data_points: TrendPoint[];
  averages: HealthTrendsAverages;
  trend_direction: Record<string, TrendDirection | string>;
  total_checkins: number;
}

// ─── Medical documents ───────────────────────────────────────────────────────

export interface FlaggedValue {
  name: string;
  value: string;
  normal_range: string;
  status: FlaggedStatus | string;
  plain_explanation: string;
}

export interface MedicalDocumentDetail {
  doc_id: string;
  filename: string;
  report_type: MedicalReportType | string;
  report_date?: string | null;
  issuing_facility?: string | null;
  status: DocStatus | string;
  uploaded_at: string;
  analyzed_at?: string | null;
  summary?: string | null;
  key_findings?: string[] | null;
  flagged_values?: FlaggedValue[] | null;
  recommendations?: string[] | null;
  follow_up_needed?: boolean | null;
  urgency_level: UrgencyLevel | string;
}

export interface MedicalDocumentListResponse {
  success: boolean;
  documents: MedicalDocumentDetail[];
  total: number;
}

export interface MedicalDocumentUploadResponse {
  success: boolean;
  doc_id: string;
  status: string;
  message: string;
}

export interface MedicalDocumentStatusResponse {
  doc_id: string;
  status: DocStatus | string;
  analyzed_at?: string | null;
  urgency_level?: string | null;
}

export interface MedicalDocumentUploadMeta {
  report_type: MedicalReportType;
  report_date?: string;      // YYYY-MM-DD
  issuing_facility?: string;
}

export interface MedicalDocumentDeleteResponse {
  success: boolean;
  doc_id: string;
  message: string;
}

// ─── Periodic reports ────────────────────────────────────────────────────────

export interface PeriodicReportRequest {
  report_type: ReportType;
  days: number;              // 7-365
}

export interface PeriodicReportResponse {
  report_id: string;
  period_start: string;
  period_end: string;
  report_type: string;
  overall_score: number;
  overall_level: HealthLevel | string;
  trend: string;
  avg_energy: number;
  avg_sleep_quality: number;
  avg_sleep_hours: number;
  avg_exercise_minutes_daily: number;
  avg_nutrition_quality: number;
  avg_pain_level: number;
  exercise_days: number;
  summary: string;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  follow_up_suggested: boolean;
  generated_at: string;
}

export interface ReportListItem {
  report_id: string;
  report_type: string;
  overall_score: number;
  overall_level: HealthLevel | string;
  trend: string;
  period_start: string;
  period_end: string;
  generated_at: string | null;
  follow_up_suggested: boolean;
}

export interface ReportListResponse {
  success: boolean;
  reports: ReportListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── Medical Q&A ─────────────────────────────────────────────────────────────

export interface AskRequest {
  question: string;          // min 5 chars
}

export interface AskResponse {
  answer: string;
  source_doc_ids: string[];
  confidence: number;
  disclaimer: string;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export type SexType = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';
export type SmokingStatus = 'never' | 'former' | 'current' | 'occasional';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'athlete';
export type Chronotype = 'early_bird' | 'night_owl' | 'intermediate';

export interface FamilyHistory {
  diabetes?: boolean;
  heart_disease?: boolean;
  hypertension?: boolean;
  cancer?: boolean;
  thyroid?: boolean;
  mental_illness?: boolean;
}

export interface PhysicalHealthProfileRequest {
  dob?: string;
  sex?: SexType;
  height_cm?: number;
  weight_kg?: number;
  blood_group?: BloodGroup;
  chronic_conditions?: string[];
  medications?: string[];
  allergies?: string[];
  family_history?: FamilyHistory;
  smoking_status?: SmokingStatus;
  activity_level?: ActivityLevel;
  chronotype?: Chronotype;
}

export interface PhysicalHealthProfileResponse {
  profile_id: string;
  dob?: string | null;
  sex?: SexType | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  bmi?: number | null;
  bmi_category?: string | null;
  blood_group?: BloodGroup | null;
  chronic_conditions: string[];
  medications: string[];
  allergies: string[];
  family_history: FamilyHistory;
  smoking_status?: SmokingStatus | null;
  activity_level?: ActivityLevel | null;
  chronotype?: Chronotype | null;
  updated_at: string;
}

// ─── Vitals ──────────────────────────────────────────────────────────────────

export type VitalType = 'bp' | 'blood_sugar' | 'heart_rate' | 'weight' | 'spo2';
export type VitalContext = 'fasting' | 'post_meal' | 'resting' | 'post_exercise';
export type AlertTier = 'normal' | 'warning' | 'critical';

export interface VitalLogRequest {
  vital_type: VitalType;
  value_primary: number;
  value_secondary?: number;
  context?: VitalContext;
  measured_at?: string;
}

export interface VitalLogResponse {
  log_id: string;
  vital_type: VitalType;
  value_primary: number;
  value_secondary?: number | null;
  unit: string;
  context?: VitalContext | null;
  alert_tier: AlertTier;
  alert_message?: string | null;
  measured_at: string;
}

export interface VitalLatestItem {
  vital_type: VitalType;
  value_primary: number;
  value_secondary?: number | null;
  unit: string;
  alert_tier: AlertTier;
  measured_at: string;
  days_ago: number;
}

export interface VitalReading {
  log_id: string;
  value_primary: number;
  value_secondary?: number | null;
  context?: string | null;
  alert_tier: AlertTier;
  measured_at: string;
}

export interface VitalTrendResponse {
  vital_type: VitalType;
  period: string;
  readings: VitalReading[];
  latest_alert: AlertTier;
  trend: string;
  count: number;
}

// ─── Hydration ───────────────────────────────────────────────────────────────

export type BeverageType = 'water' | 'tea' | 'coffee' | 'juice' | 'other';

export interface HydrationLogRequest {
  amount_ml: number;
  beverage_type?: BeverageType;
  logged_at?: string;
}

export interface HydrationLog {
  log_id: string;
  amount_ml: number;
  beverage_type: BeverageType;
  effective_ml: number;
  logged_at: string;
}

export interface HydrationTodayResponse {
  total_ml: number;
  target_ml: number;
  effective_ml: number;
  percentage: number;
  on_track: boolean;
  beverage_breakdown: Record<string, number>;
  logs: HydrationLog[];
}

// ─── Sleep ───────────────────────────────────────────────────────────────────

export interface SleepLogRequest {
  bedtime: string;
  wake_time: string;
  quality_score: number;
  interruptions?: number;
  dream_recall?: boolean;
  notes?: string;
}

export interface SleepLogResponse {
  log_id: string;
  bedtime: string;
  wake_time: string;
  duration_hours: number;
  quality_score: number;
  sleep_score: number;
  debt_hours: number;
  logged_at: string;
}

export interface SleepLogItem {
  log_id: string;
  bedtime: string;
  wake_time: string;
  duration_hours: number;
  quality_score: number;
  sleep_score: number;
  logged_at: string;
}

export interface SleepTrendsResponse {
  period: string;
  avg_duration: number;
  avg_quality: number;
  avg_score: number;
  weekly_debt_hours: number;
  chronotype?: string | null;
  logs: SleepLogItem[];
}

// ─── Movement ────────────────────────────────────────────────────────────────

export type MovementActivityType = 'walk' | 'run' | 'gym' | 'yoga' | 'sport' | 'desk_stretch' | 'other';
export type MovementIntensity = 'low' | 'moderate' | 'high';

export interface MovementLogRequest {
  activity_type: MovementActivityType;
  duration_min: number;
  intensity?: MovementIntensity;
  steps?: number;
  notes?: string;
  logged_at?: string;
}

export interface MovementWeeklyResponse {
  week_start: string;
  total_minutes: number;
  med_target_min: number;
  on_track: boolean;
  active_days: number;
  total_steps: number;
  activity_breakdown: Record<string, number>;
}

// ─── Energy ──────────────────────────────────────────────────────────────────

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export interface EnergyLogRequest {
  energy_level: number;
  focus_level: number;
  time_of_day: TimeOfDay;
  notes?: string;
}

export interface EnergyLogItem {
  log_id: string;
  energy_level: number;
  focus_level: number;
  time_of_day: TimeOfDay;
  notes?: string | null;
  logged_at: string;
}

export interface EnergyTodayResponse {
  date: string;
  logs: EnergyLogItem[];
  avg_energy: number;
  avg_focus: number;
  pattern?: string | null;
}

// ─── Stress ──────────────────────────────────────────────────────────────────

export type TensionArea = 'head' | 'neck' | 'shoulders' | 'chest' | 'gut' | 'back' | 'legs';
export type BreathingExerciseType = '4_7_8' | 'box' | 'deep';

export interface StressBodyScanRequest {
  tension_areas: TensionArea[];
  overall_tension: number;
  notes?: string;
}

export interface StressBodyScanResponse {
  log_id: string;
  tension_areas: TensionArea[];
  overall_tension: number;
  insight?: string | null;
  logged_at: string;
}

export interface StressBreathingRequest {
  exercise_type?: BreathingExerciseType;
  cycles?: number;
}

export interface StressBreathingResponse {
  session_id: string;
  exercise_type: BreathingExerciseType;
  cycles: number;
  duration_seconds: number;
  completed_at: string;
  message?: string | null;
}

// ─── Preventive ──────────────────────────────────────────────────────────────

export interface PreventiveScreeningLogRequest {
  screening_type: string;
  date_done: string;
  result_summary?: string;
  next_due?: string;
  provider?: string;
}

export interface PreventiveCalendarItem {
  screening_type: string;
  display_name: string;
  recommended_freq: string;
  last_done?: string | null;
  next_due?: string | null;
  overdue: boolean;
  notes?: string | null;
}

export interface PreventiveCalendarResponse {
  screenings: PreventiveCalendarItem[];
  overdue_count: number;
  due_soon_count: number;
}

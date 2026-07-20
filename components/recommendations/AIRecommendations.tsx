'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Heart, Zap, Moon, Target, Sparkles,
  Shield, Clock, Play, CheckCircle, RefreshCw,
  TrendingUp, AlertCircle, MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { apiGet, apiPost } from '@/lib/api-client';

// Backend GET /api/reports/recent response shape
interface ReportsRecentResponse {
  success: boolean;
  data: {
    personalHistory?: {
      history: { recentReports: Array<LatestReport & { generated_at?: string; created_at?: string }> };
    } | null;
  };
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface AIRecommendation {
  id: string;
  recommendation_type: 'meditation' | 'journaling' | 'breathing' | 'exercise' | 'sleep' | 'nutrition' | 'social' | 'work_life_balance';
  title: string;
  description: string;
  instructions: string[];
  duration_minutes: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  mood_targets: string[];
  wellness_metrics_affected: string[];
  ai_generated: boolean;
  personalized_for_user: boolean;
  created_at: string;
}

interface LatestReport {
  mood_rating?: number;
  stress_level?: number;
  energy_level?: number;
  anxiety_level?: number;
  work_life_balance?: number;
  sleep_quality?: number;
  ai_analysis?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function recIcon(type: string) {
  const map: Record<string, React.ReactNode> = {
    meditation:       <Brain className="h-5 w-5" />,
    journaling:       <Target className="h-5 w-5" />,
    breathing:        <Heart className="h-5 w-5" />,
    exercise:         <Zap className="h-5 w-5" />,
    sleep:            <Moon className="h-5 w-5" />,
    social:           <MessageSquare className="h-5 w-5" />,
    work_life_balance:<Shield className="h-5 w-5" />,
    nutrition:        <TrendingUp className="h-5 w-5" />,
  };
  return map[type] ?? <Sparkles className="h-5 w-5" />;
}

function recIconBg(type: string) {
  const map: Record<string, string> = {
    meditation:        'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
    journaling:        'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
    breathing:         'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400',
    exercise:          'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
    sleep:             'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
    social:            'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400',
    work_life_balance: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    nutrition:         'bg-lime-100 dark:bg-lime-900/40 text-lime-600 dark:text-lime-400',
  };
  return map[type] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
}

function diffBadge(d: string) {
  if (d === 'beginner')     return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (d === 'intermediate') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
}

// ── Skeleton card ──────────────────────────────────────────────────────────────

function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, delay }}
      className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="w-16 h-4 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="space-y-2">
        <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
      </div>
      <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
    </motion.div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AIRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [latestReport, setLatestReport] = useState<LatestReport | null>(null);
  const [noReportFound, setNoReportFound] = useState(false);

  // Fetch the most recent mental_health_reports entry for this user.
  // Backend already filters to the user via personalHistory + sorts desc.
  const fetchLatestReport = useCallback(async (): Promise<LatestReport | null> => {
    if (!user?.id || !user?.company_id) return null;
    try {
      const params = new URLSearchParams({
        companyId: user.company_id,
        userId: user.id,
        days: '90',
      });
      const res = await apiGet<ReportsRecentResponse>(`/reports/recent?${params}`);
      const items = res?.data?.personalHistory?.history?.recentReports ?? [];
      if (items.length === 0) return null;
      const sorted = [...items].sort((a, b) => {
        const ad = (a.created_at ?? a.generated_at ?? '');
        const bd = (b.created_at ?? b.generated_at ?? '');
        return bd.localeCompare(ad);
      });
      return sorted[0] as LatestReport;
    } catch {
      return null;
    }
  }, [user?.id, user?.company_id]);

  const fetchRecommendations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setRecommendations([]);

    try {
      // Get real metrics from latest wellness report
      const report = await fetchLatestReport();
      setLatestReport(report);

      if (!report) {
        setNoReportFound(true);
        setLoading(false);
        return;
      }

      setNoReportFound(false);

      const mood    = report.mood_rating    ?? 5;
      const stress  = report.stress_level   ?? 5;
      const energy  = report.energy_level   ?? 5;

      const result = await apiPost<{ success: boolean; recommendations: AIRecommendation[] }>(
        '/recommendations/generate',
        {
          employee_id:    user.id,
          company_id:     user.company_id,
          current_mood:   Math.max(1, Math.min(10, Math.round(mood))),
          current_stress: Math.max(1, Math.min(10, Math.round(stress))),
          current_energy: Math.max(1, Math.min(10, Math.round(energy))),
          time_available: 15,
        }
      );

      if (result.success && result.recommendations.length > 0) {
        setRecommendations(result.recommendations);
        toast.success('AI recommendations ready!');
      }
    } catch (err) {
      console.error('Recommendations error:', err);
      toast.error('Could not generate recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, fetchLatestReport]);

  useEffect(() => {
    if (user) fetchRecommendations();
  }, [user, fetchRecommendations]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Recommendations
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {latestReport
              ? 'Personalized based on your latest wellness session'
              : 'Complete a wellness chat to get personalized recommendations'}
          </p>
        </div>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Latest report context badge */}
      {latestReport && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 text-xs"
        >
          {[
            { label: 'Mood',    value: latestReport.mood_rating,    color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' },
            { label: 'Stress',  value: latestReport.stress_level,   color: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300' },
            { label: 'Energy',  value: latestReport.energy_level,   color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300' },
            { label: 'Sleep',   value: latestReport.sleep_quality,  color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300' },
          ].filter(m => m.value !== undefined).map(m => (
            <span key={m.label} className={`px-2.5 py-1 rounded-full font-medium ${m.color}`}>
              {m.label}: {m.value}/10
            </span>
          ))}
          <span className="px-2.5 py-1 rounded-full font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
            ✦ Based on your latest session
          </span>
        </motion.div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="h-5 w-5 text-purple-400" />
            </motion.div>
            <span className="text-base font-semibold text-gray-800 dark:text-gray-100">
              Generating your personalized recommendations…
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">AI is analyzing your data</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} delay={i * 0.15} />
            ))}
          </div>
        </div>
      )}

      {/* No report yet — prompt to chat */}
      {!loading && noReportFound && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-10 flex flex-col items-center gap-4 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-purple-500" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-800 dark:text-gray-100">No wellness data found yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
              Complete at least one wellness chat session so the AI can generate personalized recommendations just for you.
            </p>
          </div>
          <a
            href="/employee/chat"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <MessageSquare className="h-5 w-5" />
            Start Wellness Chat
          </a>
        </motion.div>
      )}

      {/* AI Recommendations grid */}
      <AnimatePresence>
        {!loading && recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {recommendations.map((rec, i) => {
              const isDone = completed.has(rec.id);
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`rounded-2xl border p-5 flex flex-col gap-3 shadow-sm transition-colors ${
                    isDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700'
                  }`}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${recIconBg(rec.recommendation_type)}`}>
                      {recIcon(rec.recommendation_type)}
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${diffBadge(rec.difficulty_level)}`}>
                      {rec.difficulty_level}
                    </span>
                  </div>

                  {/* Title + desc */}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug">{rec.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">{rec.description}</p>
                  </div>

                  {/* Instructions preview */}
                  {rec.instructions?.length > 0 && (
                    <ul className="space-y-1">
                      {rec.instructions.slice(0, 2).map((step, j) => (
                        <li key={j} className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{j + 1}</span>
                          <span className="line-clamp-1">{step}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Duration */}
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{rec.duration_minutes} min</span>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => {
                      setCompleted(prev => new Set([...prev, rec.id]));
                      toast.success('Great job completing this activity! 🎉');
                    }}
                    disabled={isDone}
                    className={`w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl transition-colors ${
                      isDone
                        ? 'bg-emerald-500 text-white cursor-default'
                        : 'bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600'
                    }`}
                  >
                    {isDone ? (
                      <><CheckCircle className="h-3.5 w-3.5" /> Completed</>
                    ) : (
                      <><Play className="h-3.5 w-3.5" /> Start Activity</>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

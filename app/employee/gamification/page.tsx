'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Flame, Star, Target, Award, Medal,
  Zap, CheckCircle, Clock, Users, Lock, ChevronRight, RefreshCw, Gift,
} from 'lucide-react';
import { withAuth } from '@/components/auth/with-auth';
import { useAuth } from '@/contexts/auth-context';
import { apiPost } from '@/lib/api-client';
import { toast } from 'sonner';
import { BrandLoader } from '@/components/loader';

// ── Types ───────────────────────────────────────────────────────────────────

interface UserStats {
  id: string; employee_id: string; company_id: string;
  current_streak: number; longest_streak: number; total_points: number;
  level: number; badges: string[]; challenges_completed: number;
  last_check_in: string | null; weekly_goal: number; monthly_goal: number;
}

interface WellnessChallenge {
  id: string; title: string; description?: string;
  challenge_type?: string; duration_days?: number;
  points_reward?: number; badge_reward?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  is_active?: boolean; participants?: string[];
}

// ── Constants ───────────────────────────────────────────────────────────────

const BADGE_META: Record<string, { label: string; emoji: string; bg: string; text: string }> = {
  first_check_in:  { label: 'First Check-In',  emoji: '🌱', bg: 'bg-success-subtle',  text: 'text-success-bold' },
  week_warrior:    { label: 'Week Warrior',     emoji: '🗡️',  bg: 'bg-warning-subtle',  text: 'text-warning-bold' },
  month_master:    { label: 'Month Master',     emoji: '👑',  bg: 'bg-primary-50',      text: 'text-primary-700' },
  century_streak:  { label: 'Century Streak',   emoji: '💯',  bg: 'bg-error-subtle',    text: 'text-error-bold' },
  point_collector: { label: 'Point Collector',  emoji: '⭐',  bg: 'bg-warning-subtle',  text: 'text-warning-bold' },
  point_master:    { label: 'Point Master',     emoji: '🏆',  bg: 'bg-primary-50',      text: 'text-primary-600' },
  level_five:      { label: 'Level 5 Achiever', emoji: '🎯',  bg: 'bg-bg-100',          text: 'text-brand-600' },
  level_ten:       { label: 'Master Level 10',  emoji: '🔥',  bg: 'bg-error-subtle',    text: 'text-error-bold' },
};

const ALL_BADGES = Object.keys(BADGE_META);
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];

function getLevel(pts: number) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--)
    if (pts >= LEVEL_THRESHOLDS[i]) return i + 1;
  return 1;
}

function getLevelProgress(pts: number) {
  const lv = getLevel(pts) - 1;
  const cur = LEVEL_THRESHOLDS[Math.min(lv, LEVEL_THRESHOLDS.length - 1)];
  const next = LEVEL_THRESHOLDS[Math.min(lv + 1, LEVEL_THRESHOLDS.length - 1)] || cur + 1500;
  return { pct: Math.round(((pts - cur) / (next - cur)) * 100), next };
}

function rankLabel(level: number) {
  if (level >= 10) return { title: 'Grandmaster', icon: '👑' };
  if (level >= 7)  return { title: 'Elite',        icon: '💎' };
  if (level >= 5)  return { title: 'Veteran',      icon: '🏅' };
  if (level >= 3)  return { title: 'Challenger',   icon: '🛡️' };
  return               { title: 'Newcomer',     icon: '🌱' };
}

const TABS = ['Overview', 'Badges', 'Challenges'] as const;
type Tab = typeof TABS[number];

// ── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, iconBg, iconText }: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; iconBg: string; iconText: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-card border border-neutral-200 dark:border-gray-800 p-4 flex flex-col gap-2 shadow-sm"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconText}`} />
      </div>
      <p className="text-2xl font-black text-txt-headings dark:text-white leading-none">{value}</p>
      <p className="text-caption-semibold text-txt-disabled uppercase tracking-wide">{label}</p>
      {sub && <p className="text-micro text-txt-tertiary">{sub}</p>}
    </motion.div>
  );
}

function GoalBar({ label, value, max, colorClass }: { label: string; value: number; max: number; colorClass: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-caption text-txt-tertiary">
        <span className="font-medium text-txt-secondary">{label}</span>
        <span className="font-bold text-txt-primary dark:text-gray-300">{value}/{max}</span>
      </div>
      <div className="w-full h-2 bg-neutral-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${colorClass}`}
        />
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

function GamificationPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [challenges, setChallenges] = useState<WellnessChallenge[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [tab, setTab] = useState<Tab>('Overview');

  const post = useCallback(async (body: object) =>
    apiPost<{ success: boolean; user_stats?: UserStats | null; challenges?: WellnessChallenge[]; points_earned?: number; new_badges?: string[]; message?: string }>('/gamification', body)
  , []);

  const loadAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [statsRes, challRes] = await Promise.all([
      post({ action: 'get_user_stats', employee_id: user.id, company_id: user.company_id }),
      post({ action: 'get_available_challenges', employee_id: user.id, company_id: user.company_id }),
    ]);
    if (statsRes.success) setStats(statsRes.user_stats ?? null);
    if (challRes.success) setChallenges(challRes.challenges ?? []);
    setLoading(false);
  }, [user, post]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleCheckIn = async () => {
    if (!user || checkingIn) return;
    setCheckingIn(true);
    try {
      const res = await post({ action: 'check_in', employee_id: user.id, company_id: user.company_id });
      if (res.success) {
        setStats(res.user_stats ?? null);
        const pts = res.points_earned ?? 10;
        toast.success(res.new_badges?.length ? `+${pts} XP · ${res.new_badges.length} badge(s) unlocked!` : `+${pts} XP · Streak continuing!`);
      } else {
        toast.info(res.message ?? 'Already checked in today.');
      }
    } catch { toast.error('Check-in failed. Try again.'); }
    finally { setCheckingIn(false); }
  };

  const handleJoin = async (challengeId: string) => {
    if (!user) return;
    try {
      const res = await post({ action: 'join_challenge', employee_id: user.id, company_id: user.company_id, data: { challenge_id: challengeId } });
      if (res.success) { setJoinedIds(prev => new Set(prev).add(challengeId)); toast.success('Challenge joined!'); }
      else toast.error('Could not join challenge.');
    } catch { toast.error('Error joining challenge.'); }
  };

  if (loading) return <BrandLoader color="bg-brand-400" />;

  const s = stats;
  const level = s?.level ?? 1;
  const pts = s?.total_points ?? 0;
  const streak = s?.current_streak ?? 0;
  const badges = s?.badges ?? [];
  const rank = rankLabel(level);
  const { pct, next } = getLevelProgress(pts);
  const alreadyCheckedIn = s?.last_check_in
    ? (Date.now() - new Date(s.last_check_in).getTime()) < 24 * 60 * 60 * 1000
    : false;

  return (
    <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto space-y-5 font-sans">

      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-card-lg bg-gradient-to-br from-brand-500 via-brand-400 to-primary-500 p-6 text-white shadow-lg"
      >
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-card bg-white/20 backdrop-blur flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
              {rank.icon}
            </div>
            <div>
              <p className="text-white/70 text-micro font-semibold uppercase tracking-widest">Wellness Journey</p>
              <h1 className="text-h4 font-black leading-tight">{user?.first_name ?? 'Player'}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-caption-semibold bg-white/20 px-2.5 py-0.5 rounded-full">Level {level} · {rank.title}</span>
                <span className="text-caption text-white/70">{pts} XP total</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center bg-white/15 backdrop-blur rounded-card px-4 py-3 gap-0.5">
              <Flame className="h-5 w-5 text-orange-300" />
              <span className="text-h4 font-black">{streak}</span>
              <span className="text-micro text-white/70 font-semibold uppercase">Streak</span>
            </div>
            <div className="flex flex-col items-center bg-white/15 backdrop-blur rounded-card px-4 py-3 gap-0.5">
              <Award className="h-5 w-5 text-yellow-300" />
              <span className="text-h4 font-black">{badges.length}</span>
              <span className="text-micro text-white/70 font-semibold uppercase">Badges</span>
            </div>
          </div>
        </div>

        <div className="relative mt-5 space-y-1.5">
          <div className="flex justify-between text-caption text-white/70">
            <span>Level {level}</span>
            <span>{pct}% to Level {level + 1} · Next: {next} XP</span>
          </div>
          <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full bg-white/80"
            />
          </div>
        </div>
      </motion.div>

      {/* ── Check-in CTA ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={`rounded-card border p-4 flex items-center justify-between gap-4 ${
          alreadyCheckedIn
            ? 'bg-success-subtle border-success-default/30 dark:bg-green-900/15 dark:border-green-800'
            : 'bg-warning-subtle border-warning-default/30 dark:bg-amber-900/20 dark:border-amber-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            alreadyCheckedIn ? 'bg-success-default/20' : 'bg-warning-default/20'
          }`}>
            {alreadyCheckedIn
              ? <CheckCircle className="h-5 w-5 text-success-bold" />
              : <Gift className="h-5 w-5 text-warning-bold" />}
          </div>
          <div>
            <p className="text-s-semibold text-txt-headings dark:text-white">
              {alreadyCheckedIn ? 'Checked in today!' : 'Daily Check-In Available'}
            </p>
            <p className="text-caption text-txt-tertiary">
              {alreadyCheckedIn ? 'See you tomorrow for more XP.' : 'Claim your daily +10 XP & keep your streak alive.'}
            </p>
          </div>
        </div>
        {!alreadyCheckedIn && (
          <button
            onClick={handleCheckIn}
            disabled={checkingIn}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-warning-bold hover:bg-warning-default disabled:opacity-60 text-white text-s-semibold rounded-xl transition-colors"
          >
            {checkingIn ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
            {checkingIn ? 'Claiming…' : 'Claim XP'}
          </button>
        )}
      </motion.div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-gray-800 rounded-xl">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-s-semibold rounded-lg transition-all ${
              tab === t
                ? 'bg-white dark:bg-gray-900 text-txt-headings dark:text-white shadow-sm'
                : 'text-txt-tertiary hover:text-txt-secondary dark:hover:text-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Overview ── */}
        {tab === 'Overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={Flame}  label="Current Streak" value={streak}               sub={`Best: ${s?.longest_streak ?? 0}`} iconBg="bg-warning-subtle" iconText="text-warning-bold" />
              <StatCard icon={Star}   label="Total XP"        value={pts}                  sub={`Level ${level}`}                  iconBg="bg-brand-100"     iconText="text-brand-600" />
              <StatCard icon={Award}  label="Badges"          value={badges.length}        sub={`of ${ALL_BADGES.length}`}         iconBg="bg-primary-50"    iconText="text-primary-600" />
              <StatCard icon={Trophy} label="Challenges"      value={s?.challenges_completed ?? 0} sub="completed"                iconBg="bg-success-subtle" iconText="text-success-bold" />
            </div>

            {/* Recent Badges */}
            {badges.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-card-lg border border-neutral-200 dark:border-gray-800 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-s-semibold text-txt-headings dark:text-white flex items-center gap-2">
                    <Medal className="h-5 w-5 text-warning-bold" /> Recent Badges
                  </h3>
                  <button onClick={() => setTab('Badges')} className="text-caption text-brand-500 hover:text-brand-600 flex items-center gap-0.5 transition-colors">
                    All badges <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {badges.slice(0, 5).map(key => {
                    const meta = BADGE_META[key] ?? { label: key, emoji: '🏅', bg: 'bg-neutral-100', text: 'text-txt-secondary' };
                    return (
                      <span key={key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-caption-semibold ${meta.bg} ${meta.text}`}>
                        {meta.emoji} {meta.label}
                      </span>
                    );
                  })}
                  {badges.length > 5 && (
                    <span className="flex items-center px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-gray-800 text-caption-semibold text-txt-tertiary">
                      +{badges.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Goals */}
            <div className="bg-white dark:bg-gray-900 rounded-card-lg border border-neutral-200 dark:border-gray-800 p-5 space-y-4 shadow-sm">
              <h3 className="text-s-semibold text-txt-headings dark:text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-brand-500" /> Goals
              </h3>
              <GoalBar label="Weekly Streak Goal" value={streak} max={s?.weekly_goal ?? 5} colorClass="bg-gradient-to-r from-brand-400 to-brand-500" />
              <GoalBar label="Monthly Challenge Goal" value={s?.challenges_completed ?? 0} max={s?.monthly_goal ?? 20} colorClass="bg-gradient-to-r from-primary-400 to-primary-600" />
            </div>
          </motion.div>
        )}

        {/* ── Badges ── */}
        {tab === 'Badges' && (
          <motion.div key="badges" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="bg-white dark:bg-gray-900 rounded-card-lg border border-neutral-200 dark:border-gray-800 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-s-semibold text-txt-headings dark:text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-warning-bold" /> Badge Collection
              </h3>
              <span className="text-caption-semibold text-brand-600 bg-brand-100 px-2.5 py-1 rounded-full">
                {badges.length}/{ALL_BADGES.length} unlocked
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
              {ALL_BADGES.map(key => {
                const meta = BADGE_META[key];
                const unlocked = badges.includes(key);
                return (
                  <motion.div key={key} whileHover={{ scale: 1.08 }} className="flex flex-col items-center gap-1.5">
                    <div className={`w-12 h-12 rounded-card flex items-center justify-center text-2xl relative ${
                      unlocked ? `${meta.bg} shadow-sm` : 'bg-neutral-100 dark:bg-gray-800 opacity-40'
                    }`}>
                      {unlocked ? meta.emoji : <Lock className="h-5 w-5 text-txt-disabled" />}
                      {unlocked && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-success-default rounded-full border-2 border-white dark:border-gray-900" />
                      )}
                    </div>
                    <p className={`text-micro font-medium text-center leading-tight ${unlocked ? 'text-txt-secondary' : 'text-txt-disabled'}`}>
                      {meta.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>
            {badges.length === 0 && (
              <p className="text-center text-s-regular text-txt-tertiary py-6">No badges yet — check in daily to earn your first!</p>
            )}
          </motion.div>
        )}

        {/* ── Challenges ── */}
        {tab === 'Challenges' && (
          <motion.div key="challenges" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-3">
            {challenges.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-card-lg border border-neutral-200 dark:border-gray-800 p-10 flex flex-col items-center gap-3 shadow-sm">
                <Trophy className="h-10 w-10 text-neutral-300 dark:text-gray-600" />
                <p className="text-s-regular text-txt-tertiary">No active challenges right now.</p>
                <p className="text-caption text-txt-disabled">Your admin will post challenges here.</p>
              </div>
            ) : (
              challenges.map((c, i) => {
                const joined = joinedIds.has(c.id) || (c.participants?.includes(user?.id ?? '') ?? false);
                const diffStyle = c.difficulty === 'hard'
                  ? 'bg-error-subtle text-error-bold'
                  : c.difficulty === 'medium'
                  ? 'bg-warning-subtle text-warning-bold'
                  : 'bg-success-subtle text-success-bold';
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white dark:bg-gray-900 rounded-card-lg border border-neutral-200 dark:border-gray-800 p-5 flex flex-col gap-3 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm transition-all shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-s-semibold text-txt-headings dark:text-white leading-snug">{c.title}</h4>
                      {c.difficulty && (
                        <span className={`text-micro font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 ${diffStyle}`}>
                          {c.difficulty}
                        </span>
                      )}
                    </div>
                    {c.description && (
                      <p className="text-caption text-txt-tertiary leading-relaxed">{c.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-1">
                      <div className="flex items-center gap-3 text-caption text-txt-disabled">
                        {c.duration_days && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{c.duration_days}d</span>}
                        {c.points_reward && <span className="flex items-center gap-1 text-warning-bold font-semibold"><Star className="h-3.5 w-3.5" />+{c.points_reward} XP</span>}
                        {c.participants && <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{c.participants.length}</span>}
                      </div>
                      <button
                        onClick={() => !joined && handleJoin(c.id)}
                        className={`text-caption-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          joined
                            ? 'bg-success-subtle text-success-bold cursor-default'
                            : 'bg-brand-500 text-white hover:bg-brand-600'
                        }`}
                      >
                        {joined ? <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Joined</span> : 'Join'}
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default withAuth(GamificationPage, ['employee']);

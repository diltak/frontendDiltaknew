"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LandingNavbar from '@/components/landing/LandingNavbar';
import Footer from '@/components/Footer';
import { saathiFeatures } from '@/lib/landing/data';
import { getStepDelay } from '@/lib/landing/helpers';
import {
  Heart,
  MessageCircle,
  Users,
  Lightbulb,
  TrendingUp,
  HeartHandshake,
  Trophy,
  Mic,
  ChevronRight,
  CheckCircle,
  ArrowRight,
  Star,
  Sparkles,
  Shield,
  Clock,
  Zap,
} from 'lucide-react';

// ─── How Saathi Works steps ───────────────────────────────────────────────────

const howSaathiWorksSteps = [
  {
    id: 1,
    icon: Shield,
    title: 'Sign Up Anonymously',
    description:
      'Create your private wellness profile in under 2 minutes, no real name required.',
  },
  {
    id: 2,
    icon: MessageCircle,
    title: 'Daily AI Check-In',
    description:
      'Chat with Saathi every day. Share your mood, stress, and thoughts safely.',
  },
  {
    id: 3,
    icon: Lightbulb,
    title: 'Get Personalised Support',
    description:
      'Receive tailored coping strategies, resources, and guided exercises instantly.',
  },
  {
    id: 4,
    icon: TrendingUp,
    title: 'Track Your Growth',
    description:
      'Visualise your mood trends over time and celebrate wellness milestones.',
  },
];

// ─── Social Proof Testimonials ────────────────────────────────────────────────

const testimonials = [
  {
    id: 1,
    quote:
      'Saathi helped me manage work stress without anyone knowing. It felt like having a supportive friend 24/7.',
    name: 'Priya S.',
    role: 'Marketing Manager',
  },
  {
    id: 2,
    quote:
      'The daily check-ins changed my relationship with my mental health. I finally have tools that actually work.',
    name: 'Arjun K.',
    role: 'Software Engineer',
  },
  {
    id: 3,
    quote:
      'Anonymous and judgment-free. I was skeptical at first but Saathi genuinely understands emotional context.',
    name: 'Meera R.',
    role: 'HR Director',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SaathiPage() {
  const [activeMood, setActiveMood] = useState<number | null>(null);
  const moods = ['😔', '😐', '🙂', '😊', '😄'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-amber-50 dark:from-gray-950 dark:via-purple-950 dark:to-violet-950 text-gray-900 dark:text-gray-100 transition-colors duration-500 overflow-x-hidden">

      {/* ── Animated Background Blobs ─────────────────────────────────────── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-violet-400/20 dark:bg-violet-600/10 rounded-full blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-3xl"
          animate={{ x: [0, -80, 0], y: [0, 100, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-amber-300/20 dark:bg-amber-600/10 rounded-full blur-3xl"
          animate={{ x: [0, 60, 0], y: [0, -80, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Navbar */}
      <div className="relative z-50">
        <LandingNavbar />
      </div>

      <main className="relative z-10">

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 1 — HERO
            Task 12.1 | Requirements 17.1–17.6, 18.1–18.6
        ════════════════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 md:py-24 lg:py-32 xl:py-25">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

              {/* ── Left: Copy ── */}
              <div>
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="inline-flex items-center space-x-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full px-4 py-1.5 text-sm font-medium mb-6 shadow-sm"
                >
                  <Heart className="w-5 h-5" />
                  <span>AI Mental Wellness Companion</span>
                </motion.div>

                {/* h1 */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-none mb-2"
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-500">
                    Saathi
                  </span>
                  <br />
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
                    Your AI-Powered Mental
                  </span>
                  <br />
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
                    Wellness Companion
                  </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8 max-w-xl mt-6"
                >
                  Empathetic daily check-ins, anonymous peer support, and personalised coping strategies — always available whenever you need support.
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 mb-10"
                >
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 hover:from-violet-700 hover:via-purple-700 hover:to-violet-800 text-white px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                  >
                    <Link href="/contact">
                      Get Started
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-violet-400 text-violet-700 dark:text-violet-300 dark:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30 px-8 py-3 text-base font-semibold rounded-xl"
                  >
                    <a href="#saathi-how-it-works">
                      See How It Works
                    </a>
                  </Button>
                </motion.div>

                {/* Trust stat pills */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex flex-wrap gap-3"
                >
                  {[
                    { icon: Shield, label: '100% Anonymous', color: 'text-violet-500' },
                    { icon: Clock, label: 'Available 24/7', color: 'text-purple-500' },
                    { icon: Zap, label: 'AI-Powered', color: 'text-amber-500' },
                  ].map(({ icon: Icon, label, color }) => (
                    <div
                      key={label}
                      className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-violet-200 dark:border-violet-800 rounded-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm"
                    >
                      <Icon className={`w-5 h-5 ${color}`} />
                      <span>{label}</span>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* ── Right: Mood Check-In UI Mockup ── */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex justify-center lg:justify-end"
              >
                <div className="relative w-full max-w-sm">

                  {/* Floating Streak badge */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-5 -right-4 z-10 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-lg"
                  >
                    🔥 7-Day Streak
                  </motion.div>

                  {/* Floating mood badge */}
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute -bottom-4 -left-4 z-10 bg-white dark:bg-gray-800 border border-violet-200 dark:border-violet-700 text-gray-800 dark:text-gray-200 text-xs font-semibold px-4 py-2 rounded-2xl shadow-lg"
                  >
                    <span className="text-violet-600 dark:text-violet-400">✓</span> Mood tracked today
                  </motion.div>

                  {/* Card */}
                  <div className="rounded-3xl border border-violet-200 dark:border-violet-700 bg-white/95 dark:bg-gray-800/95 shadow-2xl p-7 backdrop-blur-sm">

                    {/* App header */}
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">Saathi</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Daily check-in</p>
                      </div>
                      <div className="ml-auto flex items-center space-x-1.5">
                        <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                        <span className="text-xs text-gray-400">Active</span>
                      </div>
                    </div>

                    {/* Chat bubbles */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex-shrink-0 flex items-center justify-center mt-0.5">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                        <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[210px] shadow-sm">
                          Hi! How are you feeling today? 😊
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[200px] shadow-sm">
                          A bit stressed about work...
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex-shrink-0 flex items-center justify-center mt-0.5">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                        <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[210px] shadow-sm">
                          I hear you. Let&apos;s try a coping strategy 💜
                        </div>
                      </div>
                    </div>

                    {/* Mood selector */}
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-semibold uppercase tracking-wider">How are you feeling?</p>
                      <div className="flex justify-between">
                        {moods.map((emoji, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveMood(i)}
                            className={`text-xl p-2 rounded-xl transition-all duration-200 ${
                              activeMood === i
                                ? 'bg-violet-100 dark:bg-violet-900/40 scale-125 shadow-sm ring-2 ring-violet-400'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110'
                            }`}
                            aria-label={`Mood ${i + 1}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 2 — KEY FEATURES GRID (7 cards)
            Task 12.2 | Requirements 19.1–19.6
        ════════════════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 md:py-24 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section header */}
            <div className="text-center mb-14">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center space-x-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full px-4 py-1.5 text-sm font-medium mb-5 shadow-sm"
              >
                <Sparkles className="w-5 h-5" />
                <span>Features</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4"
              >
                Everything You Need for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-500">
                  Personal Wellness
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
              >
                Seven powerful capabilities designed around your employees&apos; wellbeing — from daily AI conversations to on-demand therapist access.
              </motion.p>
            </div>

            {/* Feature cards — 4-col grid, last row auto-centred */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
              {saathiFeatures.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: getStepDelay(index, 0.1) }}
                  whileHover={{ y: -6 }}
                  className="w-full"
                >
                  <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-violet-100 dark:border-violet-900/50 shadow-sm hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                        <feature.icon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 text-base">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 2b — SCREENSHOT SHOWCASE
        ════════════════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 md:py-24 lg:py-28 bg-white/60 dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-semibold px-4 py-1.5 rounded-full border border-violet-200 dark:border-violet-700 mb-5">
                See It In Action
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
                Saathi at a{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500">
                  Glance
                </span>
              </h2>
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Real screens from the Saathi app — empathetic AI conversations, mood tracking, and personalised wellness insights all in one place.
              </p>
            </motion.div>

            {/* ── Row 1: large left screenshot + copy right ── */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              {/* Screenshot */}
              <div className="relative order-1">
                {/* Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-400/20 to-purple-500/20 rounded-3xl blur-3xl scale-110 pointer-events-none" />

                {/* Browser frame */}
                <div className="relative rounded-2xl overflow-hidden border border-violet-200/50 dark:border-violet-700/40 shadow-2xl shadow-violet-900/20 bg-gray-950">
                  {/* Chrome */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border-b border-gray-800">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-violet-500/80" />
                    </div>
                    <div className="flex-1 bg-gray-800 rounded px-3 py-0.5 text-[10px] text-gray-500 ml-2 truncate max-w-[180px]">
                      app.diltak.ai/saathi
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                      <span className="text-[10px] text-gray-500">Live</span>
                    </div>
                  </div>

                  {/* Screenshot image */}
                  <div className="relative w-full" style={{ aspectRatio: '16/10' }}>
                    <Image
                      src="/assets/screenShorts/sarthi/sarthi1.png"
                      alt="Saathi – daily AI check-in and mood tracking screen"
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 560px"
                      priority
                    />
                  </div>
                </div>

                {/* Floating stat */}
                <motion.div
                  className="absolute -top-3 -right-2 sm:-right-5 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-3 py-2 rounded-2xl shadow-lg border border-violet-200 dark:border-violet-700"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💬</span>
                    <div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">Daily check-ins</p>
                      <p className="text-sm font-bold text-violet-600 dark:text-violet-400 leading-tight">10K+ / day</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Copy */}
              <div className="order-2 space-y-5">
                <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-3 py-1.5 rounded-full text-sm font-semibold">
                  <Heart className="w-4 h-4" />
                  Daily Wellness Check-In
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  Start every day with a real conversation about how you feel
                </h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                  Saathi opens with a warm, empathetic AI check-in — not a cold form. It reads your mood, detects stress patterns, and responds with context-aware support so you never feel alone.
                </p>
                <ul className="space-y-2.5">
                  {[
                    'Natural language AI conversation — not multiple choice',
                    'Mood trend visualisation across weeks and months',
                    'Anonymous — your employer never sees individual data',
                  ].map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* ── Row 2: copy left + screenshot right ── */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              {/* Copy — shows first on mobile, second on desktop */}
              <div className="order-2 lg:order-1 space-y-5">
                <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-full text-sm font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  Wellness Insights & Progress
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  See your mental wellness journey unfold over time
                </h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                  Saathi tracks your emotional patterns and turns them into clear, actionable insights. Celebrate your streaks, spot early burnout signals, and see real progress week over week.
                </p>
                <ul className="space-y-2.5">
                  {[
                    'Visual mood charts and wellness score over time',
                    'Gamified streaks and milestone rewards to keep you consistent',
                    'Personalised coping strategies based on your patterns',
                  ].map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      {pt}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all duration-300 group"
                >
                  Get Started with Saathi
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Screenshot */}
              <div className="relative order-1 lg:order-2">
                {/* Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/15 to-purple-400/15 rounded-3xl blur-3xl scale-110 pointer-events-none" />

                {/* Browser frame */}
                <div className="relative rounded-2xl overflow-hidden border border-amber-200/50 dark:border-amber-700/40 shadow-2xl shadow-amber-900/15 bg-gray-950">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border-b border-gray-800">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-violet-500/80" />
                    </div>
                    <div className="flex-1 bg-gray-800 rounded px-3 py-0.5 text-[10px] text-gray-500 ml-2 truncate max-w-[200px]">
                      app.diltak.ai/saathi/insights
                    </div>
                  </div>

                  <div className="relative w-full" style={{ aspectRatio: '16/10' }}>
                    <Image
                      src="/assets/screenShorts/sarthi/sarthi2.png"
                      alt="Saathi – wellness insights, mood trends and streak tracking"
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 560px"
                    />
                  </div>
                </div>

                {/* Floating streak badge */}
                <motion.div
                  className="absolute -bottom-3 -left-2 sm:-left-5 z-10 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-3 py-2 rounded-2xl shadow-lg"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔥</span>
                    <div>
                      <p className="text-[10px] text-amber-100 leading-none">Current streak</p>
                      <p className="text-sm font-bold leading-tight">7 days</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 3 — HOW SAATHI WORKS (4 steps)
            Task 12.3 | Requirements 20.1–20.5
        ════════════════════════════════════════════════════════════════════ */}
        <section
          id="saathi-how-it-works"
          className="py-16 sm:py-20 md:py-24 lg:py-28 bg-white/50 dark:bg-gray-900/40 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section header */}
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full px-4 py-1.5 text-sm font-medium mb-5 shadow-sm"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Process</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100"
              >
                Your Wellness Journey in{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">
                  4 Simple Steps
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mt-4"
              >
                Getting started takes less than 2 minutes. Your data stays private, always.
              </motion.p>
            </div>

            {/* Steps */}
            <div className="relative">

              {/* Desktop connector line */}
              <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-violet-200 via-purple-300 to-violet-200 dark:from-violet-800 dark:via-purple-700 dark:to-violet-800" />

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-6">
                {howSaathiWorksSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: getStepDelay(index, 0.15) }}
                    className="relative flex flex-col items-center text-center"
                  >
                    {/* Step icon bubble */}
                    <div className="relative mb-6 z-10">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-xl shadow-violet-200 dark:shadow-violet-900/40">
                        <step.icon className="w-9 h-9 text-white" />
                      </div>
                      {/* Step number badge */}
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center text-white text-xs font-extrabold shadow-md">
                        {step.id}
                      </div>
                    </div>

                    {/* Mobile vertical connector */}
                    {index < howSaathiWorksSteps.length - 1 && (
                      <div className="lg:hidden w-0.5 h-8 bg-gradient-to-b from-violet-300 to-violet-100 dark:from-violet-700 dark:to-violet-900 mb-4" />
                    )}

                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-3">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-[220px] mx-auto">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 4 — SOCIAL PROOF
            Requirements 21.1
        ════════════════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 md:py-24 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section header */}
            <div className="text-center mb-14">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4"
              >
                Loved by{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">
                  Thousands
                </span>
              </motion.h2>

              {/* Impact stat pills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="flex flex-wrap justify-center gap-3 mt-6"
              >
                {[
                  { label: '10K+ Check-ins Daily', icon: MessageCircle },
                  { label: '95% Satisfaction Rate', icon: Star },
                  { label: '100% Anonymous', icon: Shield },
                ].map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className="inline-flex items-center space-x-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full px-5 py-2 text-sm font-semibold shadow-sm"
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Testimonial cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-l-4 border-l-violet-500 border border-violet-100 dark:border-violet-900/50 shadow-sm hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Stars */}
                      <div className="flex space-x-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 text-amber-400 fill-amber-400"
                          />
                        ))}
                      </div>

                      {/* Quote */}
                      <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed flex-1 mb-6 text-base">
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>

                      {/* Author */}
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {testimonial.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            {testimonial.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 5 — CTA BANNER
            Requirements 21.2–21.5
        ════════════════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 md:py-24 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 p-10 sm:p-14 lg:p-16 text-center shadow-2xl"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5">
                Start Your Wellness Journey Today
              </h2>
              <p className="text-white/90 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                Join thousands of employees who use Saathi for daily mental wellness support.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-violet-700 hover:bg-gray-50 font-semibold px-8 py-3 text-base shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                >
                  <Link href="/contact">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/60 bg-violet-700 text-white hover:bg-white/10 font-semibold px-8 py-3 text-base rounded-xl"
                >
                  <Link href="/products/umang">
                    Learn About Umang
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>

              {/* Trust micro-copy */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-white/80 text-sm font-medium">
                {['100% Anonymous', 'No Credit Card Required', 'Available 24/7'].map((item) => (
                  <span key={item} className="flex items-center space-x-1.5">
                    <CheckCircle className="w-5 h-5 text-white/90" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

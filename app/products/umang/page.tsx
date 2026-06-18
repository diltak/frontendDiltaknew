"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LandingNavbar from '@/components/landing/LandingNavbar';
import Footer from '@/components/Footer';
import { umangFeatures } from '@/lib/landing/data';
import { getStepDelay } from '@/lib/landing/helpers';
import {
  BarChart3, Activity, AlertTriangle, TrendingUp, Bell, ClipboardList, Plug, Layers,
  ChevronRight, CheckCircle, ArrowRight, Shield, Building2, Users,
  Brain, TrendingDown, Star, Sparkles, Zap,
} from 'lucide-react';

// ─── How Umang Works steps ────────────────────────────────────────────────────

const howUmangWorksSteps = [
  {
    id: 1,
    icon: Plug,
    title: 'Connect Your Systems',
    description:
      'Integrate Umang with your HRIS, Slack, or Teams in under 48 hours.',
  },
  {
    id: 2,
    icon: Shield,
    title: 'Data Flows Anonymously',
    description:
      'Employee wellness data is collected anonymously, ensuring complete psychological safety.',
  },
  {
    id: 3,
    icon: Brain,
    title: 'AI Analyses Patterns',
    description:
      'Machine learning surfaces burnout risk, engagement trends, and early warning signals.',
  },
  {
    id: 4,
    icon: BarChart3,
    title: 'HR Receives Insights',
    description:
      'Your team gets prioritised alerts, dashboards, and intervention templates instantly.',
  },
];

// ─── ROI metrics ──────────────────────────────────────────────────────────────

const roiMetrics = [
  {
    id: 'absence',
    value: '40%',
    label: 'Reduction in Employee Absences',
    icon: TrendingDown,
    colorClass: 'text-amber-500',
    bgClass: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
    iconBgClass: 'bg-amber-100 dark:bg-amber-900/30',
  },
  {
    id: 'productivity',
    value: '2.3×',
    label: 'Productivity Uplift',
    icon: TrendingUp,
    colorClass: 'text-violet-600',
    bgClass: 'from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20',
    iconBgClass: 'bg-violet-100 dark:bg-violet-900/30',
  },
  {
    id: 'satisfaction',
    value: '95%',
    label: 'Employee Satisfaction Rate',
    icon: Star,
    colorClass: 'text-purple-600',
    bgClass: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
    iconBgClass: 'bg-purple-100 dark:bg-purple-900/30',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UmangPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-amber-50 dark:from-gray-950 dark:via-purple-950 dark:to-violet-950 text-gray-900 dark:text-gray-100 transition-colors duration-500 overflow-x-hidden">

      {/* Animated Background blobs */}
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

        {/* ── Section 1: Hero ───────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 md:py-24 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Left: copy */}
              <div>
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full px-4 py-1.5 text-sm font-medium mb-6"
                >
                  <Building2 className="w-5 h-5" />
                  <span>Enterprise Analytics</span>
                </motion.div>

                {/* h1 */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4"
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                    Umang
                  </span>
                  <br />
                  <span className="text-gray-900 dark:text-gray-100 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                    Enterprise Mental Health
                    <br />
                    Intelligence
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6 max-w-xl"
                >
                  Real-time burnout detection, predictive analytics, and actionable HR insights — protect your workforce&apos;s mental health before problems escalate.
                </motion.p>

                {/* Enterprise metric callout */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="inline-flex items-center space-x-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-full px-5 py-2.5 text-sm font-semibold text-amber-800 dark:text-amber-300 shadow-sm mb-8"
                >
                  <TrendingDown className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span>40% average reduction in employee absences</span>
                </motion.div>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                  >
                    <Link href="/contact">
                      Request a Demo
                      <ChevronRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-amber-400 text-amber-700 dark:text-amber-300 dark:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 px-8 py-3 text-base font-semibold rounded-xl"
                  >
                    <a href="#umang-features">
                      See Key Features
                    </a>
                  </Button>
                </motion.div>
              </div>

              {/* Right: Dashboard Preview mockup */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex justify-center lg:justify-end"
              >
                <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 dark:bg-gray-950 shadow-2xl overflow-hidden">
                  {/* Dashboard title bar */}
                  <div className="bg-gray-800 dark:bg-gray-900 border-b border-gray-700 px-5 py-3 flex items-center space-x-2">
                    <div className="flex space-x-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-violet-500" />
                    </div>
                    <span className="ml-3 text-gray-400 text-xs font-medium">Umang Analytics Dashboard</span>
                    <div className="ml-auto flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                      <span className="text-xs text-gray-500">Live</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Wellness Index */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Wellness Index</span>
                      <span className="text-amber-400 text-sm font-bold">78 / 100</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-700 rounded-full overflow-hidden mb-4">
                      <div className="h-full w-[78%] bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
                    </div>

                    {/* Metric cards */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-800 dark:bg-gray-900 rounded-xl p-3 border border-gray-700">
                        <div className="text-xs text-gray-400 mb-1">Burnout Risk</div>
                        <div className="text-sm font-bold text-violet-400">Low</div>
                      </div>
                      <div className="bg-gray-800 dark:bg-gray-900 rounded-xl p-3 border border-gray-700">
                        <div className="text-xs text-gray-400 mb-1">Engagement</div>
                        <div className="text-sm font-bold text-amber-400">High</div>
                      </div>
                      <div className="bg-gray-800 dark:bg-gray-900 rounded-xl p-3 border border-gray-700">
                        <div className="text-xs text-gray-400 mb-1">Absence Rate</div>
                        <div className="text-sm font-bold text-purple-400">↓ 38%</div>
                      </div>
                    </div>

                    {/* Bar chart visualization */}
                    <div className="bg-gray-800 dark:bg-gray-900 rounded-xl p-4 border border-gray-700">
                      <div className="text-xs text-gray-400 mb-3 font-semibold">Dept. Wellness Trends</div>
                      <div className="flex items-end space-x-2 h-16">
                        {[65, 82, 74, 90, 58, 78, 85].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center space-y-1">
                            <div
                              className="w-full rounded-t"
                              style={{
                                height: `${h * 0.58}px`,
                                background: i % 2 === 0
                                  ? 'linear-gradient(to top, #f59e0b, #d97706)'
                                  : 'linear-gradient(to top, #7c3aed, #6d28d9)',
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Department rows */}
                    <div className="space-y-2">
                      {[
                        { dept: 'Engineering', status: 'Healthy', color: 'text-violet-400', dot: 'bg-violet-500' },
                        { dept: 'Marketing', status: 'Moderate', color: 'text-amber-400', dot: 'bg-amber-500' },
                        { dept: 'Operations', status: 'Healthy', color: 'text-purple-400', dot: 'bg-purple-500' },
                      ].map((row) => (
                        <div key={row.dept} className="flex items-center justify-between bg-gray-800 dark:bg-gray-900 rounded-lg px-3 py-2 border border-gray-700">
                          <span className="text-xs text-gray-300">{row.dept}</span>
                          <div className="flex items-center space-x-1.5">
                            <div className={`w-2 h-2 rounded-full ${row.dot}`} />
                            <span className={`text-xs font-semibold ${row.color}`}>{row.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── Section 2: Key Features Grid ─────────────────────────────────── */}
        <section id="umang-features" className="py-16 sm:py-20 md:py-24 lg:py-28 bg-white/50 dark:bg-gray-900/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section header */}
            <div className="text-center mb-14">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full px-4 py-1.5 text-sm font-medium mb-5"
              >
                <Zap className="w-5 h-5" />
                <span>Features</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4"
              >
                Enterprise-Grade{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                  Mental Health Analytics
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
              >
                8 powerful capabilities built for HR leaders and people-first organisations
              </motion.p>
            </div>

            {/* Feature cards grid — 4 cols on large screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {umangFeatures.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: getStepDelay(index, 0.1) }}
                  whileHover={{ y: -6 }}
                >
                  <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-amber-100 dark:border-amber-900/50 shadow-sm hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                        <feature.icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
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

        {/* ── Section 3: Dashboard Preview Section ─────────────────────────── */}
        <section className="py-16 sm:py-20 md:py-24 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center space-x-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full px-4 py-1.5 text-sm font-medium mb-5"
              >
                <Activity className="w-5 h-5" />
                <span>See It In Action</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4"
              >
                See{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                  Umang
                </span>{' '}
                in Action
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
              >
                A live look at the intelligence HR leaders rely on every day
              </motion.p>
            </div>

            {/* Large dashboard mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-2xl bg-gray-950 border border-gray-700 shadow-2xl overflow-hidden mb-10"
            >
              {/* Browser chrome */}
              <div className="bg-gray-800 border-b border-gray-700 px-5 py-3 flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-violet-500/80" />
                </div>
                <div className="ml-3 flex-1 bg-gray-700 rounded-md px-4 py-1 text-xs text-gray-400 max-w-xs">
                  app.diltak.ai/umang/dashboard
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Top KPI row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Wellness Score', value: '82', icon: Activity, color: 'text-violet-400', iconBg: 'bg-violet-900/40' },
                    { label: 'At-Risk Employees', value: '3', icon: AlertTriangle, color: 'text-amber-400', iconBg: 'bg-amber-900/40' },
                    { label: 'Avg Engagement', value: '87%', icon: TrendingUp, color: 'text-purple-400', iconBg: 'bg-purple-900/40' },
                    { label: 'Absence Rate', value: '4.2%', icon: TrendingDown, color: 'text-orange-400', iconBg: 'bg-orange-900/40' },
                  ].map((kpi) => (
                    <div key={kpi.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400 font-medium">{kpi.label}</span>
                        <div className={`${kpi.iconBg} rounded-lg p-1.5`}>
                          <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                        </div>
                      </div>
                      <div className={`text-2xl font-extrabold ${kpi.color}`}>{kpi.value}</div>
                    </div>
                  ))}
                </div>

                {/* Charts section + AI Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Bar chart area */}
                  <div className="lg:col-span-2 bg-gray-800 rounded-xl p-5 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-200 font-semibold">Department Wellness Trends</span>
                      <span className="text-xs text-gray-500 bg-gray-700 rounded-full px-3 py-1">Last 30 days</span>
                    </div>
                    {/* Labelled bar chart */}
                    <div className="space-y-3">
                      {[
                        { name: 'Engineering', score: 88, color: 'from-violet-500 to-violet-400' },
                        { name: 'Marketing', score: 72, color: 'from-amber-500 to-amber-400' },
                        { name: 'Operations', score: 81, color: 'from-purple-500 to-purple-400' },
                        { name: 'Sales', score: 65, color: 'from-orange-500 to-orange-400' },
                        { name: 'HR', score: 90, color: 'from-violet-600 to-indigo-500' },
                      ].map((dept) => (
                        <div key={dept.name} className="flex items-center space-x-3">
                          <span className="text-xs text-gray-400 w-20 flex-shrink-0">{dept.name}</span>
                          <div className="flex-1 h-2.5 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${dept.color}`}
                              style={{ width: `${dept.score}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-300 w-8 text-right">{dept.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Recommendations panel */}
                  <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <Brain className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm text-gray-200 font-semibold">AI Recommendations</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        'Sales team shows rising stress signals — consider flexible deadlines this week.',
                        'Marketing engagement dropped 12% — schedule a 1:1 check-in with team leads.',
                        'Engineering wellness at 88% — reinforce current practices as a model.',
                      ].map((rec, i) => (
                        <div key={i} className="flex items-start space-x-2">
                          <div className="w-5 h-5 rounded-full bg-amber-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-amber-400 text-xs font-bold">{i + 1}</span>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature callouts below mockup */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: Activity,
                  title: 'Real-time metrics updated every 24 hours',
                  iconBg: 'bg-amber-100 dark:bg-amber-900/30',
                  iconColor: 'text-amber-600 dark:text-amber-400',
                },
                {
                  icon: Brain,
                  title: 'AI-powered anomaly detection',
                  iconBg: 'bg-violet-100 dark:bg-violet-900/30',
                  iconColor: 'text-violet-600 dark:text-violet-400',
                },
                {
                  icon: Layers,
                  title: 'Export as branded PDF reports',
                  iconBg: 'bg-purple-100 dark:bg-purple-900/30',
                  iconColor: 'text-purple-600 dark:text-purple-400',
                },
              ].map((callout, index) => (
                <motion.div
                  key={callout.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: getStepDelay(index, 0.1) }}
                  className="flex items-center space-x-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <div className={`w-10 h-10 ${callout.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <callout.icon className={`w-5 h-5 ${callout.iconColor}`} />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{callout.title}</p>
                </motion.div>
              ))}
            </div>

          </div>
        </section>

        {/* ── Section 4: How Umang Works ────────────────────────────────────── */}
        <section className="py-16 sm:py-20 md:py-24 lg:py-28 bg-white/50 dark:bg-gray-900/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section header */}
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full px-4 py-1.5 text-sm font-medium mb-5"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Implementation</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100"
              >
                From Integration to Insights{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                  in 4 Steps
                </span>
              </motion.h2>
            </div>

            {/* Steps — desktop: horizontal, mobile: vertical */}
            <div className="relative">

              {/* Connector line (desktop only) */}
              <div className="hidden lg:block absolute top-10 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-200 via-orange-300 to-amber-200 dark:from-amber-800 dark:via-orange-700 dark:to-amber-800 mx-24" />

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-6">
                {howUmangWorksSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: getStepDelay(index, 0.15) }}
                    className="relative flex flex-col items-center text-center"
                  >
                    {/* Step number bubble */}
                    <div className="relative mb-5">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-200 dark:shadow-amber-900/40 z-10 relative">
                        <step.icon className="w-9 h-9 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                        {step.id}
                      </div>
                    </div>

                    {/* Vertical connector (mobile only) */}
                    {index < howUmangWorksSteps.length - 1 && (
                      <div className="lg:hidden w-0.5 h-8 bg-gradient-to-b from-amber-300 to-amber-100 dark:from-amber-700 dark:to-amber-900 mb-0 -mt-1" />
                    )}

                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ── Section 5: ROI Section ────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 md:py-24 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full px-4 py-1.5 text-sm font-medium mb-5"
              >
                <TrendingUp className="w-5 h-5" />
                <span>Return on Investment</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4"
              >
                Measurable ROI for Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                  Organisation
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
              >
                Proven results across enterprises, healthcare providers, and educational institutions.
              </motion.p>
            </div>

            {/* ROI metric cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {roiMetrics.map((metric, index) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: getStepDelay(index, 0.15) }}
                  whileHover={{ y: -6 }}
                  className={`rounded-2xl bg-gradient-to-br ${metric.bgClass} border border-gray-200 dark:border-gray-700 p-8 text-center shadow-sm hover:shadow-lg transition-shadow duration-300`}
                >
                  <div className={`w-14 h-14 ${metric.iconBgClass} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm`}>
                    <metric.icon className={`w-7 h-7 ${metric.colorClass}`} />
                  </div>
                  <div className={`text-5xl sm:text-6xl font-extrabold ${metric.colorClass} mb-3`}>
                    {metric.value}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold text-base">
                    {metric.label}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Disclaimer */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center text-xs text-gray-400 dark:text-gray-500 mb-10"
            >
              Based on aggregated customer data
            </motion.p>

            {/* Trusted by badge row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="inline-flex items-center space-x-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl px-8 py-4 shadow-sm">
                <Users className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Trusted by leading organisations across 10+ countries</span>
                <div className="flex space-x-2 ml-2">
                  {['A', 'B', 'C', 'D'].map((letter) => (
                    <div key={letter} className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-700 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-400">
                      {letter}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* ── Section 6: CTA Banner ─────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 md:py-24 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-violet-600 p-10 sm:p-14 lg:p-16 text-center shadow-2xl"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5">
                Start Driving Measurable Wellness ROI
              </h2>
              <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                Join enterprises that trust Umang to protect workforce mental health and boost productivity.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-amber-700 hover:bg-gray-50 font-semibold px-8 py-3 text-base shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                >
                  <Link href="/contact">
                    Request a Demo
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10 font-semibold px-8 py-3 text-base rounded-xl"
                >
                  <Link href="/products/saathi">
                    Explore Saathi
                  </Link>
                </Button>
              </div>

              {/* Trust pills */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-white/80 text-sm font-medium">
                <span className="flex items-center space-x-1.5">
                  <Shield className="w-5 h-5 text-white/90" />
                  <span>Enterprise-Grade Security</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle className="w-5 h-5 text-white/90" />
                  <span>HIPAA Compliant</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <Sparkles className="w-5 h-5 text-white/90" />
                  <span>Dedicated Onboarding Support</span>
                </span>
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Brain, Heart, TrendingUp, Headphones, Zap, Play, Shield, Users, Target, Clock, ArrowRight, Star } from 'lucide-react';

const categories = [
  {
    label: 'Mindfulness & Meditation',
    icon: Brain,
    accent: 'violet',
    items: [
      { icon: Headphones, title: 'Guided Meditation Sessions', desc: 'Expert-led meditations for stress relief and mindfulness', duration: '10–30 min', type: 'Audio', rating: 4.9 },
      { icon: Zap, title: 'Breathing Exercises', desc: 'Simple techniques to calm your mind and reduce anxiety', duration: '5–15 min', type: 'Interactive', rating: 4.8 },
      { icon: Play, title: 'Sleep Stories', desc: 'Soothing narratives to help you fall asleep peacefully', duration: '20–45 min', type: 'Audio', rating: 4.9 },
    ],
  },
  // {
  //   label: 'Therapy & Counseling',
  //   icon: Heart,
  //   accent: 'purple',
  //   items: [
  //     { icon: Target, title: 'CBT Techniques', desc: 'Cognitive Behavioral Therapy tools for lasting positive change', duration: '15–30 min', type: 'Interactive', rating: 4.9 },
  //     { icon: Shield, title: 'Crisis Support', desc: '24/7 immediate help for mental health emergencies', duration: 'Always on', type: 'Live Chat', rating: 5.0 },
  //     { icon: Users, title: 'Group Therapy', desc: 'Connect with others on similar mental health journeys', duration: '60 min', type: 'Video Call', rating: 4.8 },
  //   ],
  // },
  {
    label: 'Wellness & Lifestyle',
    icon: TrendingUp,
    accent: 'amber',
    items: [
      { icon: Brain, title: 'Mood Tracking', desc: 'Monitor your emotional patterns and identify triggers', duration: '2–5 min', type: 'Daily Check-in', rating: 4.7 },
      { icon: Target, title: 'Wellness Challenges', desc: '30-day programs for building healthy, lasting habits', duration: '30 days', type: 'Program', rating: 4.8 },
      { icon: Zap, title: 'Stress Management', desc: 'Comprehensive tools for managing daily stress effectively', duration: '10–20 min', type: 'Interactive', rating: 4.9 },
    ],
  },
];

const accentMap: Record<string, { badge: string; iconBg: string; iconText: string; border: string; typePill: string }> = {
  violet: {
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-700',
    iconBg: 'bg-gradient-to-br from-violet-600 to-purple-700',
    iconText: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-800',
    typePill: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  },
  purple: {
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-700',
    iconBg: 'bg-gradient-to-br from-purple-600 to-indigo-700',
    iconText: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    typePill: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  },
  amber: {
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-700',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    iconText: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    typePill: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
};

const featuredPrograms = [
  { title: '30-Day Mindfulness Challenge', desc: 'Build a daily meditation practice with guided support', duration: '30 days' },
  { title: 'Stress Management Masterclass', desc: 'Proven techniques to manage and reduce workplace stress', duration: '2 weeks' },
  { title: 'Sleep Better Program', desc: 'Improve your sleep quality with evidence-based methods', duration: '21 days' },
];

const WellnessResources = () => {
  return (
    <section className="py-20 sm:py-24 lg:py-28 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold px-4 py-1.5 rounded-full border border-purple-200 dark:border-purple-700 mb-5">
            Resource Library
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-5 leading-tight">
            Comprehensive Wellness Resources
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Access a curated library of mental health tools, guided sessions, and expert resources designed for your wellness journey.
          </p>
        </motion.div>

        {/* Resource categories */}
        <div className="space-y-14">
          {categories.map((cat, catIdx) => {
            const cls = accentMap[cat.accent];
            return (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: catIdx * 0.1 }}
              >
                {/* Category label */}
                <div className="flex items-center space-x-3 mb-7">
                  <div className={`w-10 h-10 ${cls.iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
                    <cat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${cls.badge}`}>
                      {cat.label}
                    </span>
                  </div>
                </div>

                {/* Resource cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {cat.items.map((item, itemIdx) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: catIdx * 0.1 + itemIdx * 0.08 }}
                      whileHover={{ y: -5 }}
                      className="group"
                    >
                      <div className={`h-full bg-white dark:bg-gray-800/80 border ${cls.border} rounded-2xl p-6 hover:shadow-lg transition-all duration-300`}>
                        {/* Top row */}
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-11 h-11 ${cls.iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
                            <item.icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < Math.floor(item.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                            ))}
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{item.rating}</span>
                          </div>
                        </div>

                        <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2 text-sm">{item.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{item.desc}</p>

                        {/* Meta row */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-1.5 text-gray-500 dark:text-gray-400">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="text-xs">{item.duration}</span>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cls.typePill}`}>{item.type}</span>
                        </div>

                        <Link
                          href="/auth/login"
                          className="flex items-center justify-center space-x-1.5 w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-purple-700 group-hover:text-white group-hover:border-transparent transition-all duration-300"
                        >
                          <span>Start Now</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Featured Programs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16"
        >
          <div className="relative rounded-3xl bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 p-10 sm:p-12 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative">
              <div className="text-center mb-10">
                <h3 className="text-2xl sm:text-3xl font-bold mb-3">Featured Wellness Programs</h3>
                <p className="text-violet-200 max-w-xl mx-auto text-base">
                  Structured programs designed by mental health experts — start anytime.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
                {featuredPrograms.map((prog, idx) => (
                  <motion.div
                    key={prog.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
                  >
                    <h4 className="text-lg font-bold mb-2">{prog.title}</h4>
                    <p className="text-violet-200 text-sm mb-4 leading-relaxed">{prog.desc}</p>
                    <span className="inline-block text-xs bg-white/20 px-3 py-1 rounded-full font-medium">{prog.duration}</span>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center space-x-2 bg-white text-violet-700 hover:bg-violet-50 px-8 py-3.5 rounded-xl font-bold shadow-lg transition-all duration-300 text-sm group"
                >
                  <span>Explore All Programs</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default WellnessResources;

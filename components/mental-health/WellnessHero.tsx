'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, Brain, Shield, Sparkles, Users, CheckCircle, ArrowRight, Star } from 'lucide-react';

const WellnessHero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-amber-50 dark:from-gray-950 dark:via-purple-950 dark:to-violet-950 py-20 sm:py-24 lg:py-28 transition-colors duration-300">

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 -right-32 w-80 h-80 bg-violet-400/15 dark:bg-violet-600/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-300/15 dark:bg-amber-600/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-7 order-2 lg:order-1"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center space-x-2 bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 px-4 py-2 rounded-full"
            >
              <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">Wellness Hub — Powered by Diltak.ai</span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-gray-900 dark:text-white"
            >
              Complete Mind-Body
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 mt-1">
                Wellness Platform
              </span>
            </motion.h2>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg"
            >
              Consult top psychologists, therapists, and wellness experts. Get personalised AI-guided care with 100% anonymous, secure consultations.
            </motion.p>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {[
                { icon: Shield, title: 'Secure & Private', sub: 'End-to-end encryption' },
                { icon: Users, title: 'Expert Panel', sub: 'MBBS, MD, PhD Certified' },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex items-center space-x-3 bg-white/70 dark:bg-gray-800/60 backdrop-blur-sm border border-violet-100 dark:border-violet-900/40 p-4 rounded-2xl shadow-sm">
                  <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{sub}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-violet-500/30 transition-all duration-300 group text-base"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center border-2 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 text-base"
              >
                Book a Consultation
              </Link>
            </motion.div>
          </motion.div>

          {/* Right — Illustrative cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-4 order-1 lg:order-2"
          >
            {/* Main card */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-violet-100 dark:border-violet-900/50 shadow-xl rounded-3xl p-7">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-md shadow-violet-200 dark:shadow-violet-900/40">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">AI-Powered Support</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">24/7 Mental Health Assistant</p>
                </div>
              </div>
              <div className="space-y-3">
                {['Instant emotional support', 'Personalised therapy sessions', 'Mood tracking & insights'].map((item) => (
                  <div key={item} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-violet-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Two smaller cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Heart, label: 'Wellness', sub: 'Holistic care approach', color: 'from-violet-500 to-purple-600' },
                { icon: Star, label: 'Expert Care', sub: 'Certified professionals', color: 'from-amber-500 to-orange-500' },
              ].map(({ icon: Icon, label, sub, color }) => (
                <div key={label} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-violet-100 dark:border-violet-900/50 shadow-lg rounded-2xl p-5">
                  <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">{label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{sub}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default WellnessHero;

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Brain, Heart, Shield, Users, MessageSquare, Activity, Target, ArrowRight, CheckCircle } from 'lucide-react';

const mainFeatures = [
  {
    icon: Brain,
    title: 'AI Mental Health Assistant',
    description: '24/7 emotional support with advanced AI that understands your needs and adapts over time.',
    chips: ['Instant Support', 'Mood Analysis', 'Personalised Insights'],
    accent: 'violet',
  },
  {
    icon: Users,
    title: 'Expert Professionals',
    description: 'Connect with certified psychologists, psychiatrists, and wellness experts via video.',
    chips: ['Licensed Therapists', 'Video Consultations', 'Follow-up Care'],
    accent: 'purple',
  },
  {
    icon: Shield,
    title: 'Privacy & Security',
    description: 'End-to-end encrypted platform with full anonymity — your data is never shared.',
    chips: ['Secure Storage', 'Anonymous Access', 'HIPAA Compliant'],
    accent: 'amber',
  },
];

const secondaryFeatures = [
  {
    icon: Activity,
    title: 'Wellness Tracking',
    description: 'Monitor your mental health with comprehensive analytics and progress dashboards.',
  },
  {
    icon: MessageSquare,
    title: 'Therapeutic Conversations',
    description: 'Engage in structured conversations using evidence-based CBT techniques.',
  },
  {
    icon: Target,
    title: 'Personalised Care Plans',
    description: 'Custom treatment plans built around your unique needs, goals, and pace.',
  },
];

const accentClasses: Record<string, { icon: string; chip: string; border: string; bg: string }> = {
  violet: {
    icon: 'bg-gradient-to-br from-violet-600 to-purple-700',
    chip: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    border: 'border-violet-200 dark:border-violet-800',
    bg: 'from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40',
  },
  purple: {
    icon: 'bg-gradient-to-br from-purple-600 to-indigo-700',
    chip: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    bg: 'from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40',
  },
  amber: {
    icon: 'bg-gradient-to-br from-amber-500 to-orange-600',
    chip: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    bg: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
  },
};

const WellnessFeatures = () => {
  return (
    <section className="py-20 sm:py-24 lg:py-28 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-semibold px-4 py-1.5 rounded-full border border-violet-200 dark:border-violet-700 mb-5">
            Core Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-5 leading-tight">
            Comprehensive Mental Health
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 mt-1">
              & Wellness Solutions
            </span>
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            From AI-powered support to expert consultations — everything you need for a healthier, more resilient workforce.
          </p>
        </motion.div>

        {/* Main 3 feature cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {mainFeatures.map((feature, index) => {
            const cls = accentClasses[feature.accent];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                whileHover={{ y: -6 }}
                className="group"
              >
                <div className={`h-full p-7 rounded-3xl bg-gradient-to-br ${cls.bg} border ${cls.border} hover:shadow-xl transition-all duration-300`}>
                  <div className={`w-12 h-12 ${cls.icon} rounded-xl flex items-center justify-center mb-5 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-5">{feature.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {feature.chips.map((chip) => (
                      <span key={chip} className={`text-xs px-3 py-1 rounded-full font-medium ${cls.chip}`}>
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Secondary 3 horizontal cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {secondaryFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -4 }}
              className="flex items-start space-x-4 bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700 p-5 rounded-2xl hover:shadow-md transition-all duration-300"
            >
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <feature.icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1.5 text-sm">{feature.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 p-10 sm:p-12 text-white overflow-hidden"
        >
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-amber-300/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Heart className="w-5 h-5" />
                <span className="text-sm font-semibold">3,000+ Lives Transformed</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">Your wellness journey starts here</h3>
              <p className="text-white/85 text-base leading-relaxed">
                Join a community that prioritises mental health. Experience AI-powered support combined with human expertise.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center space-x-2 bg-white text-violet-700 hover:bg-violet-50 px-7 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 text-sm group"
              >
                <span>Try It Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center border-2 border-white/60 text-white hover:bg-white/10 px-7 py-3 rounded-xl font-bold transition-all duration-300 text-sm"
              >
                Talk to an Expert
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default WellnessFeatures;

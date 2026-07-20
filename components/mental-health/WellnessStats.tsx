'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, Heart, Brain, TrendingUp, Target, Shield, CheckCircle, ArrowRight } from 'lucide-react';

const stats = [
  { icon: Users, value: '3K+', label: 'Lives Impacted', desc: 'Employees and individuals supported globally', color: 'text-violet-400', iconBg: 'bg-violet-500/20' },
  { icon: Heart, value: '98%', label: 'Satisfaction Rate', desc: 'Users report positive mental health outcomes', color: 'text-amber-400', iconBg: 'bg-amber-500/20' },
  { icon: Brain, value: '24/7', label: 'AI Support', desc: 'Always available mental health assistance', color: 'text-purple-400', iconBg: 'bg-purple-500/20' },
  { icon: TrendingUp, value: '85%', label: 'Improvement Rate', desc: 'Users show measurable mental wellness progress', color: 'text-indigo-400', iconBg: 'bg-indigo-500/20' },
  { icon: Target, value: '10+', label: 'Countries', desc: 'Global reach across enterprises and institutions', color: 'text-orange-400', iconBg: 'bg-orange-500/20' },
];

const certifications = [
  { icon: Shield, title: 'ISO 27001 Certified', desc: 'Information security management' },
  { icon: CheckCircle, title: 'GDPR Compliant', desc: 'EU data protection standards' },
  { icon: Shield, title: 'DPDP Act Certified', desc: 'India data protection compliance' },
  { icon: CheckCircle, title: 'SOC 2 Type II', desc: 'Security & availability controls' },
];

const WellnessStats = () => {
  return (
    <section className="relative py-20 sm:py-24 lg:py-28 bg-gray-950 text-white overflow-hidden">

      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-violet-500/15 border border-violet-500/30 text-violet-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
            Proven Impact
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
            Trusted by Thousands
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-amber-400 mt-1">
              Worldwide
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Real outcomes across enterprises, healthcare providers, and educational institutions worldwide.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-white/5 border border-white/10 hover:border-white/20 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/8 transition-all duration-300">
                <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className={`text-3xl sm:text-4xl font-extrabold ${stat.color} mb-1.5`}>{stat.value}</div>
                <p className="text-white font-semibold text-sm mb-1">{stat.label}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{stat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Certifications strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <p className="text-center text-xs text-gray-500 uppercase tracking-widest font-semibold mb-6">Compliance & Certifications</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.08 }}
                className="flex items-center space-x-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
              >
                <cert.icon className="h-5 w-5 text-violet-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white">{cert.title}</p>
                  <p className="text-xs text-gray-500">{cert.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 p-10 sm:p-12 text-center overflow-hidden"
        >
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-amber-300/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Join Our Growing Community
            </h3>
            <p className="text-white/85 mb-8 max-w-xl mx-auto text-base leading-relaxed">
              Start your mental health journey today with a platform trusted by organisations across 10+ countries.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center space-x-2 bg-white text-violet-700 hover:bg-violet-50 px-8 py-3.5 rounded-xl font-bold shadow-lg transition-all duration-300 text-sm group"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center border-2 border-white/60 text-white hover:bg-white/10 px-8 py-3.5 rounded-xl font-bold transition-all duration-300 text-sm"
              >
                Learn More
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default WellnessStats;

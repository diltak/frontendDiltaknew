"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView, useMotionValue, animate } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  Brain,
  Heart,
  Users,
  CheckCircle,
  Globe,
  BarChart2,
} from 'lucide-react';
import LandingNavbar from '@/components/landing/LandingNavbar';
import Footer from '@/components/Footer';
import WellnessHero from '@/components/mental-health/WellnessHero';
import WellnessFeatures from '@/components/mental-health/WellnessFeatures';
import WellnessResources from '@/components/mental-health/WellnessResources';
import WellnessStats from '@/components/mental-health/WellnessStats';
import WellnessTestimonials from '@/components/mental-health/WellnessTestimonials';
import { howItWorksSteps, audienceCards, impactStats, trustItems, faqs } from '@/lib/landing/data';
import { getStepDelay } from '@/lib/landing/helpers';

// ─── AnimatedCounter ──────────────────────────────────────────────────────────

function AnimatedCounter({
  target,
  duration,
}: {
  target: number;
  duration: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      animate(motionValue, target, {
        duration,
        ease: 'easeOut',
        onUpdate: (v) => {
          if (ref.current) ref.current.textContent = Math.round(v).toString();
        },
      });
    }
  }, [isInView, target, duration, motionValue]);

  return <span ref={ref}>0</span>;
}

// ─── FAQ border color rotation ─────────────────────────────────────────────

const faqBorderColors = [
  'border-violet-200 dark:border-violet-800',
  'border-purple-200 dark:border-purple-800',
  'border-amber-200 dark:border-amber-800',
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 80]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-amber-50 dark:from-gray-950 dark:via-purple-950 dark:to-violet-950 text-gray-900 dark:text-gray-100 transition-colors duration-500 overflow-x-hidden">

      {/* 1. Animated Background — fixed, z-0, pointer-events-none */}
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

      {/* 2. Navbar */}
      <div className="absolute z-50">
        <LandingNavbar />
      </div>

      {/* 3. Hero Section */}
      <motion.section
        className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-amber-50 dark:from-gray-950 dark:via-purple-950 dark:to-violet-950 py-16 sm:py-20 md:py-24 lg:py-28 z-10"
        style={{ y: heroY }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left — Content */}
            <div className="order-2 lg:order-1 space-y-6">

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center space-x-2 bg-violet-100 dark:bg-violet-900/30 px-4 py-2 rounded-full border border-violet-200 dark:border-violet-700"
              >
                <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                  AI-Powered Mental Wellness
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <span className="text-gray-900 dark:text-white">Mental Wellness,</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500">
                  Powered by AI
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                className="text-lg sm:text-xl leading-relaxed text-gray-600 dark:text-gray-300 max-w-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                Empowering enterprises, educational institutions, and healthcare providers with predictive mental health analytics, real-time burnout detection, and compassionate AI support.
              </motion.p>

              {/* Social Proof Bar */}
              {/* <motion.div
                className="flex flex-wrap items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <div className="flex items-center space-x-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-4 py-2 rounded-full border border-violet-200 dark:border-violet-800">
                  <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">3K+ Lives Impacted</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-4 py-2 rounded-full border border-violet-200 dark:border-violet-800">
                  <Globe className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">10+ Countries</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-200 dark:border-amber-800">
                  <Brain className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">98% AI Accuracy</span>
                </div>
              </motion.div> */}

              {/* Trust line */}
              <motion.p
                className="text-sm text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                Trusted by 3K+ professionals across 10+ countries
              </motion.p>

              {/* CTAs */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-violet-500/30 transition-all duration-300 group"
                >
                  <Link href="/wellness-hub" className="flex items-center space-x-2">
                    <span>Explore Platform</span>
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 px-8 py-6 text-base font-semibold rounded-xl transition-all duration-300"
                >
                  <Link href="/contact">Get a Demo</Link>
                </Button>
              </motion.div>
            </div>

            {/* Right — Robot Image */}
            <motion.div
              className="relative flex justify-center items-center order-1 lg:order-2"
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                <motion.div
                  className="relative h-[220px] sm:h-[300px] md:h-[380px] lg:h-[440px] xl:h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-violet-100 via-purple-100 to-amber-100 dark:from-violet-900/20 dark:via-purple-900/20 dark:to-amber-900/20 shadow-2xl border border-violet-200/50 dark:border-violet-700/30"
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Image
                    src="/images/robot_image_with_wires.png"
                    alt="AI Robot representing mental health analytics platform"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 640px) 280px, (max-width: 768px) 384px, (max-width: 1024px) 448px, 512px"
                  />
                </motion.div>

                {/* Floating stat: AI Accuracy */}
                {/* <motion.div
                  className="absolute -top-4 -left-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-violet-200 dark:border-violet-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">AI Accuracy</p>
                      <p className="text-lg font-bold text-violet-600 dark:text-violet-400">98%</p>
                    </div>
                  </div>
                </motion.div> */}

                {/* Floating stat: Satisfaction */}
                {/* <motion.div
                  className="absolute -bottom-4 -right-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-amber-200 dark:border-amber-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Satisfaction</p>
                      <p className="text-lg font-bold text-amber-500">95%</p>
                    </div>
                  </div>
                </motion.div> */}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* 4. How It Works */}
      <section
        id="how-it-works"
        className="relative py-16 sm:py-20 md:py-24 lg:py-28 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-semibold px-4 py-1.5 rounded-full border border-violet-200 dark:border-violet-700 mb-4">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">
              From Onboarding to Insight in 4 Steps
            </h2>
          </motion.div>

          {/* Steps */}
          <div className="relative">
            {/* Horizontal connector — desktop only */}
            <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-200 via-purple-300 to-amber-200 dark:from-violet-800 dark:via-purple-700 dark:to-amber-800 mx-[12.5%]" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {howItWorksSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className="relative flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: getStepDelay(index, 0.15) }}
                >
                  {/* Step number circle */}
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg mb-5 z-10 relative">
                    {step.id}
                  </div>

                  {/* Card */}
                  <Card className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-violet-100 dark:border-violet-900/50 shadow-md hover:shadow-xl transition-shadow duration-300 rounded-2xl">
                    <CardContent className="p-6 space-y-3">
                      <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center mx-auto">
                        <step.icon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{step.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Products Showcase */}
      <section className="relative py-16 sm:py-20 md:py-24 lg:py-28 z-10 overflow-hidden">
        {/* Subtle section background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-50/40 to-transparent dark:via-violet-950/20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <motion.div
            className="text-center mb-16 sm:mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold px-4 py-1.5 rounded-full border border-purple-200 dark:border-purple-700 mb-5">
              Our Products
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-5">
              Two Products.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500">
                One Mission.
              </span>
            </h2>
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Whether you&apos;re an individual seeking personal wellness support or an organisation protecting workforce mental health — we have a product built exactly for you.
            </p>
          </motion.div>

          {/* ── Saathi Showcase ────────────────────────────────────────────── */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-20 sm:mb-28"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Left — Copy */}
            <div className="order-2 lg:order-1 space-y-6">
              {/* Product badge */}
              <div className="inline-flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center shadow-md">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">
                  Saathi
                </span>
                <span className="text-xs font-semibold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2.5 py-1 rounded-full border border-violet-200 dark:border-violet-700">
                  For Individuals
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                Your AI-Powered Mental Wellness Companion
              </h3>

              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-base">
                Saathi is your personal mental wellness partner — empathetic, always on, and completely anonymous. Have a real conversation about how you&apos;re feeling, get personalised coping strategies, and connect with peers who understand.
              </p>

              <ul className="space-y-3">
                {[
                  { label: 'Daily AI mood check-ins with empathetic conversations', emoji: '💬' },
                  { label: 'Anonymous peer support community — zero stigma', emoji: '🛡️' },
                  { label: 'Personalised coping plans matched to your triggers', emoji: '🎯' },
                  { label: 'On-demand licensed therapist connections', emoji: '👨‍⚕️' },
                  { label: 'Gamified wellness streaks & milestone rewards', emoji: '🏆' },
                ].map(({ label, emoji }) => (
                  <li key={label} className="flex items-start gap-3">
                    <span className="text-lg leading-none mt-0.5 flex-shrink-0">{emoji}</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{label}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/products/saathi"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-violet-300/40 dark:hover:shadow-violet-900/40 transition-all duration-300 text-sm group"
                >
                  <span>Explore Saathi</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center border-2 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 px-6 py-3 rounded-xl font-semibold transition-all duration-300 text-sm"
                >
                  Request a Demo
                </Link>
              </div>
            </div>

            {/* Right — Screenshots */}
            <div className="order-1 lg:order-2 relative">
              {/* Glow behind screenshots */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-3xl blur-3xl scale-110 pointer-events-none" />

              {/* Browser-style frame */}
              <div className="relative bg-gray-950 rounded-2xl shadow-2xl shadow-violet-900/30 overflow-hidden border border-violet-200/30 dark:border-violet-700/40">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-gray-800">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-violet-500/80" />
                  </div>
                  <div className="flex-1 bg-gray-800 rounded-md px-3 py-1 text-[11px] text-gray-500 ml-2 max-w-[200px] truncate">
                    app.diltak.ai/saathi
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                    <span className="text-[10px] text-gray-500">Live</span>
                  </div>
                </div>

                {/* Primary screenshot */}
                <div className="relative w-full aspect-[16/10] overflow-hidden">
                  <Image
                    src="/assets/screenShorts/sarthi/sarthi1.png"
                    alt="Saathi AI mental wellness companion — daily check-in screen"
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                  />
                  {/* Gradient overlay at bottom for second screenshot peek */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-950 to-transparent" />
                </div>
              </div>

              {/* Floating second screenshot — offset card */}
              <motion.div
                className="absolute -bottom-6 -right-3 sm:-right-6 w-2/5 sm:w-[45%] bg-gray-950 rounded-xl shadow-2xl shadow-violet-900/40 overflow-hidden border border-violet-300/30 dark:border-violet-700/50 z-10"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="flex items-center gap-1 px-2.5 py-2 bg-gray-900 border-b border-gray-800">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500/70" />
                    <div className="w-2 h-2 rounded-full bg-amber-500/70" />
                    <div className="w-2 h-2 rounded-full bg-violet-500/70" />
                  </div>
                </div>
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  <Image
                    src="/assets/screenShorts/sarthi/sarthi2.png"
                    alt="Saathi AI — mood tracking and wellness insights"
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 40vw, 280px"
                  />
                </div>
              </motion.div>

              {/* Floating stat badge */}
              <motion.div
                className="absolute -top-4 -left-2 sm:-left-6 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md px-3 py-2.5 rounded-2xl shadow-xl border border-violet-200 dark:border-violet-700"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-violet-100 dark:bg-violet-900/40 rounded-lg flex items-center justify-center">
                    <Heart className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">Daily check-ins</p>
                    <p className="text-sm font-bold text-violet-600 dark:text-violet-400 leading-tight">10K+ / day</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-violet-200 dark:via-violet-800 to-transparent mb-20 sm:mb-28" />

          {/* ── Umang Showcase ─────────────────────────────────────────────── */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Left — Screenshot */}
            <div className="relative order-1">
              {/* Glow behind */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/15 to-orange-400/15 rounded-3xl blur-3xl scale-110 pointer-events-none" />

              {/* Main dashboard frame */}
              <div className="relative bg-gray-950 rounded-2xl shadow-2xl shadow-amber-900/20 overflow-hidden border border-amber-200/30 dark:border-amber-700/40">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-gray-800">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-orange-500/80" />
                  </div>
                  <div className="flex-1 bg-gray-800 rounded-md px-3 py-1 text-[11px] text-gray-500 ml-2 max-w-[220px] truncate">
                    app.diltak.ai/umang/dashboard
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] text-gray-500">Live</span>
                  </div>
                </div>

                <div className="relative w-full aspect-[16/10] overflow-hidden">
                  <Image
                    src="/assets/screenShorts/umang/umang1.png"
                    alt="Umang enterprise mental health analytics dashboard — wellness index and burnout detection"
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-950 to-transparent" />
                </div>
              </div>

              {/* Floating KPI badge — top right */}
              <motion.div
                className="absolute -top-4 -right-2 sm:-right-6 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md px-3 py-2.5 rounded-2xl shadow-xl border border-amber-200 dark:border-amber-700"
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
                    <BarChart2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">Absence reduction</p>
                    <p className="text-sm font-bold text-amber-600 dark:text-amber-400 leading-tight">↓ 40% avg</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating alert badge — bottom left */}
              <motion.div
                className="absolute -bottom-4 -left-2 sm:-left-6 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md px-3 py-2.5 rounded-2xl shadow-xl border border-orange-200 dark:border-orange-700"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">AI Wellness Alert</p>
                    <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 leading-tight">3 depts need attention</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right — Copy */}
            <div className="order-2 space-y-6">
              {/* Product badge */}
              <div className="inline-flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                  <BarChart2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                  Umang
                </span>
                <span className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-700">
                  For Enterprises
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                Enterprise Mental Health Intelligence Dashboard
              </h3>

              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-base">
                Umang gives HR leaders and CHROs a real-time view of workforce mental wellness. Detect burnout risk weeks in advance, understand department-level trends, and act on AI-recommended interventions — all without compromising employee anonymity.
              </p>

              <ul className="space-y-3">
                {[
                  { label: 'Real-time organisational wellness index updated daily', emoji: '📊' },
                  { label: 'Predictive burnout detection 3–4 weeks in advance', emoji: '🔮' },
                  { label: 'Anonymous department analytics — no individual exposure', emoji: '🔒' },
                  { label: 'ROI reporting: absenteeism, productivity & retention', emoji: '💼' },
                  { label: 'HRIS integration: Workday, SAP, BambooHR and more', emoji: '🔗' },
                ].map(({ label, emoji }) => (
                  <li key={label} className="flex items-start gap-3">
                    <span className="text-lg leading-none mt-0.5 flex-shrink-0">{emoji}</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{label}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/products/umang"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-amber-300/40 dark:hover:shadow-amber-900/40 transition-all duration-300 text-sm group"
                >
                  <span>Explore Umang</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center border-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 px-6 py-3 rounded-xl font-semibold transition-all duration-300 text-sm"
                >
                  Schedule a Demo
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 6. Audience Section */}
      <section
        id="audience"
        className="relative py-16 sm:py-20 md:py-24 lg:py-28 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-semibold px-4 py-1.5 rounded-full border border-amber-200 dark:border-amber-700 mb-4">
              Built For You
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-amber-500">
              Solutions for Every Use Case
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {audienceCards.map((card, index) => {
              const accentMap: Record<string, string> = {
                violet: 'border-violet-300 dark:border-violet-700',
                purple: 'border-purple-300 dark:border-purple-700',
                amber: 'border-amber-300 dark:border-amber-700',
              };
              const iconBgMap: Record<string, string> = {
                violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
                purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
                amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
              };
              const ctaBgMap: Record<string, string> = {
                violet: 'bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800',
                purple: 'bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800',
                amber: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
              };

              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  whileHover={!card.isFeatured ? { y: -8 } : undefined}
                  className="flex"
                >
                  <Card
                    className={`flex flex-col w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 ${accentMap[card.accentColor]} shadow-lg rounded-3xl overflow-hidden transition-shadow duration-300 hover:shadow-xl ${card.isFeatured ? 'ring-2 ring-violet-500' : ''}`}
                  >
                    <CardHeader className="p-8 pb-0">
                      {card.isFeatured && (
                        <div className="inline-block bg-gradient-to-r from-violet-600 to-purple-700 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 self-start">
                          Most Popular
                        </div>
                      )}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${iconBgMap[card.accentColor]}`}>
                        <card.icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.subtitle}</p>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col flex-1 space-y-5">
                      <ul className="space-y-2 flex-1">
                        {card.benefits.map((b) => (
                          <li key={b} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                            <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${card.accentColor === 'amber' ? 'text-amber-500' : card.accentColor === 'purple' ? 'text-purple-500' : 'text-violet-600'}`} />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        asChild
                        className={`${ctaBgMap[card.accentColor]} text-white rounded-xl font-semibold shadow-md`}
                      >
                        <Link href={card.cta.href}>{card.cta.label}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Impact Stats Section */}
      <section className="relative py-16 sm:py-20 md:py-24 lg:py-28 bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 z-10 overflow-hidden">
        {/* Decorative blobs inside the section */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-300 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-violet-200 text-lg max-w-2xl mx-auto">
              Real outcomes across enterprises, healthcare, and education worldwide.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {impactStats.map((stat, index) => (
              <motion.div
                key={stat.id}
                className="flex flex-col items-center text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-4xl font-extrabold text-white mb-1">
                  <AnimatedCounter target={stat.target} duration={stat.duration} />
                  {stat.suffix}
                </div>
                <p className="text-violet-200 text-sm font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Testimonials */}
      <div className="relative z-10">
        <WellnessTestimonials />
      </div>

      {/* 9. Trust Section */}
      <section
        id="trust"
        className="relative py-16 sm:py-20 md:py-24 lg:py-28 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-semibold px-4 py-1.5 rounded-full border border-violet-200 dark:border-violet-700 mb-4">
              Security &amp; Trust
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">
              Built on a Foundation of Trust
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {trustItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-violet-100 dark:border-violet-900/50 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl text-center">
                  <CardContent className="p-6 flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                    </div>
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Wellness Block */}
      <div className="relative z-10">
        <div id="wellness">
          <WellnessHero />
        </div>
        <WellnessFeatures />
        {/* <WellnessResources /> */}
        {/* <WellnessStats /> */}
      </div>

      {/* 11. CTA Banner Section */}
      <section className="relative py-16 sm:py-20 md:py-24 lg:py-28 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 p-10 sm:p-14 text-white text-center shadow-2xl"
          >
            {/* Decorative blobs inside card */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-5">
                Ready to Transform Your Organisation&apos;s<br />Mental Wellness?
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-violet-700 hover:bg-violet-50 font-semibold px-8 py-6 rounded-xl shadow-md text-base transition-all duration-300"
                >
                  <Link href="/contact">Schedule a Free Demo</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white bg-white/10 hover:bg-white/10 font-semibold px-8 py-6 rounded-xl text-base transition-all duration-300"
                >
                  <Link href="/wellness-hub">Explore the Platform</Link>
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-white/90">
                <span className="flex items-center space-x-1"><CheckCircle className="w-5 h-5 mr-1" />No credit card required</span>
                <span className="flex items-center space-x-1"><CheckCircle className="w-5 h-5 mr-1" />HIPAA Compliant</span>
                <span className="flex items-center space-x-1"><CheckCircle className="w-5 h-5 mr-1" />Setup in 48 hours</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 12. FAQ Section */}
      <section
        id="faq"
        className="relative py-16 sm:py-20 md:py-24 lg:py-28 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-semibold px-4 py-1.5 rounded-full border border-violet-200 dark:border-violet-700 mb-4">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-4 mb-12">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              const borderColor = faqBorderColors[index % faqBorderColors.length];
              const faqId = `faq-answer-${index}`;
              const btnId = `faq-btn-${index}`;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border ${borderColor} shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden`}>
                    <CardContent className="p-0">
                      <button
                        id={btnId}
                        className="w-full flex items-center justify-between p-6 text-left"
                        onClick={() => toggleFaq(index)}
                        aria-expanded={isOpen}
                        aria-controls={faqId}
                      >
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-base sm:text-lg pr-4">
                          {faq.question}
                        </span>
                        <div className="flex-shrink-0 w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                          {isOpen ? (
                            <Minus className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                          ) : (
                            <Plus className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                          )}
                        </div>
                      </button>
                      {isOpen && (
                        <div
                          id={faqId}
                          role="region"
                          aria-labelledby={btnId}
                          className="px-6 pb-6"
                        >
                          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom CTA card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl bg-gradient-to-r from-violet-500 via-purple-500 to-amber-500 p-8 text-center text-white shadow-xl"
          >
            <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
            <p className="text-white/80 mb-5 max-w-md mx-auto">Our team is here to help. Reach out and we&apos;ll get back to you within 24 hours.</p>
            <Button
              asChild
              className="bg-white text-violet-700 hover:bg-violet-50 font-semibold px-8 py-3 rounded-xl shadow-md text-sm transition-all duration-300"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* 13. Footer */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

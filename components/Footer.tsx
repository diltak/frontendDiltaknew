"use client";

import Link from 'next/link';
import { Sparkles, Mail, ArrowRight, Twitter, Linkedin, Github, Heart, Shield, Lock } from 'lucide-react';
import { useModal } from '@/contexts/modal-context';

const productLinks = [
  { label: 'Saathi', href: '/products/saathi', desc: 'Personal wellness companion' },
  { label: 'Umang', href: '/products/umang', desc: 'Enterprise HR analytics' },
  { label: 'Wellness Hub', href: '/wellness-hub', desc: 'Employee well-being portal' },
];

const solutionLinks = [
  { label: 'For Enterprises', href: '/#audience' },
  { label: 'For Healthcare', href: '/#audience' },
  { label: 'For Individuals', href: '/#audience' },
  { label: 'How It Works', href: '/#how-it-works' },
];

const companyLinks = [
  { label: 'About', href: '/#advantage' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '/terms' },
];

const trustBadges = [
  { icon: Shield, label: 'HIPAA Compliant' },
  { icon: Lock, label: 'End-to-End Encrypted' },
  { icon: Heart, label: '100% Anonymous' },
];

export default function Footer() {
  const { openContactModal } = useModal();

  return (
    <footer className="relative bg-gray-950 text-white overflow-hidden">

      {/* Top decorative gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

      {/* Ambient glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Main footer grid ─────────────────────────────────────────────── */}
        <div className="pt-16 pb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* Brand column — spans 4 cols on lg */}
          <div className="lg:col-span-4 space-y-6">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-900/40 group-hover:shadow-violet-700/50 transition-shadow duration-300">
                <Sparkles className="text-white w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400">
                Diltak.ai
              </span>
            </Link>

            {/* Tagline */}
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              AI-powered mental health analytics for enterprises, healthcare providers, and educational institutions. Built with compassion, backed by science.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              {trustBadges.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center space-x-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-gray-300 font-medium"
                >
                  <Icon className="w-3 h-3 text-violet-400" />
                  <span>{label}</span>
                </span>
              ))}
            </div>

            {/* Social icons */}
            <div className="flex items-center space-x-3">
              {[
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Linkedin, href: 'https://www.linkedin.com/company/diltak', label: 'LinkedIn' },
                { icon: Github, href: '#', label: 'GitHub' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/30 transition-all duration-200"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Products column */}
          <div className="lg:col-span-2 space-y-5">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Products
            </h4>
            <ul className="space-y-4">
              {productLinks.map(({ label, href, desc }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group block"
                  >
                    <span className="text-sm text-gray-300 group-hover:text-white font-medium transition-colors duration-200 flex items-center space-x-1">
                      <span>{label}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5 block">{desc}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions column */}
          <div className="lg:col-span-2 space-y-5">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Solutions
            </h4>
            <ul className="space-y-3">
              {solutionLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-1 group"
                  >
                    <span>{label}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div className="lg:col-span-2 space-y-5">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-1 group"
                  >
                    <span>{label}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA / Newsletter column */}
          <div className="lg:col-span-2 space-y-5">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Get In Touch
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Ready to transform your organisation&apos;s mental wellness?
            </p>
            <a
              href="mailto:info@diltak.ai"
              className="inline-flex items-center space-x-2 text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors duration-200 group"
            >
              <Mail className="w-5 h-5" />
              <span>info@diltak.ai</span>
            </a>
            <div className="pt-1">
              <Link
                href="/contact"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-violet-900/40 hover:shadow-violet-800/50 transition-all duration-300 group"
              >
                <span>Request a Demo</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* ── Bottom bar ───────────────────────────────────────────────────── */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 order-2 sm:order-1">
            © 2025 Diltak.ai. All rights reserved. Made with{' '}
            <Heart className="w-3 h-3 inline text-violet-400 fill-violet-400" />{' '}
            for mental wellness.
          </p>
          <div className="flex items-center space-x-1 order-1 sm:order-2">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-xs text-gray-500 font-medium">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

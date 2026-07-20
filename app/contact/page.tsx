"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import LandingNavbar from '@/components/landing/LandingNavbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  Mail,
  Linkedin,
  MapPin,
  CheckCircle,
  Send,
  Loader2,
  Clock,
} from 'lucide-react';
import { validateContactForm } from '@/lib/landing/helpers';
import { inquiryPathwayCards, InquiryType } from '@/lib/landing/data';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactFormState {
  name: string;
  email: string;
  organisation: string;
  role: string;
  inquiryType: InquiryType | '';
  message: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [formState, setFormState] = useState<ContactFormState>({
    name: '',
    email: '',
    organisation: '',
    role: '',
    inquiryType: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateContactForm({
      name: formState.name,
      email: formState.email,
      message: formState.message,
    });

    // Merge email_format into email key for display
    const displayErrors: Record<string, string> = {};
    if (validationErrors.name) displayErrors.name = validationErrors.name;
    if (validationErrors.email) displayErrors.email = validationErrors.email;
    if (validationErrors.email_format) displayErrors.email = validationErrors.email_format;
    if (validationErrors.message) displayErrors.message = validationErrors.message;

    setErrors(displayErrors);
    if (Object.keys(displayErrors).length > 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const handleReset = () => {
    setFormState({
      name: '',
      email: '',
      organisation: '',
      role: '',
      inquiryType: '',
      message: '',
    });
    setErrors({});
    setIsSuccess(false);
  };

  // ─── Shared field class ─────────────────────────────────────────────────────

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 text-sm';

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-amber-50 dark:from-gray-950 dark:via-purple-950 dark:to-violet-950 text-gray-900 dark:text-gray-100 transition-colors duration-500 overflow-x-hidden">
      {/* Animated Background Blobs */}
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

      {/* Main content */}
      <main className="relative z-10">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="pt-16 pb-10 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="inline-block bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
                Contact Us
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Get in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-700">
                Touch
              </span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Have a question or ready to transform your organisation&apos;s mental wellness? Our team is here to help.
            </motion.p>
          </div>
        </section>

        {/* ── Two-column grid ───────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

            {/* ── LEFT: Contact Form ──────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
                {isSuccess ? (
                  /* ── Success State ─── */
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                      className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6"
                    >
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Message Sent!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8">
                      Thank you — we&apos;ll be in touch within 24 hours.
                    </p>
                    <Button
                      onClick={handleReset}
                      className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white px-6 py-2 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      Send Another
                    </Button>
                  </div>
                ) : (
                  /* ── Form ─── */
                  <form onSubmit={handleSubmit} noValidate>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      Send us a message
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Name */}
                      <div className="flex flex-col gap-1">
                        <label
                          htmlFor="name"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          value={formState.name}
                          onChange={handleChange}
                          placeholder="Jane Doe"
                          aria-describedby={errors.name ? 'name-error' : undefined}
                          aria-invalid={!!errors.name}
                          className={inputClass}
                        />
                        {errors.name && (
                          <p
                            id="name-error"
                            role="alert"
                            className="text-red-500 text-sm mt-1"
                          >
                            {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-1">
                        <label
                          htmlFor="email"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Work Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={formState.email}
                          onChange={handleChange}
                          placeholder="jane@company.com"
                          aria-describedby={errors.email ? 'email-error' : undefined}
                          aria-invalid={!!errors.email}
                          className={inputClass}
                        />
                        {errors.email && (
                          <p
                            id="email-error"
                            role="alert"
                            className="text-red-500 text-sm mt-1"
                          >
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Organisation */}
                      <div className="flex flex-col gap-1">
                        <label
                          htmlFor="organisation"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Organisation
                        </label>
                        <input
                          id="organisation"
                          name="organisation"
                          type="text"
                          autoComplete="organization"
                          value={formState.organisation}
                          onChange={handleChange}
                          placeholder="Acme Corp"
                          className={inputClass}
                        />
                      </div>

                      {/* Role */}
                      <div className="flex flex-col gap-1">
                        <label
                          htmlFor="role"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Your Role
                        </label>
                        <input
                          id="role"
                          name="role"
                          type="text"
                          autoComplete="organization-title"
                          value={formState.role}
                          onChange={handleChange}
                          placeholder="HR Director"
                          className={inputClass}
                        />
                      </div>

                      {/* Inquiry Type */}
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label
                          htmlFor="inquiryType"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Inquiry Type
                        </label>
                        <select
                          id="inquiryType"
                          name="inquiryType"
                          value={formState.inquiryType}
                          onChange={handleChange}
                          className={`${inputClass} cursor-pointer`}
                        >
                          <option value="">Select inquiry type</option>
                          <option value="Sales Demo">Sales Demo</option>
                          <option value="Technical Support">Technical Support</option>
                          <option value="Partnership">Partnership</option>
                          <option value="General Inquiry">General Inquiry</option>
                        </select>
                      </div>

                      {/* Message */}
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label
                          htmlFor="message"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={5}
                          value={formState.message}
                          onChange={handleChange}
                          placeholder="Tell us how we can help..."
                          aria-describedby={errors.message ? 'message-error' : undefined}
                          aria-invalid={!!errors.message}
                          className={`${inputClass} resize-none`}
                        />
                        {errors.message && (
                          <p
                            id="message-error"
                            role="alert"
                            className="text-red-500 text-sm mt-1"
                          >
                            {errors.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="mt-6">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white py-3 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Send className="w-5 h-5" />
                            Send Message
                          </span>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>

            {/* ── RIGHT: Sidebar ──────────────────────────────────────── */}
            <div className="lg:sticky lg:top-24 flex flex-col gap-6">

              {/* Contact Details */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Contact Details
                </h3>
                <ul className="space-y-4">
                  {/* Email */}
                  <li className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Email</p>
                      <a
                        href="mailto:info@diltak.ai"
                        className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                      >
                        info@diltak.ai
                      </a>
                    </div>
                  </li>

                  {/* LinkedIn */}
                  <li className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                      <Linkedin className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">LinkedIn</p>
                      <a
                        href="https://www.linkedin.com/company/diltak"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                      >
                        Connect on LinkedIn
                      </a>
                    </div>
                  </li>

                  {/* Location */}
                  <li className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Location</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        India · Serving Globally
                      </p>
                    </div>
                  </li>

                  {/* Response time */}
                  <li className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Response Time</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        We respond within 24 hours
                      </p>
                    </div>
                  </li>
                </ul>
              </motion.div>

              {/* Inquiry Pathway Cards */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  What can we help with?
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {inquiryPathwayCards.map((card, index) => {
                    const Icon = card.icon;
                    const isSelected = formState.inquiryType === card.id;
                    return (
                      <motion.button
                        key={card.id}
                        type="button"
                        onClick={() =>
                          setFormState((prev) => ({ ...prev, inquiryType: card.id }))
                        }
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.6 + index * 0.08 }}
                        whileHover={{ y: -2 }}
                        className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'border-violet-500 dark:border-violet-400 bg-violet-50 dark:bg-violet-900/20'
                            : 'border-violet-200 dark:border-violet-800 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50/50 dark:hover:bg-violet-900/10'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-violet-600 dark:bg-violet-500'
                              : 'bg-violet-100 dark:bg-violet-900/30'
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${
                              isSelected
                                ? 'text-white'
                                : 'text-violet-600 dark:text-violet-400'
                            }`}
                          />
                        </div>
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              isSelected
                                ? 'text-violet-700 dark:text-violet-300'
                                : 'text-gray-800 dark:text-gray-200'
                            }`}
                          >
                            {card.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {card.description}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Why Diltak.ai trust box */}
              {/* <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl shadow-xl p-6 text-white"
              >
                <h3 className="text-lg font-bold mb-4">Why Diltak.ai?</h3>
                <ul className="space-y-3">
                  {[
                    { icon: '🔒', label: 'HIPAA Compliant' },
                    { icon: '🌍', label: 'Used in 10+ countries' },
                    { icon: '🎯', label: '98% AI Accuracy' },
                  ].map((item) => (
                    <li key={item.label} className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </li>
                  ))}
                </ul>
              </motion.div> */}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import ServerAddress from '@/constent/ServerAddress';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${ServerAddress}/auth/forgot-password`, { email });
      setSuccess(true);
      toast.success('Password reset email sent!');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send reset email. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail('');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  const handleTryDifferentEmail = () => {
    setSuccess(false);
    setEmail('');
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              disabled={loading}
              className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-8 sm:p-10">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-5"
                >
                  <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                    <p className="text-gray-500 text-sm mb-4">We've sent a password reset link to:</p>
                    <p className="font-semibold text-gray-900 mb-4">{email}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Click the link in the email to reset your password. If you don't see it, check your spam folder.
                    </p>
                  </div>
                  <div className="space-y-3 pt-4">
                    <button
                      onClick={handleClose}
                      className="w-full px-6 py-2.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
                    >
                      Back to Login
                    </button>
                    <button
                      onClick={handleTryDifferentEmail}
                      className="w-full flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      Try Different Email
                    </button>
                  </div>
                </motion.div>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
                    <p className="text-sm text-gray-500">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-5">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 text-[11px] font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg"
                      >
                        {error}
                      </motion.div>
                    )}

                    <div>
                      <label htmlFor="reset-email" className="block text-xs font-medium text-gray-500 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          id="reset-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                          className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-colors"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!email.trim() || loading}
                        className="flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Sending...</span>
                          </div>
                        ) : 'Send Link'}
                      </button>
                    </div>
                  </form>

                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="font-medium text-gray-800 text-xs mb-3">Need help?</h3>
                    <ul className="text-[11px] text-gray-500 space-y-2 list-disc pl-4">
                      <li>Use the email address associated with your account.</li>
                      <li>Check your spam or junk folder if you don't receive the email.</li>
                      <li>The reset link will expire after 1 hour for security reasons.</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

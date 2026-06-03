'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText, Scale } from 'lucide-react';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">D</span>
          </div>
          <span className="text-lg font-bold text-gray-800 tracking-tight">Diltak.ai</span>
        </div>
        <Link
          href="/auth/login"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all border border-gray-200"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Login
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Terms &amp; Conditions</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Please read these terms carefully before using our platform. By accessing or using Diltak.ai, you agree to be bound by these terms.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 sm:p-12 space-y-10">
            
            {/* Section 1 */}
            <section className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
                <p className="text-gray-600 leading-relaxed">
                  Welcome to Diltak.ai. These Terms of Service ("Terms") govern your use of the Diltak.ai website, application, and related services (collectively, the "Service"). By using the Service, you accept these Terms in full. If you disagree with these Terms or any part of them, you must not use the Service.
                </p>
              </div>
            </section>

            <hr className="border-gray-100" />

            {/* Section 2 */}
            <section className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">2. Privacy and Data Security</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Your privacy is critically important to us. We employ industry-standard encryption to protect your data. By using Diltak.ai, you consent to the collection, use, and disclosure of your personal information as described in our Privacy Policy.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Data is never sold to third parties.</li>
                  <li>You maintain ownership of all data submitted.</li>
                  <li>Strict access controls are enforced on employee health data.</li>
                </ul>
              </div>
            </section>

            <hr className="border-gray-100" />

            {/* Section 3 */}
            <section className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <Scale className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">3. User Conduct</h2>
                <p className="text-gray-600 leading-relaxed">
                  You agree to use the Service only for lawful purposes. You must not use the Service in any way that causes, or may cause, damage to the Service or impairment of the availability or accessibility of the Service. Any fraudulent, abusive, or otherwise illegal activity may be grounds for termination of your account.
                </p>
              </div>
            </section>

          </div>
          
          <div className="bg-gray-50 p-6 sm:px-12 text-center border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * lib/landing/data.ts
 *
 * Typed data constants for all landing, contact, Saathi, and Umang page sections.
 * Validates: Requirements 5.2, 5.3, 6.3, 7.2, 8.1, 10.2, 19.2, 24.2
 */

import type { LucideIcon } from "lucide-react";
import {
  Plug,
  Users,
  Brain,
  TrendingUp,
  Building2,
  Heart,
  Stethoscope,
  Globe,
  TrendingDown,
  Shield,
  Lock,
  Eye,
  CheckCircle,
  Award,
  MessageCircle,
  Lightbulb,
  HeartHandshake,
  Trophy,
  Mic,
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  ClipboardList,
  Layers,
  Calendar,
  Headphones,
  Handshake,
  HelpCircle,
} from "lucide-react";

// ─── How It Works ─────────────────────────────────────────────────────────────

export interface HowItWorksStep {
  id: number;
  icon: LucideIcon;
  title: string; // max 5 words
  description: string; // max 20 words
  color: string; // Tailwind color token e.g. "violet"
}

export const howItWorksSteps: HowItWorksStep[] = [
  {
    id: 1,
    icon: Plug,
    title: "Integrate & Onboard",
    description:
      "Connect Umang to your HR systems via API in under 48 hours.",
    color: "violet",
  },
  {
    id: 2,
    icon: Users,
    title: "Employees Engage",
    description:
      "Employees interact daily with Saathi for anonymous real-time wellness check-ins.",
    color: "purple",
  },
  {
    id: 3,
    icon: Brain,
    title: "AI Analyses",
    description:
      "Our AI engine surfaces burnout signals, mood trends and department-level risks.",
    color: "indigo",
  },
  {
    id: 4,
    icon: TrendingUp,
    title: "HR Acts",
    description:
      "HR leaders receive prioritised alerts and intervention templates to act fast.",
    color: "amber",
  },
];

// ─── Audience Cards ───────────────────────────────────────────────────────────

export interface AudienceCard {
  id: "enterprise" | "individual" | "healthcare";
  icon: LucideIcon;
  title: string;
  subtitle: string; // max 10 words
  benefits: string[]; // 3–5 items
  cta: { label: string; href: string };
  isFeatured?: boolean;
  accentColor: string;
}

export const audienceCards: AudienceCard[] = [
  {
    id: "enterprise",
    icon: Building2,
    title: "For Enterprises",
    subtitle: "Reduce absenteeism and protect workforce mental health",
    benefits: [
      "Real-time burnout detection",
      "Anonymous department analytics",
      "HRIS integration",
      "ROI reporting",
    ],
    cta: { label: "Talk to Sales", href: "/contact" },
    isFeatured: true,
    accentColor: "violet",
  },
  {
    id: "individual",
    icon: Heart,
    title: "For Individuals",
    subtitle: "Daily AI companion supporting your personal wellness journey",
    benefits: [
      "24/7 conversational check-ins",
      "Personalised coping plans",
      "Anonymous peer community",
      "Therapist on demand",
    ],
    cta: { label: "Try Saathi", href: "/products/saathi" },
    accentColor: "purple",
  },
  {
    id: "healthcare",
    icon: Stethoscope,
    title: "For Healthcare",
    subtitle: "Staff wellness solutions built for clinical environments",
    benefits: [
      "HIPAA-compliant platform",
      "Clinician burnout monitoring",
      "Shift-aware analytics",
      "White-label option",
    ],
    cta: { label: "Get in Touch", href: "/contact" },
    accentColor: "amber",
  },
];

// ─── Impact Stats ─────────────────────────────────────────────────────────────

export interface ImpactStat {
  id: string;
  icon: LucideIcon;
  target: number;
  suffix: string; // e.g. "+" or "%"
  prefix?: string;
  label: string; // max 5 words
  duration: number; // animation duration in seconds
}

export const impactStats: ImpactStat[] = [
  {
    id: "lives",
    icon: Users,
    target: 3000,
    suffix: "+",
    label: "Lives Impacted",
    duration: 1.5,
  },
  {
    id: "countries",
    icon: Globe,
    target: 10,
    suffix: "+",
    label: "Countries",
    duration: 1.5,
  },
  {
    id: "absence",
    icon: TrendingDown,
    target: 40,
    suffix: "%",
    label: "Absence Reduction",
    duration: 1.5,
  },
  {
    id: "accuracy",
    icon: Brain,
    target: 98,
    suffix: "%",
    label: "AI Accuracy",
    duration: 1.5,
  },
  {
    id: "satisfaction",
    icon: Heart,
    target: 95,
    suffix: "%",
    label: "User Satisfaction",
    duration: 1.5,
  },
];

// ─── Trust Items ──────────────────────────────────────────────────────────────

export interface TrustItem {
  id: string;
  icon: LucideIcon;
  label: string;
  description: string; // max 8 words
}

export const trustItems: TrustItem[] = [
  {
    id: "hipaa",
    icon: Shield,
    label: "HIPAA Compliant",
    description: "Meets US healthcare data privacy standards",
  },
  {
    id: "e2e",
    icon: Lock,
    label: "End-to-End Encryption",
    description: "All data encrypted in transit and at rest",
  },
  {
    id: "anon",
    icon: Eye,
    label: "100% Anonymous",
    description: "Employee identities never exposed to employers",
  },
  {
    id: "gdpr",
    icon: CheckCircle,
    label: "GDPR Ready",
    description: "Compliant with EU data protection regulation",
  },
  {
    id: "soc2",
    icon: Award,
    label: "SOC 2 Type II",
    description: "Independently audited security controls",
  },
];

// ─── Saathi Features ──────────────────────────────────────────────────────────

export interface SaathiFeature {
  id: string;
  icon: LucideIcon;
  title: string; // max 5 words
  description: string; // max 20 words
}

export const saathiFeatures: SaathiFeature[] = [
  {
    id: "checkin",
    icon: MessageCircle,
    title: "Conversational AI Check-Ins",
    description:
      "Daily mood conversations powered by empathetic AI, available any time.",
  },
  {
    id: "community",
    icon: Users,
    title: "Anonymous Peer Community",
    description:
      "Connect with colleagues safely through fully anonymised peer support groups.",
  },
  {
    id: "coping",
    icon: Lightbulb,
    title: "Personalised Coping Strategies",
    description:
      "AI-curated techniques matched to your mood patterns and stress triggers.",
  },
  {
    id: "trends",
    icon: TrendingUp,
    title: "AI Mood Trend Analysis",
    description:
      "Visualise your emotional patterns over time with actionable weekly insights.",
  },
  {
    id: "therapist",
    icon: HeartHandshake,
    title: "On-Demand Therapist Connection",
    description:
      "Instant access to qualified therapists when professional support is needed.",
  },
  {
    id: "gamify",
    icon: Trophy,
    title: "Gamified Wellness Streaks",
    description:
      "Build healthy habits through streak rewards and wellness milestone celebrations.",
  },
  {
    id: "voice",
    icon: Mic,
    title: "Voice-Based Emotional Support",
    description:
      "Speak naturally with our voice AI for hands-free, expressive check-ins.",
  },
];

// ─── Umang Features ───────────────────────────────────────────────────────────

export interface UmangFeature {
  id: string;
  icon: LucideIcon;
  title: string; // max 5 words
  description: string; // max 20 words
}

export const umangFeatures: UmangFeature[] = [
  {
    id: "index",
    icon: Activity,
    title: "Real-Time Wellness Index",
    description:
      "Live aggregate wellness score across departments, updated every 24 hours.",
  },
  {
    id: "burnout",
    icon: AlertTriangle,
    title: "Predictive Burnout Detection",
    description:
      "ML model flags at-risk employees 3–4 weeks before burnout peaks occur.",
  },
  {
    id: "dept",
    icon: BarChart3,
    title: "Anonymous Department Insights",
    description:
      "Compare wellness trends across teams without exposing individual identities.",
  },
  {
    id: "roi",
    icon: TrendingUp,
    title: "ROI Analytics",
    description:
      "Quantify wellness programme impact on absenteeism, productivity, and retention.",
  },
  {
    id: "alerts",
    icon: Bell,
    title: "Early Warning Alerts",
    description:
      "Automated HR notifications when department risk scores cross defined thresholds.",
  },
  {
    id: "templates",
    icon: ClipboardList,
    title: "Intervention Templates",
    description:
      "Pre-built HR intervention workflows ready to deploy with one click.",
  },
  {
    id: "hris",
    icon: Plug,
    title: "HRIS Integration",
    description:
      "Native connectors for Workday, SAP SuccessFactors, BambooHR, and more.",
  },
  {
    id: "whitelabel",
    icon: Layers,
    title: "White-Label Reporting",
    description:
      "Export branded PDF reports for executive leadership and board-level presentations.",
  },
];

// ─── FAQs ─────────────────────────────────────────────────────────────────────

export interface FAQ {
  question: string;
  answer: string;
}

export const faqs: FAQ[] = [
  {
    question: "What is Diltak.ai?",
    answer:
      "Diltak.ai is an AI-powered mental health analytics platform designed for enterprises, educational institutions, and healthcare providers. We offer comprehensive emotional well-being solutions with real-time analytics and personalized support.",
  },
  {
    question: "How does Diltak.ai help organizations?",
    answer:
      "Diltak.ai helps organizations by providing real-time emotional intelligence, comprehensive wellness analytics, and AI-driven support tools that boost workforce resilience, productivity, and retention.",
  },
  {
    question: "Is Diltak.ai available for white-label integration?",
    answer:
      "Yes, Diltak.ai offers white-label solutions that can be seamlessly integrated into your existing platforms and branded according to your organization's needs.",
  },
  {
    question: "Is Diltak.ai compliant with data privacy standards?",
    answer:
      "Absolutely. Diltak.ai follows industry-leading security measures with end-to-end encryption to protect all sensitive data.",
  },
  {
    question: "How is Diltak.ai different from traditional wellness apps?",
    answer:
      "Diltak.ai goes beyond traditional wellness apps by offering AI-powered emotional intelligence, real-time analytics, and comprehensive organizational insights that traditional apps cannot provide.",
  },
  {
    question: "Can Diltak.ai integrate with our existing systems?",
    answer:
      "Yes, Diltak.ai offers flexible API integration options that can connect with your existing HR systems, communication platforms, and other workplace tools.",
  },
  {
    question: "Can we see a live demo or try a pilot?",
    answer:
      "Absolutely! We offer live demos and pilot programs to help you experience the full capabilities of Diltak.ai before making a decision.",
  },
  {
    question: "How does Diltak.ai improve ROI for enterprises?",
    answer:
      "Diltak.ai improves ROI by reducing absenteeism, increasing productivity, improving employee retention, and providing data-driven insights for better organizational decision-making.",
  },
];

// ─── Inquiry Pathway Cards ────────────────────────────────────────────────────

export type InquiryType =
  | "Sales Demo"
  | "Technical Support"
  | "Partnership"
  | "General Inquiry";

export interface InquiryPathwayCard {
  id: InquiryType;
  icon: LucideIcon;
  title: string;
  description: string; // max 10 words
}

export const inquiryPathwayCards: InquiryPathwayCard[] = [
  {
    id: "Sales Demo",
    icon: Calendar,
    title: "Sales Demo",
    description: "Book a personalised walkthrough with our sales team.",
  },
  {
    id: "Technical Support",
    icon: Headphones,
    title: "Technical Support",
    description: "Get help from our technical support engineers.",
  },
  {
    id: "Partnership",
    icon: Handshake,
    title: "Partnership",
    description: "Explore co-sell and integration partnership opportunities.",
  },
  {
    id: "General Inquiry",
    icon: HelpCircle,
    title: "General Inquiry",
    description: "Any other questions? We are happy to help.",
  },
];

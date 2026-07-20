"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
import HealthScoreTab from "@/components/physical-health/HealthScoreTab";
import CheckInTab from "@/components/physical-health/CheckInTab";
import TrendsTab from "@/components/physical-health/TrendsTab";
import MedicalDocsTab from "@/components/physical-health/MedicalDocsTab";
import ReportsTab from "@/components/physical-health/ReportsTab";
import ProfileTab from "@/components/physical-health/ProfileTab";
import VitalsTab from "@/components/physical-health/VitalsTab";
import HydrationTab from "@/components/physical-health/HydrationTab";
import SleepTab from "@/components/physical-health/SleepTab";
import MovementTab from "@/components/physical-health/MovementTab";
import EnergyTab from "@/components/physical-health/EnergyTab";
import StressTab from "@/components/physical-health/StressTab";
import PreventiveTab from "@/components/physical-health/PreventiveTab";
import ChatPopup from "@/components/physical-health/ChatPopup";

const TABS = [
  { id: "health-score",  label: "Health Score" },
  { id: "check-in",      label: "Daily Check-in" },
  { id: "vitals",        label: "Vitals" },
  { id: "hydration",     label: "Hydration" },
  { id: "sleep",         label: "Sleep" },
  { id: "movement",      label: "Movement" },
  { id: "energy",        label: "Energy" },
  { id: "stress",        label: "Stress" },
  { id: "preventive",    label: "Preventive" },
  { id: "trends",        label: "Trends" },
  { id: "medical-docs",  label: "Medical Docs" },
  { id: "reports",       label: "Reports" },
  { id: "profile",       label: "Profile" },
] as const;

export type PhysicalHealthTabId = (typeof TABS)[number]["id"];

export default function PhysicalHealthPage() {
  const { loading: userLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<PhysicalHealthTabId>("health-score");

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "health-score":  return <HealthScoreTab onNavigate={setActiveTab} />;
      case "check-in":      return <CheckInTab />;
      case "vitals":        return <VitalsTab />;
      case "hydration":     return <HydrationTab />;
      case "sleep":         return <SleepTab />;
      case "movement":      return <MovementTab />;
      case "energy":        return <EnergyTab />;
      case "stress":        return <StressTab />;
      case "preventive":    return <PreventiveTab />;
      case "trends":        return <TrendsTab />;
      case "medical-docs":  return <MedicalDocsTab />;
      case "reports":       return <ReportsTab />;
      case "profile":       return <ProfileTab />;
    }
  };

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-[1400px] mx-auto space-y-4 sm:space-y-5">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
          Physical Health
        </h1>
        <p className="text-sm text-muted-foreground">
          Track vitals, sleep, movement, hydration, energy, stress, medical reports and your overall well-being.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="overflow-hidden rounded-t-lg border-b border-border bg-background shadow-sm">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-0.5 sm:px-1 pt-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="pb-24 sm:pb-20">{renderTab()}</div>

      {/* Chat popup */}
      <ChatPopup />
    </div>
  );
}

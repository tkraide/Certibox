"use client";

import { AccessibilitySettingsSection } from "@/components/accessibility/accessibility-settings-section";

import { AboutSection } from "./about-section";
import { ProfileSection } from "./profile-section";
import { ThemeSection } from "./theme-section";

export function SettingsPageContent() {
  return (
    <div className="space-y-6">
      <ProfileSection />
      <ThemeSection />
      <AccessibilitySettingsSection />
      <AboutSection />
    </div>
  );
}

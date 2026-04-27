"use client";

import { useState, useEffect } from "react";
import { DEFAULT_SETTINGS, SETTINGS_KEY, hexToRgba } from "../lib/settings";
import type { HomepageSettings } from "../lib/settings";
import AdminClient from "./admin-client";
import CompatibilityClient from "./compatibility-client";
import SettingsClient, { MediaSettingsClient } from "../settings/settings-client";

type Tab = "admin" | "compatibility" | "settings" | "media";

export default function AdminTabsClient() {
  const [activeTab, setActiveTab] = useState<Tab>("admin");
  const [settings, setSettings] = useState<HomepageSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }));
    } catch { /* ignore */ }
  }, []);

  const borderSubtle = hexToRgba(settings.panelBorderColor, 35);

  const tabs: { key: Tab; label: string }[] = [
    { key: "admin", label: "Produkty" },
    { key: "compatibility", label: "Zgodności" },
    { key: "settings", label: "Ustawienia wyglądu stron" },
    { key: "media", label: "Ustawienia mediów na stronach" },
  ];

  return (
    <>
      {/* Tabs navigation */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          borderBottom: `1px solid ${borderSubtle}`,
          marginBottom: 24,
        }}
      >
        {tabs.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as Tab)}
              style={{
                flex: 1,
                padding: "10px 16px",
                background: "transparent",
                border: "none",
                borderBottom: active
                  ? `2px solid ${settings.panelSubtitleColor}`
                  : "2px solid transparent",
                color: active ? settings.panelSubtitleColor : settings.panelTextColor,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: active ? 700 : 400,
                letterSpacing: 0.5,
                transition: "all 0.15s",
                marginBottom: -1,
                textAlign: "center",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "admin" && <AdminClient />}
      {activeTab === "compatibility" && <CompatibilityClient />}
      {activeTab === "settings" && <SettingsClient />}
      {activeTab === "media" && <MediaSettingsClient />}
    </>
  );
}

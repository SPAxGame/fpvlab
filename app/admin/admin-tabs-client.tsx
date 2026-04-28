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
    { key: "settings", label: "Motywy" },
    { key: "media", label: "Media" },
  ];

  return (
    <>
      {/* Tabs navigation */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          marginBottom: 24,
          borderRadius: 16,
          border: `1px solid ${borderSubtle}`,
          backgroundColor: hexToRgba(settings.panelBgColor, parseInt(settings.panelOpacity)),
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          padding: "4px 0 0",
          gap: 0,
        }}
      >
        {tabs.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as Tab)}
              style={{
                flex: "0 0 auto",
                padding: "10px 24px",
                background: "transparent",
                border: "none",
                borderBottom: active
                  ? `2px solid ${settings.panelSubtitleColor}`
                  : `1px solid transparent`,
                color: active ? settings.panelSubtitleColor : settings.panelTextColor,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: active ? 700 : 400,
                letterSpacing: 0.5,
                transition: "all 0.15s",
                marginBottom: 8,
                marginLeft: 8,
                marginRight: 8,
                textAlign: "center",
                whiteSpace: "nowrap",
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

"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS, SETTINGS_KEY, hexToRgba } from "../lib/settings";
import type { HomepageSettings } from "../lib/settings";

export default function SubpageShell({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<HomepageSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) setSettings(JSON.parse(raw));
    } catch {}
  }, []);

  const bgUrl = settings.bgDataUrl || settings.bgImagePath || "/images/background_mario.jpg";

  const bgStyle = settings.bgApplyToSubpages
    ? {
        backgroundImage: `url('${bgUrl}')`,
        backgroundSize: "cover" as const,
        backgroundPosition: "center" as const,
      }
    : {} as React.CSSProperties;

  const panelBgRgba = hexToRgba(settings.panelBgColor, parseInt(settings.panelOpacity));
  const cardBgRgba = hexToRgba(settings.sliderBgColor, parseInt(settings.panelOpacity));

  return (
    <div
      style={
        {
          "--sub-bg": panelBgRgba,
          "--sub-card-bg": cardBgRgba,
          "--sub-title": settings.subpageTitleColor,
          "--sub-subtitle": settings.panelSubtitleColor,
          "--sub-text": settings.panelTextColor,
          "--sub-border": settings.panelBorderColor,
          "--sub-border-subtle": hexToRgba(settings.panelBorderColor, 40),
          "--sub-accent-subtle": hexToRgba(settings.panelSubtitleColor, 25),
          minHeight: "100vh",
          backgroundColor: settings.panelBgApplyToSubpages ? panelBgRgba : undefined,
          color: "var(--sub-text)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        } as React.CSSProperties
      }
    >
      {/* Fixed background layer — works on all mobile browsers */}
      {settings.bgApplyToSubpages && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100lvh",
          zIndex: -1,
          ...bgStyle,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }} />
      )}
      {children}
    </div>
  );
}

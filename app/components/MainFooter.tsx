"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS, SETTINGS_KEY, hexToRgba } from "../lib/settings";
import type { HomepageSettings } from "../lib/settings";

export default function MainFooter() {
  const [settings, setSettings] = useState<HomepageSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }));
    } catch {
      /* ignore */
    }
  }, []);

  const panelBgRgba = hexToRgba(settings.panelBgColor, Number(settings.panelOpacity));

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <footer
        className="rounded-2xl flex flex-wrap items-center justify-center text-center"
        style={{
          border: `1px solid ${hexToRgba(settings.panelBorderColor, 30)}`,
          backgroundColor: panelBgRgba,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          padding: "12px 20px",
          minHeight: 50,
          fontSize: 11,
          letterSpacing: 2,
          color: settings.panelBorderColor,
        }}
      >
        <span>© 2026 KONFIGURATOR DRONA FPV - WSZELKIE PRAWA ZASTRZEŻONE</span>
      </footer>
    </div>
  );
}

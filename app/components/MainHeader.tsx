"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  hexToRgba,
} from "../lib/settings";
import type { HomepageSettings } from "../lib/settings";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Drony FPV", href: "/drony-fpv" },
  { label: "Konfigurator", href: "/konfigurator-online" },
  { label: "Drukuj 3D", href: "/drukuj-3d" },
  { label: "O FPV LAB", href: "/o-mnie" },
  { label: "Warsztaty", href: "/warsztaty" },
  { label: "Kontakt", href: "/kontakt" },
 // { label: "Admin", href: "/admin", target: "_blank" },
];

export default function MainHeader() {
  const [settings, setSettings] = useState<HomepageSettings>(DEFAULT_SETTINGS);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();


  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }));
    } catch {
      /* ignore */
    }
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const headerBg = hexToRgba(
    settings.panelBgColor,
    parseInt(settings.panelOpacity)
  );
  const borderFaint = hexToRgba(settings.panelBorderColor, 30);
  const borderActive = hexToRgba(settings.panelBorderColor, 80);

  return (
    <div style={{ padding: "16px 16px 0", position: "sticky", top: 0, zIndex: 100 }}>
      <header
        className="rounded-2xl"
        style={{
          backgroundColor: headerBg,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${borderFaint}`,
        }}
      >
        {/* Main header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: "12px 20px",
            minHeight: 66,
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0, textDecoration: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/fpv_lab_logo.png"
              alt="Logo"
              style={{
                height: 56,
                width: "auto",
                objectFit: "contain",
                borderRadius: 4,
              }}
            />
          </Link>

          {/* Desktop Nav — hidden below md */}
          <nav className="hidden md:flex" style={{ gap: 6, alignItems: "flex-start", flexWrap: "wrap", flex: 1, justifyContent: "flex-end" }}>
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              const isHovered = hovered === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  {...(link.target ? { target: link.target, rel: "noopener noreferrer" } : {})}
                  style={{
                    backgroundColor: settings.sliderBgColor,
                    color:
                      isActive || isHovered
                        ? settings.panelSubtitleColor
                        : settings.panelTitleColor,
                    border: `1px solid ${isActive ? borderActive : borderFaint}`,
                    borderRadius: 6,
                    padding: "7px 18px",
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: "0.06em",
                    textDecoration: "none",
                    transition: "color 0.15s, border-color 0.15s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={() => setHovered(link.href)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Hamburger button — visible below md only */}
          <button
            className="md:hidden flex flex-col"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Zamknij menu" : "Otwórz menu"}
            aria-expanded={mobileOpen}
            style={{
              background: settings.sliderBgColor,
              border: `1px solid ${borderFaint}`,
              borderRadius: 8,
              padding: "9px 10px",
              cursor: "pointer",
              gap: 5,
              width: 42,
              flexShrink: 0,
            }}
          >
            <span style={{
              display: "block",
              width: 20,
              height: 2,
              backgroundColor: settings.panelTitleColor,
              borderRadius: 2,
              transform: mobileOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
              transition: "transform 0.2s",
            }} />
            <span style={{
              display: "block",
              width: 20,
              height: 2,
              backgroundColor: settings.panelTitleColor,
              borderRadius: 2,
              opacity: mobileOpen ? 0 : 1,
              transition: "opacity 0.2s",
            }} />
            <span style={{
              display: "block",
              width: 20,
              height: 2,
              backgroundColor: settings.panelTitleColor,
              borderRadius: 2,
              transform: mobileOpen ? "rotate(-45deg) translate(5px, -5px)" : "none",
              transition: "transform 0.2s",
            }} />
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileOpen && (
          <nav
            style={{
              borderTop: `1px solid ${borderFaint}`,
              padding: "12px 14px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  {...(link.target ? { target: link.target, rel: "noopener noreferrer" } : {})}
                  style={{
                    backgroundColor: settings.sliderBgColor,
                    color: isActive ? settings.panelSubtitleColor : settings.panelTitleColor,
                    border: `1px solid ${isActive ? borderActive : borderFaint}`,
                    borderRadius: 8,
                    padding: "13px 16px",
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: "0.06em",
                    textDecoration: "none",
                    display: "block",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>
    </div>
  );
}

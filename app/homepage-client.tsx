"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  hexToRgba,
} from "./lib/settings";
import type { HomepageSettings } from "./lib/settings";
import MainHeader from "./components/MainHeader";
import MainFooter from "./components/MainFooter";
import { getEmail } from "./lib/email";

const CROSSFADE_INTERVAL = 3000;
const CROSSFADE_DURATION = 1200;

export default function HomepageClient({
  sliderImages,
  panel1Images = [],
}: {
  sliderImages: string[];
  panel1Images?: string[];
}) {
  const [settings, setSettings] =
    useState<HomepageSettings>(DEFAULT_SETTINGS);
  const [activePanel1, setActivePanel1] = useState(0);
  const [sliderCaptions, setSliderCaptions] = useState<Record<string, string>>({});
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetch("/api/media/captions?folder=slider")
      .then((r) => r.json())
      .then((data: { captions?: Record<string, string> }) => setSliderCaptions(data.captions ?? {}))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (panel1Images.length < 2) return;
    const id = setInterval(
      () => setActivePanel1((prev) => (prev + 1) % panel1Images.length),
      CROSSFADE_INTERVAL
    );
    return () => clearInterval(id);
  }, [panel1Images.length]);

  // responsive: show fewer images at once on mobile to avoid squeezing
  // (now handled via CSS .slider-item, no JS state needed)

  const panelBgRgba = hexToRgba(
    settings.panelBgColor,
    parseInt(settings.panelOpacity)
  );
  const borderSubtle = hexToRgba(settings.panelBorderColor, 30);

  const panelStyle: CSSProperties = {
    border: `1px solid ${borderSubtle}`,
    backgroundColor: panelBgRgba,
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  };

  const n = sliderImages.length;
  const durationSeconds = Math.max(n * 2, 10);

  const bgStyle: CSSProperties = settings.bgDataUrl
    ? { backgroundImage: `url('${settings.bgDataUrl}')` }
    : settings.bgImagePath
    ? { backgroundImage: `url('${settings.bgImagePath}')` }
    : { backgroundImage: "url('/images/background_mario.jpg')" };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ position: "relative" }}
    >
      {/* Fixed background layer — works on all mobile browsers */}
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
      <MainHeader />
      <main className="flex-1 flex flex-col gap-4 p-4">
        {/* ── Panel 1: Konfigurator ── */}
        <div className="rounded-2xl panel1-konfigurator" style={panelStyle}>
          <h1
            className="text-2xl font-bold tracking-wide mb-1 uppercase text-center"
            style={{ color: settings.panelTitleColor }}
          >
            Konfigurator drona FPV
          </h1>
          <p
            className="text-base tracking-wide mb-6 font-medium text-center"
            style={{ color: settings.panelSubtitleColor }}
          >
            zbuduj własnego drona FPV online w kilka minut
          </p>
          <div style={{ overflow: "hidden" }}>
            {/* Crossfade slideshow – float right */}
            <div
              style={{
                float: "right",
                width: "40%",
                maxWidth: 300,
                minWidth: 140,
                aspectRatio: "9/7",
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                marginLeft: 20,
                marginBottom: 12,
                lineHeight: 0,
              }}
            >
              {panel1Images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt=""
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "top",
                    opacity: i === activePanel1 ? 1 : 0,
                    transition: `opacity ${CROSSFADE_DURATION}ms ease-in-out`,
                  }}
                />
              ))}
            </div>
            <ul style={{ color: settings.panelTextColor, fontSize: 15, lineHeight: 1.6, listStyle: "none", padding: 0, margin: 0 }}>
              {[
                "Skonfiguruj swojego drona FPV według własnych potrzeb i preferencji.",
                "Nieograniczone możliwości. Wybieraj z najlepszych przetestowanych podzespołów.",
                "Porównuj buildy między sobą, by wybrać najlepszy dla siebie.",
                "Wycena od ręki, bez konieczności logowania.",
                "Zapisz w pdf, wydrukuj lub wyślij do nas swoją konfigurację do konsultacji.",
                "Możesz zamówić gotowy zestaw do montażu, lub zlecić montaż nam.",
                "Prosty proces, od pomysłu do lotu w parę chwil.",
              ].map((item) => (
                <li key={item} style={{ marginBottom: 10, display: "flex", alignItems: "flex-start" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/propeller_ico.png" alt="" style={{ width: 16, height: 16, flexShrink: 0, marginRight: 8, marginTop: 3, objectFit: "contain" }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Panel 2: Slider ── */}
        <div className="rounded-2xl px-5 pb-5 pt-2.5" style={panelStyle}>
          <h2
            className="text-2xl font-bold tracking-wide mb-1 uppercase text-center"
            style={{ color: settings.panelTitleColor }}
          >
            Dobór elementów
          </h2>
          <p
            className="text-base tracking-wide mb-4 font-medium text-center"
            style={{ color: settings.panelSubtitleColor }}
          >
            dobierz elementy na miarę potrzeb ze sprawdzonego asortymentu
          </p>
          <div
            className="overflow-hidden rounded-xl"
          >
            {n > 0 && (
              <div
                className="slider-strip"
                style={{
                  animation: `slideRTL ${durationSeconds}s linear infinite`,
                }}
              >
                {[...sliderImages, ...sliderImages].map((src, i) => {
                  const filename = src.split("/").pop() ?? "";
                  const custom = sliderCaptions[filename];
                  const label = (custom !== undefined && custom !== "")
                    ? custom
                    : (filename
                        .replace(/\.[^.]+$/, "")
                        .replace(/^\d+_/, "")
                        .replace(/^slider_/i, "")
                        .replace(/[_-]+/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())
                        .trim() || `Zdjęcie ${(i % n) + 1}`);
                  return (
                    <div
                      key={i}
                      className="slider-item"
                    >
                      <div style={{
                        width: "100%",
                        aspectRatio: "1/1",
                        borderRadius: "10px",
                        border: `1px solid ${hexToRgba(settings.sliderBorderColor, 30)}`,
                        backgroundColor: settings.sliderBgColor,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <img
                          src={src}
                          alt={`Slide ${(i % n) + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "top",
                            display: "block",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          textAlign: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: settings.panelTitleColor,
                          background: "none",
                          borderRadius: 6,
                          padding: "6px 2px 0 2px",
                          minHeight: 32,
                          lineHeight: 1.2,
                          wordBreak: "break-word",
                        }}
                      >
                        {label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Panel 3: Zalety konfiguratora ── */}
        <div className="rounded-2xl px-7 pb-7 pt-3.5" style={panelStyle}>
          <h2
            className="text-2xl font-bold tracking-wide uppercase mb-6 text-center"
            style={{ color: settings.panelTitleColor }}
          >
            Zalety konfiguratora
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              "Intuicyjna obsługa- szybki proces bez zbędnych kroków.",
              "Gwarancja kompatybilności- system blokujący wybór niepasujących części",
              "Inteligentny dobór komponentów- wsparcie w wyborze podzespołów",
              "Optymalizacja kosztów- pełna kontrola nad budżetem",
              "Wycena w czasie rzeczywistym- kosztorys widoczny przy każdej zmianie",
              "Łatwość modyfikacji- błyskawiczna podmiana elementów w projekcie",
            ].map((word) => (
              <div
                key={word}
                className="py-3 rounded-xl font-semibold text-sm tracking-wide"
                style={{
                  backgroundColor: settings.sliderBgColor,
                  color: settings.panelTextColor,
                  border: `1px solid ${borderSubtle}`,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "12px 14px",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/propeller_ico.png" alt="" style={{ width: 15, height: 15, minWidth: 15, marginTop: 1, objectFit: "contain" }} />
                {word}
              </div>
            ))}
          </div>
        </div>

        {/* ── Panel 4: Informacje ── */}
        <div className="rounded-2xl px-7 pb-7 pt-3.5" style={panelStyle}>
          <h2
            className="text-2xl font-bold tracking-wide uppercase mb-5 text-center"
            style={{ color: settings.panelTitleColor }}
          >
            Informacje
          </h2>
          <div className="flex flex-col gap-3 text-sm">
            {[
              ["Wsparcie techniczne", getEmail()],
              ["Wersja aplikacji", "2.5.1"],
              ["Typ licencji użytkownika", "Professional"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between items-center pb-2"
                style={{ borderBottom: `1px solid ${borderSubtle}` }}
              >
                <span style={{ color: settings.infoTextColor, display: "flex", alignItems: "center", gap: 8 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/propeller_ico.png" alt="" style={{ width: 14, height: 14, minWidth: 14, objectFit: "contain" }} />
                  {label}
                </span>
                <span
                  className="font-semibold"
                  style={{ color: settings.panelSubtitleColor }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <MainFooter />
    </div>
  );
}

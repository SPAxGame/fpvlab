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

  const panelBgRgba = hexToRgba(
    settings.panelBgColor,
    parseInt(settings.panelOpacity)
  );
  const borderSubtle = hexToRgba(settings.panelBorderColor, 30);

  const panelStyle: CSSProperties = {
    border: `2px solid ${settings.panelBorderColor}`,
    backgroundColor: panelBgRgba,
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  };

  const n = sliderImages.length;
  // Strip holds 2 copies; each image = 1/7 of visible container
  // Strip width = (2n/7)*100% of container so that each image = 100%/container/7
  const stripWidthPercent = n > 0 ? (2 * n / 7) * 100 : 200;
  const durationSeconds = Math.max(n * 2, 10);

  const bgStyle: CSSProperties = settings.bgDataUrl
    ? { backgroundImage: `url('${settings.bgDataUrl}')` }
    : { backgroundImage: "url('/images/background_mono.jpg')" };

  return (
    <div
      className="min-h-screen flex flex-col bg-parallax"
      style={{
        ...bgStyle,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <MainHeader />
      <main className="flex-1 flex flex-col gap-4 p-4">
        {/* ── Panel 1: Konfigurator ── */}
        <div className="rounded-2xl px-7 pb-7 pt-3.5" style={panelStyle}>
          <h1
            className="text-2xl font-bold tracking-wide mb-1 uppercase text-center"
            style={{ color: settings.panelTitleColor }}
          >
            Konfigurator drona FPV
          </h1>
          <p
            className="text-sm tracking-wide mb-6 font-medium text-center"
            style={{ color: settings.panelSubtitleColor }}
          >
            zbuduj własnego drona FPV online w kilka minut
          </p>
          {/* Responsive layout: image on top on mobile, right on sm+ */}
          <div className="flex flex-col sm:flex-row-reverse sm:items-start gap-5">
            {/* Crossfade slideshow */}
            <div
              className="w-full sm:w-[280px] sm:flex-shrink-0 mx-auto sm:mx-0"
              style={{
                maxWidth: 280,
                aspectRatio: "4/3",
                borderRadius: 12,
                border: `0px solid ${settings.panelBorderColor}`,
                overflow: "hidden",
                position: "relative",
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
                    opacity: i === activePanel1 ? 1 : 0,
                    transition: `opacity ${CROSSFADE_DURATION}ms ease-in-out`,
                  }}
                />
              ))}
            </div>
            <ul
              className="flex-1 space-y-2 leading-relaxed list-none"
              style={{ color: settings.panelTextColor, fontSize: 15 }}
            >
              {[
                "Skonfiguruj swojego drona FPV według własnych potrzeb i preferencji.",
                "Nieograniczone możliwości. Wybieraj z najlepszych podzespołów.",
                "Porównuj buildy między sobą.",
                "Wycena od ręki, bez konieczności logowania.",
                "Zapisz i wyślij do nas Twoją konfigurację.",
                "Prosty proces, od pomysłu do lotu w parę chwil.",
              ].map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/propeller_ico.png" alt="" style={{ width: 18, height: 18, minWidth: 18, marginTop: 1, objectFit: "contain" }} />
                  {item}
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
            className="text-sm tracking-wide mb-4 font-medium text-center"
            style={{ color: settings.panelSubtitleColor }}
          >
            dobierz elementy na miarę potrzeb ze sprawdzonego asortymentu
          </p>
          <div
            className="overflow-hidden rounded-xl"
          >
            {n > 0 && (
              <div
                style={{
                  display: "flex",
                  width: `${stripWidthPercent}%`,
                  animation: `slideRTL ${durationSeconds}s linear infinite`,
                }}
              >
                {[...sliderImages, ...sliderImages].map((src, i) => (
                  <div
                    key={i}
                    style={{
                      width: `${100 / (2 * n)}%`,
                      flexShrink: 0,
                      padding: "4px",
                      position: "relative",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Slide ${(i % n) + 1}`}
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        border: `2px solid ${settings.sliderBorderColor}`,
                        display: "block",
                        backgroundColor: settings.sliderBgColor,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 10,
                        left: 8,
                        right: 8,
                        textAlign: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#fff",
                        backgroundColor: "rgba(0,0,0,0.45)",
                        borderRadius: 6,
                        padding: "3px 6px",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      {(() => {
                        const filename = src.split("/").pop() ?? "";
                        const custom = sliderCaptions[filename];
                        if (custom !== undefined && custom !== "") return custom;
                        // derive readable label from filename: strip ext, numbers, "slider_"
                        return filename
                          .replace(/\.[^.]+$/, "")
                          .replace(/^\d+_/, "")
                          .replace(/^slider_/i, "")
                          .replace(/[_-]+/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())
                          .trim() || `Zdjęcie ${(i % n) + 1}`;
                      })()}
                    </div>
                  </div>
                ))}
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
              "Intuicyjna obsługa – szybki proces bez zbędnych kroków.",
              "Gwarancja kompatybilności – system blokujący wybór niepasujących części",
              "Inteligentny dobór komponentów – wsparcie w wyborze podzespołów",
              "Optymalizacja kosztów – pełna kontrola nad budżetem",
              "Wycena w czasie rzeczywistym – kosztorys widoczny przy każdej zmianie",
              "Łatwość modyfikacji – błyskawiczna podmiana elementów w projekcie",
            ].map((word) => (
              <div
                key={word}
                className="text-center py-3 rounded-xl font-semibold text-sm tracking-wide"
                style={{
                  backgroundColor: settings.sliderBgColor,
                  color: settings.panelTextColor,
                  border: `1px solid ${borderSubtle}`,
                }}
              >
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
              ["Wsparcie techniczne", "support@fpvlab.pl"],
              ["Wersja aplikacji", "2.5.1"],
              ["Typ licencji użytkownika", "Professional"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between items-center pb-2"
                style={{ borderBottom: `1px solid ${borderSubtle}` }}
              >
                <span style={{ color: settings.infoTextColor }}>{label}</span>
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

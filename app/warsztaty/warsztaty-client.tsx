"use client";

import { useRef, useState, useEffect } from "react";
import MainHeader from "../components/MainHeader";
import MainFooter from "../components/MainFooter";
import SubpageShell from "../components/SubpageShell";

const TIPS = [
  "Zacznij od gotowego zestawu - zmniejszysz liczbę zmiennych i łatwiej zdiagnozujesz problemy.",
  "Zawsze sprawdzaj kierunek obrotów silników przed pierwszym lotem.",
  "Skalibruj akcelerometr na równej, stabilnej powierzchni.",
  "Ustaw limity throttle w kontrolerze lotu, aby uniknąć gwałtownych odlotów.",
  "Lataj najpierw w trybie Angle (stabilizowany) - dopiero potem próbuj Acro.",
  "Regularnie sprawdzaj dokręcenie śmigieł - wibracje potrafią je odkręcić.",
  "Używaj modułu OSD, by monitorować napięcie baterii w locie.",
  "Wykonaj blackbox log już w pierwszych lotach - dane pomogą w tune'owaniu PID.",
  "Poznaj zasady przestrzeni powietrznej obowiązujące w Twoim regionie.",
  "Dołącz do lokalnej grupy pilotów FPV - wspólne latanie przyspiesza naukę.",
];

const REASONS = [
  "FPV daje poczucie lotu niedostępne w żadnym innym sporcie - adrenalina gwarantowana.",
  "Budujesz i programujesz własny sprzęt - rozwijasz umiejętności techniczne i elektroniczne.",
  "Społeczność FPV jest otwarta i chętna do pomocy niezależnie od poziomu.",
  "Możliwości twórcze są nieograniczone - od wyścigów po filmowanie przyrody.",
  "Każdy lot to nowe wyzwanie, nowy trick, nowy kadr - nuda jest niemożliwa.",
];

function labelFromFilename(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function VideoCard({ label, src }: { label: string; src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid var(--sub-border-subtle)",
        backgroundColor: "var(--sub-card-bg)",
        aspectRatio: "16/9",
        cursor: "pointer",
      }}
      onMouseEnter={() => { videoRef.current?.play(); setPlaying(true); }}
      onMouseLeave={() => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
        setProgress(0);
        setPlaying(false);
      }}
    >
      <video
        ref={videoRef}
        muted
        playsInline
        src={src}
        onTimeUpdate={() => {
          const v = videoRef.current;
          if (v && v.duration) setProgress(v.currentTime / v.duration);
        }}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      {/* Label – center of frame */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          transform: "translateY(-50%)",
          padding: "6px 12px",
          backgroundColor: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.08em",
          color: "rgba(255,255,255,0.9)",
          textTransform: "uppercase",
          textAlign: "center",
          opacity: playing ? 0 : 1,
          transition: "opacity 0.2s",
        }}
      >
        {label}
      </div>
      {/* Progress bar – bottom edge */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: "rgba(255,255,255,0.15)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            backgroundColor: playing ? "rgba(255,255,255,0.85)" : "transparent",
            transition: "width 0.25s linear",
          }}
        />
      </div>
    </div>
  );
}

export default function WarsztatyClient({ videos, captions = {} }: { videos: string[]; captions?: Record<string, string> }) {
  const [columns, setColumns] = useState(1);
  useEffect(() => {
    const update = () => setColumns(window.innerWidth >= 900 ? 2 : 1);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <SubpageShell>
      <MainHeader />
      <main
        style={{
          flex: 1,
          maxWidth: 1100,
          width: "100%",
          margin: "0 auto",
          padding: "52px 24px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "var(--sub-title)",
              letterSpacing: 3,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Warsztaty FPV
          </h1>
          <p
            style={{
              color: "var(--sub-subtitle)",
              fontSize: 15,
              letterSpacing: 1,
              marginBottom: 12,
              fontWeight: 500,
            }}
          >
            Wiedza. Praktyka. Pasja.
          </p>
        </div>
        {/* ── Panel 1: Praktyczne porady ── */}
        <div
          className="subpage-card"
          style={{
            backgroundColor: "var(--sub-card-bg)",
            border: "1px solid var(--sub-border-subtle)",
            borderRadius: 12,
            padding: "22px 24px",
          }}
        >
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--sub-title)",
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Praktyczne porady
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "var(--sub-subtitle)",
              letterSpacing: 1,
              marginBottom: 20,
              fontWeight: 500,
            }}
          >
            dla początkujących
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {TIPS.map((tip) => (
              <li key={tip} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, lineHeight: 1.65, color: "var(--sub-text)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/propeller_ico.png" alt="" style={{ width: 16, height: 16, minWidth: 16, marginTop: 2, objectFit: "contain" }} />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Panel 2: Dlaczego FPV? ── */}
        <div
          className="subpage-card"
          style={{
            backgroundColor: "var(--sub-card-bg)",
            border: "1px solid var(--sub-border-subtle)",
            borderRadius: 12,
            padding: "22px 24px",
          }}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--sub-title)",
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Dlaczego FPV?
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "var(--sub-subtitle)",
              letterSpacing: 1,
              marginBottom: 20,
              fontWeight: 500,
            }}
          >
            to wciąga
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {REASONS.map((reason) => (
              <li key={reason} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, lineHeight: 1.65, color: "var(--sub-text)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/propeller_ico.png" alt="" style={{ width: 16, height: 16, minWidth: 16, marginTop: 2, objectFit: "contain" }} />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Panel 3: Tak to się kręci! ── */}
        {videos.length > 0 && (
          <div
            className="subpage-card"
            style={{
              backgroundColor: "var(--sub-card-bg)",
              border: "1px solid var(--sub-border-subtle)",
              borderRadius: 12,
              padding: "22px 24px",
            }}
          >
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--sub-title)",
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Tak to się kręci!
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "var(--sub-subtitle)",
                letterSpacing: 1,
                marginBottom: 20,
                fontWeight: 500,
              }}
            >
              kilka przykładowych ujęć
            </p>
            <div
              style={{
                display: "grid",
                // FIX APPLIED HERE: Use the state variable `columns` instead of `window.innerWidth`
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: 16,
              }}
            >
              {videos.map((filename) => (
                <VideoCard
                  key={filename}
                  label={captions[filename] || labelFromFilename(filename)}
                  src={`/videos/${filename}`}
                />
              ))}
            </div>
          </div>
        )}
      </main>
      <MainFooter />
    </SubpageShell>
  );
}
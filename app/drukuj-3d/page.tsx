import type { Metadata } from "next";
import MainHeader from "../components/MainHeader";
import MainFooter from "../components/MainFooter";
import SubpageShell from "../components/SubpageShell";
import StlPanelClient from "./stl-panel-client";
import { getMailtoHref } from "../lib/email";

export const metadata: Metadata = {
  title: "Drukuj 3D",
  description:
    "Zamów wydruki 3D na drukarce Prusa MK4S+ lub pobierz gotowe pliki STL elementów do dronów FPV.",
};

interface StlFile {
  name: string;
  description: string;
  filename: string;
}

interface StlCategory {
  id: string;
  label: string;
  description: string;
  folder: string;
  files: StlFile[];
}

const STL_CATEGORIES: StlCategory[] = [
  {
    id: "mario5",
    label: "Mario5 – pliki fabryczne",
    description: "Oryginalne elementy TPU do ramy Mario5. Gotowe do druku bez modyfikacji.",
    folder: "Mario5-pliki-fabryczne",
    files: [
      { name: "Uchwyt kamery FPV", description: "Mount kamery FPV dedykowany do ramy Mario5.", filename: "MARIO5-TPU-CAM.stl" },
      { name: "Slot kondensatora", description: "Kieszeń na kondensator zabezpieczający ESC.", filename: "MARIO5-TPU-capacitor slot.stl" },
      { name: "Osłona CNC (DEF)", description: "Standardowa osłona dolna na elementy CNC.", filename: "MARIO5-TPU-CNC DEF.stl" },
      { name: "Uchwyt GoPro", description: "Tilt-mount pod kamerę GoPro / akcję.", filename: "MARIO5-TPU-Gopro.stl" },
      { name: "Uchwyt GPS + O3 v2", description: "Wieżyczka GPS z integracją modułu DJI O3.", filename: "MARIO5-TPU-GPS_O3_2.stl" },
      { name: "Osłona silnika (DEF)", description: "Standardowy kapturek ochronny na silnik.", filename: "MARIO5-TPU-Motor DEF.stl" },
      { name: "Uchwyt odbiornika DC", description: "Mount odbiornika RC ze złączem DC.", filename: "MARIO5-TPU-RX-DC.stl" },
      { name: "Uchwyt odbiornika XH", description: "Mount odbiornika RC ze złączem XH.", filename: "MARIO5-TPU-RX-XH.stl" },
      { name: "Uchwyt TBS (przód)", description: "Przedni mount transmitera TBS.", filename: "MARIO5-TPU-TBS-F.stl" },
      { name: "Uchwyt XT60 + DJI", description: "Adapter złącza XT60 z gniazdem antenowym DJI.", filename: "MARIO5-TPU-XT60_DJI.stl" },
      { name: "Uchwyt XT60 + DJI v2", description: "Drugi wariant adaptera XT60 / DJI.", filename: "MARIO5-TPU-XT60_DJI_2.stl" },
      { name: "Uchwyt XT60 + SMA", description: "Adapter złącza XT60 z gniazdem antenowym SMA.", filename: "MARIO5-TPU-XT60_SMA.stl" },
    ],
  },
];

const MATERIALS = [
  { name: "PLA+", color: "#4caf50", desc: "Lekki, łatwy w druku, do prototypów i części statycznych." },
  { name: "PETG", color: "#2196f3", desc: "Wytrzymały, odporny na ciepło i wilgoć. Dobry na kadłuby i uchwyty." },
  { name: "ASA", color: "#ff9800", desc: "Odporny na UV i temperaturę. Idealny do użytku zewnętrznego." },
  { name: "ABS", color: "#9c27b0", desc: "Wytrzymały i lekki. Klasyka w druku elementów lotniczych." },
  { name: "TPU 95A", color: "#f44336", desc: "Elastyczny, pochłania drgania. Świetny na zderzaki i uchwyty kamer." },
  { name: "PA12 (Nylon)", color: "#607d8b", desc: "Najwytrzymalszy. Pod duże naprężenia mechaniczne i wysoką temperaturę." },
];

export default function Drukuj3DPage() {
  return (
    <SubpageShell>
      <MainHeader />
      <main
        style={{
          flex: 1,
          maxWidth: 1100,
          width: "100%",
          margin: "0 auto",
          padding: "52px 24px",
        }}
      >
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
          Drukuj 3D
        </h1>
        <p
          style={{
            color: "var(--sub-subtitle)",
            fontSize: 15,
            letterSpacing: 1,
            marginBottom: 40,
            fontWeight: 500,
          }}
        >
          Precyzja warstwy 0,1 mm. Każdy materiał. Dostawa pod drzwi.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

          {/* Panel 1 – zamówienia druku */}
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
              Zamów wydruk 3D online
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
              drukujemy najczęściej na Prusa MK4S+
            </p>

            {/* Tekst pełna szerokość */}
            <div style={{ marginBottom: 20 }}>

              <p style={{ fontSize: 14, lineHeight: 2, color: "var(--sub-text)", margin: "0 0 16px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/propeller_ico.png" alt="" style={{ width: 16, height: 16, minWidth: 16, marginTop: 6, objectFit: "contain" }} />
                <span>Do dyspozycji drukarka{" "}
                <strong style={{ color: "var(--sub-subtitle)" }}>Prusa MK4S+</strong> -
                jedna z najdokładniejszych i najbardziej niezawodnych maszyn FDM na rynku.
                Możesz przesłać własny plik <strong>.STL</strong>, <strong>.STEP</strong> lub
                {" "}<strong>.3MF</strong>, wybrać materiał i kolor, a gotowy element dotrze
                do Ciebie kurierem.</span>
              </p>

              <p style={{ fontSize: 14, lineHeight: 2, color: "var(--sub-text)", margin: "0 0 20px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/propeller_ico.png" alt="" style={{ width: 16, height: 16, minWidth: 16, marginTop: 6, objectFit: "contain" }} />
                <span>Przyjmujemy zamówienia jednostkowe i seryjne - od jednej sztuki po kilkudziesięcioelementowe
                serie. Specjalizujemy się w częściach do dronów FPV: uchwyty anten,
                mocowania kamer, stopki ramy, osłony stacków i wszystko, co możesz
                sobie wyobrazić.</span>
              </p>

              {/* Zdjęcia stanowiska – 3 kolumny */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                }}
              >
                {["stanowisko_prusa_1", "stanowisko_prusa_2", "stanowisko_prusa_3"].map((name) => (
                  <div
                    key={name}
                    style={{
                      borderRadius: 10,
                      border: "1px solid rgba(114,122,136,0.30)",
                      backgroundColor: "#23272F",
                      overflow: "hidden",
                      aspectRatio: "4/3",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/images/${name}.png`}
                      alt={`Stanowisko Prusa MK4S+ – ${name.slice(-1)}`}
                      style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>

            </div>

            {/* Dostępne materiały */}
            <h3
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--sub-subtitle)",
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              Dostępne materiały
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 12,
                marginBottom: 28,
              }}
            >
              {MATERIALS.map((m) => (
                <div
                  key={m.name}
                  style={{
                    border: `1px solid var(--sub-border-subtle)`,
                    borderLeft: `4px solid ${m.color}`,
                    borderRadius: 8,
                    padding: "12px 14px",
                    backgroundColor: "var(--sub-bg, transparent)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: m.color,
                      marginBottom: 4,
                    }}
                  >
                    {m.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--sub-text)", lineHeight: 1.6 }}>
                    {m.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                alignItems: "center",
              }}
            >
              <a
                href={getMailtoHref("Zamówienie wydruku 3D z www.fpvlab.pl")}
                style={{
                  display: "inline-block",
                  padding: "12px 28px",
                  backgroundColor: "#9D2FC1",
                  color: "#fff",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  letterSpacing: 0.5,
                }}
              >
                📧 Wyślij plik i zamów
              </a>
              <span style={{ fontSize: 13, color: "var(--sub-border)" }}>
                lub napisz przez stronę{" "}
                <a
                  href="/kontakt"
                  style={{ color: "var(--sub-subtitle)", fontWeight: 600, textDecoration: "none" }}
                >
                  Kontakt
                </a>
              </span>
            </div>
          </div>

          {/* Panel 2 – pliki STL do pobrania */}
          <StlPanelClient categories={STL_CATEGORIES} />

        </div>
      </main>
      <MainFooter />
    </SubpageShell>
  );
}

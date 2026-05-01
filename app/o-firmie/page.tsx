import type { Metadata } from "next";
import MainHeader from "../components/MainHeader";
import MainFooter from "../components/MainFooter";
import SubpageShell from "../components/SubpageShell";

export const metadata: Metadata = {
  title: "O FPV LAB",
};

export default function OMniePage() {
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
          O FPV LAB
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
          Pasja. Precyzja. Prędkość.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            className="subpage-card"
            style={{
              backgroundColor: "var(--sub-card-bg)",
              border: "1px solid var(--sub-border-subtle)",
              borderRadius: 12,
              padding: "22px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
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
              Kim jesteśmy
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "var(--sub-subtitle)",
                letterSpacing: 1,
                marginBottom: 4,
                fontWeight: 500,
              }}
            >
              pasja do FPV zamieniona w rzemiosło
            </p>
            <p style={{ fontSize: 14, lineHeight: 2, color: "var(--sub-text)", margin: 0, display: "flex", alignItems: "flex-start", gap: 10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/propeller_ico.png" alt="" style={{ width: 16, height: 16, minWidth: 16, marginTop: 6, objectFit: "contain" }} />
              <span>CEO działu FPV LAB to pilot statków powietrznych z ponad 9-letnim doświadczeniem w 
              składaniu, programowaniu i pilotażu dronów. Zaczynał od prostych quadrocopterów,
              a dziś buduje maszyny wyczynowe dla siebie i innych entuzjastów. 
              Jego pasja do latania FPV przerodziła się w pełnowymiarowy warsztat.</span>
            </p>
            <p style={{ fontSize: 14, lineHeight: 2, color: "var(--sub-text)", margin: 0, display: "flex", alignItems: "flex-start", gap: 10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/propeller_ico.png" alt="" style={{ width: 16, height: 16, minWidth: 16, marginTop: 6, objectFit: "contain" }} />
              <span>Specjalizuje się w konfigurowaniu Betaflight, lutowaniu stacków
              i dostrajaniu PID-ów pod konkretny styl lotu. Każdy dron, który
              opuszcza jego warsztat, przechodzi pełny test bench oraz oblot
              w kontrolowanym środowisku.</span>
            </p>
            <p style={{ fontSize: 14, lineHeight: 2, color: "var(--sub-text)", margin: 0, display: "flex", alignItems: "flex-start", gap: 10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/propeller_ico.png" alt="" style={{ width: 16, height: 16, minWidth: 16, marginTop: 6, objectFit: "contain" }} />
              <span>Prowadzi szkolenia stacjonarne i online dla początkujących pilotów
              oraz doskonali techniki zaawansowanych.</span>
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 16,
              marginTop: 8,
            }}
          >
            {[
              { stat: "9+", label: "lat doświadczenia" },
              { stat: "36+", label: "złożonych dronów" },
              { stat: "40+", label: "zadowolonych pitotów" },
            ].map(({ stat, label }) => (
              <div
                key={label}
                className="subpage-card"
                style={{
                  backgroundColor: "var(--sub-card-bg)",
                  border: "1px solid var(--sub-border-subtle)",
                  borderRadius: 12,
                  padding: "20px 16px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 800,
                    color: "var(--sub-subtitle)",
                    lineHeight: 1.1,
                    marginBottom: 6,
                  }}
                >
                  {stat}
                </div>
                <div style={{ fontSize: 12, color: "var(--sub-border)", letterSpacing: 1 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <MainFooter />
    </SubpageShell>
  );
}

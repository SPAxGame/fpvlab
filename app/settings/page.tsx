import type { Metadata } from "next";
import MainHeader from "../components/MainHeader";
import MainFooter from "../components/MainFooter";
import SubpageShell from "../components/SubpageShell";
import SettingsClient from "./settings-client";

export const metadata: Metadata = {
  title: "Ustawienia serwisu",
};

export default function SettingsPage() {
  return (
    <SubpageShell>
      <MainHeader />
      <main style={{ flex: 1, padding: "32px 0 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px 12px" }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--sub-title)",
              letterSpacing: 3,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Ustawienia serwisu
          </h1>
          <p
            style={{
              color: "var(--sub-subtitle)",
              fontSize: 12,
              letterSpacing: 1,
              marginBottom: 24,
              fontWeight: 500,
            }}
          >
            Wygląd i kolory serwisu
          </p>
        </div>
        <SettingsClient />
      </main>
      <MainFooter />
    </SubpageShell>
  );
}

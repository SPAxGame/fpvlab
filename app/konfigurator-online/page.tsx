import type { Metadata } from "next";
import MainHeader from "../components/MainHeader";
import MainFooter from "../components/MainFooter";
import SubpageShell from "../components/SubpageShell";
import ConfiguratorClient from "./configurator-client";

export const metadata: Metadata = {
  title: "Konfigurator Online – zbuduj drona FPV",
};

export default function KonfiguratorOnlinePage() {
  return (
    <SubpageShell>
      <MainHeader />
      <main style={{ flex: 1, padding: "32px 0 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px 12px", textAlign: "center" }}>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--sub-title)",
              letterSpacing: 3,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Konfigurator drona FPV
          </h1>
          <p
            style={{
              color: "var(--sub-subtitle)",
              fontSize: 13,
              letterSpacing: 1,
              marginBottom: 28,
              fontWeight: 500,
            }}
          >
            Skonfiguruj drona krok po kroku i wyślij nam gotowy build
          </p>
        </div>
        <ConfiguratorClient />
      </main>
      <MainFooter />
    </SubpageShell>
  );
}

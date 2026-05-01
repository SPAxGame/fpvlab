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
      <main style={{ flex: 1, padding: "52px 0 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 12px" }}>
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
            Konfigurator drona FPV
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
            Skonfiguruj drona krok po kroku, zapisz, wydrukuj lub wyślij gotowy build
          </p>
        </div>
        <ConfiguratorClient />
      </main>
      <MainFooter />
    </SubpageShell>
  );
}

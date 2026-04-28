import type { Metadata } from "next";
import MainHeader from "../components/MainHeader";
import MainFooter from "../components/MainFooter";
import SubpageShell from "../components/SubpageShell";
import AdminTabsClient from "./admin-tabs-client";

export const metadata: Metadata = {
  title: "Panel Administracyjny – FPV Konfigurator",
};

export default function AdminPage() {
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
            Panel administracyjny
          </h1>
          <p
            style={{
              color: "#CCCCCC",
              fontSize: 13,
              letterSpacing: 1,
              marginBottom: 24,
              fontWeight: 500,
            }}
          >
            Zarządzaj asortymentem konfiguratora drona FPV, ustawieniami stron i mediami
          </p>
          <AdminTabsClient />
        </div>
      </main>
      <MainFooter />
    </SubpageShell>
  );
}

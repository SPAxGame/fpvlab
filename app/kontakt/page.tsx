import type { Metadata } from "next";
import MainHeader from "../components/MainHeader";
import MainFooter from "../components/MainFooter";
import SubpageShell from "../components/SubpageShell";
import ContactFormClient from "./ContactFormClient";

export const metadata: Metadata = {
  title: "Kontakt",
};

export default function KontaktPage() {
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
          Kontakt
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
          Formularz kontaktowy
        </p>

        <div
          className="subpage-card"
          style={{
            backgroundColor: "var(--sub-card-bg)",
            border: "1px solid var(--sub-accent-subtle)",
            borderRadius: 12,
            padding: "28px 24px",
          }}
        >
          <h2
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--sub-subtitle)",
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            Wyślij wiadomość
          </h2>
          <ContactFormClient />
        </div>
      </main>

      <MainFooter />
    </SubpageShell>
  );
}

import type { Metadata } from "next";
import MainHeader from "../components/MainHeader";
import MainFooter from "../components/MainFooter";
import SubpageShell from "../components/SubpageShell";

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
          maxWidth: 780,
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
            fontSize: 13,
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
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {["Imię", "e-mail", "Temat"].map((placeholder) => (
              <input
                key={placeholder}
                placeholder={placeholder}
                readOnly
                style={{
                  backgroundColor: "var(--sub-bg)",
                  border: "1px solid var(--sub-border-subtle)",
                  borderRadius: 6,
                  padding: "10px 14px",
                  color: "var(--sub-border)",
                  fontSize: 13,
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            ))}
            <textarea
              placeholder="Treść"
              readOnly
              rows={4}
              style={{
                backgroundColor: "var(--sub-bg)",
                border: "1px solid var(--sub-border-subtle)",
                borderRadius: 6,
                padding: "10px 14px",
                color: "var(--sub-border)",
                fontSize: 13,
                outline: "none",
                width: "100%",
                resize: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
            <div>
              <button
                style={{
                  backgroundColor: "var(--sub-subtitle)",
                  color: "var(--sub-bg)",
                  border: "none",
                  borderRadius: 7,
                  padding: "11px 28px",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  cursor: "not-allowed",
                  textTransform: "uppercase",
                }}
              >
                Wyślij (wkrótce)
              </button>
            </div>
          </div>
        </div>
      </main>

      <MainFooter />
    </SubpageShell>
  );
}

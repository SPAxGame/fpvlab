import type { Metadata } from "next";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import MainHeader from "../components/MainHeader";
import MainFooter from "../components/MainFooter";
import SubpageShell from "../components/SubpageShell";
import DronyFPVClient from "./drony-fpv-client";

export const metadata: Metadata = {
  title: "Drony FPV",
};

function getDronyImages(): string[] {
  const dir = join(process.cwd(), "public", "panel_drony_fpv");
  try {
    const all = readdirSync(dir).filter(
      (f) => !f.startsWith(".") && !f.endsWith(".keep") && f !== "_order.json" && f !== "_captions.json"
    );
    try {
      const raw = readFileSync(join(dir, "_order.json"), "utf8");
      const saved = JSON.parse(raw) as unknown;
      if (Array.isArray(saved)) {
        const ordered = (saved as string[]).filter((f) => all.includes(f));
        all.forEach((f) => { if (!ordered.includes(f)) ordered.push(f); });
        return ordered;
      }
    } catch { /* no order file */ }
    return all.sort();
  } catch {
    return [];
  }
}

export default function DronyFPVPage() {
  const images = getDronyImages();
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
          Drony FPV
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
          First Person View - to wspaniałe wrażenia z lotu, które oferują drony FPV. Dzięki kamerze na pokładzie i goglom, możesz poczuć się jakbyś był pilotem, przemierzając niebo z niesamowitą prędkością i precyzją.
          <p>Oferta obejmuje różnorodne modele dronów FPV, dostosowane do różnych stylów latania i poziomów zaawansowania. Niezależnie od tego, czy jesteś początkującym entuzjastą, czy doświadczonym pilotem, możesz zaprojektować drona FPV idealnego dla Ciebie.</p>
          <p>Konfigurator daje możliwość budowy drona według własnych preferencji. Dołącz do świata FPV i odkryj nowe horyzonty latania!</p>
        </p>

        <DronyFPVClient
          cards={[
            {
              title: "Drony wyścigowe",
              desc: "Zaprojektowane z myślą o maksymalnej prędkości i zwinności na torze wyścigowym. Dynamika, pełna immersja dzięki podglądzie na żywo.",
              image: images[0],
            },
            {
              title: "Drony freestyle",
              desc: "Kreatywne, akrobacyjne latanie w trybie acro. Przeciwieństwo do dronów wyścigowych. Te cechują się wytrzymałością na crashe i zdolnością do wykonywania akrobacji.",
              image: images[1],
            },
            {
              title: "Drony long range",
              desc: "Do wykonywania długich lotów na dużą odległość. Loty na odległości do 10km i długi czas w powietrzu. Idealne do eksploracji terenu.",
              image: images[2],
            },
            {
              title: "Drony konsumenckie",
              desc: "Łatwe w obsłudze, z trybami wspomagającymi. Dobre dla osób, które chcą latać rekreacyjnie i podziwiać świat z lotu ptaka bez konieczności posiadania umiejętności pełnej kontroli nad dronem.",
              image: images[3],
            },
            {
              title: "Drony budżetowe/tinywhoop",
              desc: "Małe, lekkie drony do latania w pomieszczeniach. Często używane do nauki podstaw latania FPV. Rozwijają małą prędkość i dają dużo satysfakcji oraz przyjemności z latania.",
              image: images[4],
            },
            {
              title: "Drony na zamówienie",
              desc: "Drony składane według preferencji użytkownika. Nie wybieraj kompromisów. Zaprojektuj drona idealnie pod siebie, a my zadbamy o to, żeby osiągi spełniały Twoje oczekiwania.",
              image: images[5],
            },
          ]}
        />
      </main>

      <MainFooter />
    </SubpageShell>
  );
}

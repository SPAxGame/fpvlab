import type { Metadata } from "next";
import MainHeader from "../components/MainHeader";
import MainFooter from "../components/MainFooter";
import SubpageShell from "../components/SubpageShell";

export const metadata: Metadata = {
  title: "Drony FPV",
};

export default function DronyFPVPage() {
  return (
    <SubpageShell>
      <MainHeader />
      <main
        style={{
          flex: 1,
          maxWidth: 960,
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
          First Person View — to wspaniałe wrażenia z lotu, które oferują drony FPV. Dzięki kamerze na pokładzie i goglom, możesz poczuć się jakbyś był pilotem, przemierzając niebo z niesamowitą prędkością i precyzją. Oferta obejmuje różnorodne modele dronów FPV, dostosowane do różnych stylów latania i poziomów zaawansowania. Niezależnie od tego, czy jesteś początkującym entuzjastą, czy doświadczonym pilotem, możesz zaprojektować drona FPV idealnego dla Ciebie. Konfigurator daje możliwość budowy drona według własnych preferencji. Dołącz do świata FPV i odkryj nowe horyzonty latania!
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {[
            {
              title: "Drony wyścigowe",
              desc: "Zaprojektowane z myślą o maksymalnej prędkości i zwinności na torze wyścigowym. Rama 5 cali, silniki 2400 KV, czas okrążenia poniżej 4 sekund.",
            },
            {
              title: "Drony freestyle",
              desc: "Idealny partner do efektownych manewrów, flipów i szpagatu lotniczego. Wytrzymała konstrukcja, miękkie śmigła, konfiguracja Betaflight.",
            },
            {
              title: "Drony long range",
              desc: "Zasięg do 30 km dzięki systemowi ExpressLRS. Długi czas lotu, stałe skrzydła lub multirotorowiec, pełna telemetria.",
            },
            {
              title: "Drony HD",
              desc: "Kamera DJI O3 lub Runcam Wiz. Nagrywanie w 4K@60fps, czysty feed analogowy jako backup. Filmy z dynamicznym montażem.",
            },
            {
              title: "Drony budżetowe",
              desc: "Zestawy startowe dla początkujących — kompletny sprzęt, simulator, szkolenie online i wsparcie techniczne w cenie pakietu.",
            },
            {
              title: "Drony na zamówienie",
              desc: "Budujemy drony według specyfikacji klienta — konkretne wymogi wagowe, zasięg, ładunek lub systemy dedykowane.",
            },
          ].map(({ title, desc }) => (
            <div
              key={title}
              className="subpage-card"
              style={{
                backgroundColor: "var(--sub-card-bg)",
                border: "1px solid var(--sub-border-subtle)",
                borderRadius: 12,
                padding: "22px 20px",
              }}
            >
              <h2
                style={{
                  color: "var(--sub-subtitle)",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                {title}
              </h2>
              <p style={{ fontSize: 13, lineHeight: 1.8, color: "var(--sub-text)" }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      <MainFooter />
    </SubpageShell>
  );
}

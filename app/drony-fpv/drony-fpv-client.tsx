"use client";

import { useState } from "react";

interface DroneCard {
  title: string;
  desc: string;
  image?: string;
}

export default function DronyFPVClient({ cards }: { cards: DroneCard[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {cards.map(({ title, desc, image }) => (
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
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/panel_drony_fpv/${image}`}
                alt={title}
                onClick={() => setLightbox(`/panel_drony_fpv/${image}`)}
                style={{
                  width: "100%",
                  height: 160,
                  objectFit: "cover",
                  borderRadius: 8,
                  marginBottom: 12,
                  border: "1px solid var(--sub-border-subtle)",
                  display: "block",
                  cursor: "zoom-in",
                }}
              />
            )}
            <p style={{ fontSize: 13, lineHeight: 1.8, color: "var(--sub-text)" }}>
              {desc}
            </p>
          </div>
        ))}
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            backgroundColor: "rgba(0,0,0,0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt=""
            style={{
              maxWidth: "92vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: 10,
              boxShadow: "0 8px 40px rgba(0, 0, 0, 0.7)",
              pointerEvents: "none",
            }}
          />
        </div>
      )}
    </>
  );
}

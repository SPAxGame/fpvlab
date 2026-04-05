"use client";

import { useState } from "react";

interface StlFile {
  name: string;
  description: string;
  filename: string;
}

interface StlCategory {
  id: string;
  label: string;
  description: string;
  folder: string;
  files: StlFile[];
}

function CategoryRow({ cat }: { cat: StlCategory }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Nagłówek kategorii – klikalny */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "12px 14px",
          background: "var(--sub-card-bg)",
          border: "1px solid var(--sub-border-subtle)",
          borderRadius: open ? "8px 8px 0 0" : 8,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--sub-subtitle)",
              letterSpacing: 0.5,
            }}
          >
            {cat.label}
          </span>
          <span style={{ fontSize: 11, color: "var(--sub-border)", fontWeight: 500 }}>
            {cat.files.length} plików
          </span>
        </div>
        <span
          style={{
            fontSize: 18,
            color: "var(--sub-border)",
            lineHeight: 1,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            display: "inline-block",
          }}
        >
          ▾
        </span>
      </button>

      {/* Lista plików */}
      {open && (
        <div
          style={{
            border: "1px solid var(--sub-border-subtle)",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            overflow: "hidden",
          }}
        >
          {cat.description && (
            <p
              style={{
                fontSize: 12,
                color: "var(--sub-text)",
                margin: 0,
                padding: "10px 14px 6px",
                lineHeight: 1.6,
                borderBottom: "1px solid var(--sub-border-subtle)",
              }}
            >
              {cat.description}
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {cat.files.map((f, i) => (
              <div
                key={f.filename}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  padding: "10px 14px",
                  borderTop: i === 0 ? "none" : "1px solid var(--sub-border-subtle)",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: "var(--sub-title)",
                      marginBottom: 2,
                    }}
                  >
                    {f.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--sub-text)", lineHeight: 1.5 }}>
                    {f.description}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--sub-border)",
                      marginTop: 3,
                      fontFamily: "monospace",
                    }}
                  >
                    {f.filename}
                  </div>
                </div>
                <a
                  href={`/stl/${cat.folder}/${encodeURIComponent(f.filename)}`}
                  download
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 16px",
                    backgroundColor: "var(--sub-card-bg)",
                    border: "1px solid var(--sub-border-subtle)",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--sub-subtitle)",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  ⬇ Pobierz STL
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StlPanelClient({ categories }: { categories: StlCategory[] }) {
  return (
    <div
      className="subpage-card"
      style={{
        backgroundColor: "var(--sub-card-bg)",
        border: "1px solid var(--sub-border-subtle)",
        borderRadius: 12,
        padding: "28px 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 28 }}>📦</span>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "var(--sub-title)",
            margin: 0,
            letterSpacing: 1,
          }}
        >
          Pliki STL do pobrania
        </h2>
      </div>
      <p style={{ fontSize: 13, color: "var(--sub-border)", marginBottom: 20, lineHeight: 1.6 }}>
        Gotowe modele sprawdzone na Prusa MK4S+. Ściągnij, wgraj do slicera i drukuj.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {categories.map((cat) => (
          <CategoryRow key={cat.id} cat={cat} />
        ))}
      </div>
    </div>
  );
}

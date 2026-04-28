"use client";

import { useEffect, useState } from "react";

export default function GoToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Przewiń do góry"
      style={{
        position: "fixed",
        bottom: 28,
        right: 20,
        zIndex: 9999,
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.20)",
        backgroundColor: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        color: "rgba(255,255,255,0.65)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.35s, transform 0.35s, background-color 0.25s",
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.5)",
        pointerEvents: visible ? "auto" : "none",
        boxShadow: visible ? "0 2px 16px rgba(0,0,0,0.25)" : "none",
      }}
      onMouseEnter={(e) => {
        const el = e.target as HTMLButtonElement;
        el.style.backgroundColor = "rgba(255,255,255,0.15)";
        el.style.color = "rgba(255,255,255,0.95)";
        el.style.borderColor = "rgba(255,255,255,0.35)";
      }}
      onMouseLeave={(e) => {
        const el = e.target as HTMLButtonElement;
        el.style.backgroundColor = "rgba(255,255,255,0.08)";
        el.style.color = "rgba(255,255,255,0.65)";
        el.style.borderColor = "rgba(255,255,255,0.20)";
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}

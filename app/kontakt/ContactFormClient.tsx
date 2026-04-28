"use client";

import { useState, type FormEvent } from "react";

export default function ContactFormClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  const resetStatus = () => {
    if (status !== "idle") setStatus("idle");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatus("idle");
    setErrorText("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorText(data.error || "Nie udało się wysłać.");
      } else {
        setStatus("ok");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      }
    } catch {
      setStatus("error");
      setErrorText("Błąd połączenia. Spróbuj ponownie.");
    } finally {
      setSending(false);
    }
  };

  const inputStyle: Record<string, string> = {
    backgroundColor: "var(--sub-bg)",
    border: "1px solid var(--sub-border-subtle)",
    borderRadius: "6px",
    padding: "10px 14px",
    color: "var(--sub-text)",
    fontSize: "13px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <input
        placeholder="Imię / Nick *"
        value={name}
        onChange={(e) => { setName(e.target.value); resetStatus(); }}
        required
        style={inputStyle}
      />
      <input
        type="email"
        placeholder="E-mail *"
        value={email}
        onChange={(e) => { setEmail(e.target.value); resetStatus(); }}
        required
        style={inputStyle}
      />
      <input
        placeholder="Temat *"
        value={subject}
        onChange={(e) => { setSubject(e.target.value); resetStatus(); }}
        required
        style={inputStyle}
      />
      <textarea
        placeholder="Treść wiadomości *"
        value={message}
        onChange={(e) => { setMessage(e.target.value); resetStatus(); }}
        required
        rows={5}
        style={{
          ...inputStyle,
          resize: "vertical",
          minHeight: 100,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <button
          type="submit"
          disabled={sending}
          style={{
            backgroundColor: sending ? "var(--sub-border)" : "var(--sub-subtitle)",
            color: "var(--sub-bg)",
            border: "none",
            borderRadius: 7,
            padding: "11px 28px",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.08em",
            cursor: sending ? "wait" : "pointer",
            textTransform: "uppercase",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => { if (!sending) (e.target as HTMLButtonElement).style.opacity = "0.85"; }}
          onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.opacity = "1"; }}
        >
          {sending ? "Wysyłanie…" : "Wyślij"}
        </button>

        {status === "ok" && (
          <span style={{ fontSize: 13, color: "#4ade80", fontWeight: 600 }}>
            ✓ Wiadomość wysłana! Odpowiemy najszybciej jak to możliwe.
          </span>
        )}
        {status === "error" && (
          <span style={{ fontSize: 13, color: "#f87171", fontWeight: 600 }}>
            ✗ {errorText}
          </span>
        )}
      </div>
    </form>
  );
}

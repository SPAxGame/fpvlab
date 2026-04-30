"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      password,
      redirect: true,
      callbackUrl: "/admin",
    });
    if (res?.error) setError("Błędne hasło");
    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: 'url(/images/background_mario.jpg)',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <form onSubmit={handleSubmit} style={{ background: "rgba(34,34,34,0.92)", padding: 32, borderRadius: 12, minWidth: 320, boxShadow: "0 8px 32px #0008" }}>
        <h2 style={{ marginBottom: 18, fontSize: 22 }}>Logowanie admina</h2>
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #444", marginBottom: 16 }}
        />
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10, borderRadius: 6, background: "#444", color: "#fff", fontWeight: 600 }}>
          {loading ? "Logowanie..." : "Zaloguj"}
        </button>
        {error && <div style={{ color: "#e33", marginTop: 12 }}>{error}</div>}
      </form>
    </div>
  );
}

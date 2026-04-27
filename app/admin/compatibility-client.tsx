"use client";

import { useEffect, useState, useMemo } from "react";
import { DEFAULT_SETTINGS, SETTINGS_KEY, hexToRgba } from "../lib/settings";
import type { HomepageSettings } from "../lib/settings";
import { CATEGORY_LABELS } from "../lib/products";
import type { Product, Category } from "../lib/products";

interface CompatRule {
  id: string;
  productA: string;
  productB: string;
  reason: string;
}

function inputStyle(settings: HomepageSettings): React.CSSProperties {
  return {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    border: `1px solid ${hexToRgba(settings.panelBorderColor, 40)}`,
    backgroundColor: hexToRgba(settings.sliderBgColor, 90),
    color: settings.panelTextColor,
    fontSize: 13,
    boxSizing: "border-box",
  };
}

export default function CompatibilityClient() {
  const [settings, setSettings] = useState<HomepageSettings>(DEFAULT_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [rules, setRules] = useState<CompatRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [reason, setReason] = useState("");
  const [incompatibleIds, setIncompatibleIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }));
    } catch { /* ignore */ }
  }, []);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/compatibility").then((r) => r.json()),
    ])
      .then(([prods, compat]: [Product[], CompatRule[]]) => {
        setProducts(prods);
        setRules(compat);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (!selectedProduct) { setIncompatibleIds(new Set()); return; }
    const ids = new Set<string>();
    rules.forEach((r) => {
      if (r.productA === selectedProduct) ids.add(r.productB);
      if (r.productB === selectedProduct) ids.add(r.productA);
    });
    setIncompatibleIds(ids);
    const existing = rules.find((r) => r.productA === selectedProduct || r.productB === selectedProduct);
    if (existing) setReason(existing.reason);
  }, [selectedProduct, rules]);

  const showMsg = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  const toggleIncompat = (id: string) => {
    setIncompatibleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedProduct) { showMsg("Wybierz produkt", false); return; }
    if (incompatibleIds.size > 0 && !reason.trim()) {
      showMsg("Wpisz powód niezgodności", false); return;
    }
    setSaving(true);
    try {
      const toDelete = rules.filter(
        (r) => r.productA === selectedProduct || r.productB === selectedProduct
      );
      await Promise.all(
        toDelete.map((r) => fetch(`/api/compatibility/${r.id}`, { method: "DELETE" }))
      );
      await Promise.all(
        Array.from(incompatibleIds).map((otherId) =>
          fetch("/api/compatibility", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productA: selectedProduct, productB: otherId, reason: reason.trim() }),
          })
        )
      );
      showMsg("Zapisano reguły zgodności");
      loadData();
    } catch {
      showMsg("Błąd zapisu", false);
    } finally {
      setSaving(false);
    }
  };

  const panelStyle: React.CSSProperties = {
    border: `1px solid ${hexToRgba(settings.panelBorderColor, 30)}`,
    backgroundColor: hexToRgba(settings.panelBgColor, parseInt(settings.panelOpacity)),
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  };

  const borderSubtle = hexToRgba(settings.panelBorderColor, 35);

  const productName = (id: string) => {
    const p = products.find((x) => x.id === id);
    return p ? `${CATEGORY_LABELS[p.category]} — ${p.name}` : id;
  };

  const otherProducts = useMemo(
    () => products.filter((p) => p.id !== selectedProduct),
    [products, selectedProduct]
  );

  const byCategory = useMemo(() => {
    return otherProducts.reduce<Record<string, Product[]>>((acc, p) => {
      (acc[p.category] ??= []).push(p);
      return acc;
    }, {});
  }, [otherProducts]);

  return (
    <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto", padding: "0 24px 60px" }}>

      {msg && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          padding: "12px 20px", borderRadius: 10,
          backgroundColor: msg.ok ? "#2a6e2a" : "#8b1a1a",
          color: "#fff", fontWeight: 600, fontSize: 14,
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}>
          {msg.text}
        </div>
      )}

      {/* Editor */}
      <div style={{ ...panelStyle, borderRadius: 16, padding: "24px 20px", marginBottom: 24 }}>
        <h2 style={{ color: settings.panelTitleColor, fontSize: 17, fontWeight: 700, margin: "0 0 6px" }}>
          Edytor zgodności produktu
        </h2>
        <p style={{ color: settings.panelTextColor, fontSize: 12, margin: "0 0 20px", opacity: 0.7 }}>
          Wybierz produkt. Na liście poniżej <strong>odznacz</strong> produkty, z którymi jest <strong>niekompatybilny</strong>. Zaznaczone = kompatybilne.
        </p>

        <div style={{ marginBottom: 16 }}>
          <div style={{ color: settings.panelTextColor, fontSize: 12, marginBottom: 6, fontWeight: 600 }}>
            Produkt do skonfigurowania
          </div>
          <select
            value={selectedProduct}
            onChange={(e) => { setSelectedProduct(e.target.value); setReason(""); }}
            style={inputStyle(settings)}
          >
            <option value="">Wybierz produkt...</option>
            {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => {
              const catProducts = products.filter((p) => p.category === cat);
              if (catProducts.length === 0) return null;
              return (
                <optgroup key={cat} label={CATEGORY_LABELS[cat]}>
                  {catProducts.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>

        {selectedProduct && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ color: settings.panelTextColor, fontSize: 12, marginBottom: 6, fontWeight: 600 }}>
              Powód niezgodności (wyświetlany użytkownikowi)
            </div>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="np. Ten produkt nie pasuje do wybranej ramy — brakuje miejsca"
              style={{ ...inputStyle(settings), fontSize: 13 }}
            />
          </div>
        )}

        {selectedProduct && !loading && (
          <>
            <div style={{
              color: settings.panelSubtitleColor,
              fontSize: 12, fontWeight: 700,
              letterSpacing: 1, textTransform: "uppercase",
              marginBottom: 12,
            }}>
              Kompatybilność z innymi produktami
              <span style={{ marginLeft: 8, opacity: 0.6, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                — odznacz niekompatybilne ({incompatibleIds.size} niekompatybilnych)
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 20 }}>
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => {
                const catProds = byCategory[cat];
                if (!catProds?.length) return null;
                const allChecked = catProds.every((p) => !incompatibleIds.has(p.id));
                return (
                  <div key={cat} style={{
                    border: `1px solid rgba(255, 220, 0, 0.45)`,
                    borderRadius: 12,
                    padding: "14px 16px",
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 10,
                      marginBottom: 12,
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: settings.panelSubtitleColor, flex: 1 }}>
                        {CATEGORY_LABELS[cat]}
                      </span>
                      <button
                        onClick={() => {
                          const ids = catProds.map((p) => p.id);
                          setIncompatibleIds((prev) => {
                            const next = new Set(prev);
                            if (allChecked) {
                              ids.forEach((id) => next.add(id));
                            } else {
                              ids.forEach((id) => next.delete(id));
                            }
                            return next;
                          });
                        }}
                        style={{
                          fontSize: 11, padding: "3px 10px", borderRadius: 6,
                          border: `1px solid ${borderSubtle}`, background: "transparent",
                          color: settings.panelTextColor, cursor: "pointer",
                        }}
                      >
                        {allChecked ? "Odznacz wszystkie" : "Zaznacz wszystkie"}
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                      {catProds.map((p) => {
                        const incompatible = incompatibleIds.has(p.id);
                        return (
                          <label
                            key={p.id}
                            style={{
                              display: "flex", alignItems: "center", gap: 10,
                              padding: "8px 12px", borderRadius: 8, cursor: "pointer",
                              border: `1px solid ${incompatible ? hexToRgba("#c0392b", 40) : hexToRgba(settings.panelBorderColor, 20)}`,
                              backgroundColor: incompatible
                                ? hexToRgba("#c0392b", 8)
                                : hexToRgba(settings.sliderBgColor, 50),
                              transition: "all 0.12s",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={!incompatible}
                              onChange={() => toggleIncompat(p.id)}
                              style={{ width: 15, height: 15, accentColor: settings.panelSubtitleColor, flexShrink: 0 }}
                            />
                            <span style={{
                              fontSize: 13,
                              color: incompatible ? "#e07070" : settings.panelTextColor,
                              flex: 1,
                            }}>
                              {p.name}
                            </span>
                            {incompatible && (
                              <span style={{ fontSize: 11, color: "#e07070", fontWeight: 600 }}>✕ niekompatybilny</span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "10px 28px", borderRadius: 10, border: "none",
                  backgroundColor: settings.panelSubtitleColor, color: "#111",
                  cursor: saving ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 700,
                }}
              >
                {saving ? "Zapisywanie..." : "Zapisz reguły"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Rules summary */}
      <div style={{ ...panelStyle, borderRadius: 16, padding: "20px" }}>
        <h2 style={{ color: settings.panelTitleColor, fontSize: 17, fontWeight: 700, margin: "0 0 16px" }}>
          Wszystkie reguły niezgodności {!loading && `(${rules.length})`}
        </h2>

        {loading ? (
          <p style={{ color: settings.panelTextColor }}>Ładowanie...</p>
        ) : rules.length === 0 ? (
          <p style={{ color: settings.panelTextColor, opacity: 0.6, fontSize: 13 }}>
            Brak zdefiniowanych reguł.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rules.map((rule) => (
              <div
                key={rule.id}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 14,
                  padding: "12px 14px", borderRadius: 10,
                  border: `1px solid ${borderSubtle}`,
                  backgroundColor: hexToRgba(settings.sliderBgColor, 60),
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: settings.panelSubtitleColor,
                      background: hexToRgba(settings.panelSubtitleColor, 15),
                      padding: "2px 8px", borderRadius: 6,
                    }}>
                      {productName(rule.productA)}
                    </span>
                    <span style={{ color: settings.panelTextColor, opacity: 0.4, fontSize: 13 }}>✕</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: settings.panelSubtitleColor,
                      background: hexToRgba(settings.panelSubtitleColor, 15),
                      padding: "2px 8px", borderRadius: 6,
                    }}>
                      {productName(rule.productB)}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: settings.panelTextColor, opacity: 0.65 }}>
                    {rule.reason}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await fetch(`/api/compatibility/${rule.id}`, { method: "DELETE" });
                    loadData();
                  }}
                  title="Usuń regułę"
                  style={{
                    flexShrink: 0, width: 28, height: 28, borderRadius: 6,
                    border: "none", backgroundColor: "#8b1a1a",
                    color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

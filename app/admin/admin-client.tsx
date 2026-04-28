"use client";

import { useEffect, useState, useRef } from "react";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  hexToRgba,
} from "../lib/settings";
import type { HomepageSettings } from "../lib/settings";
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
} from "../lib/products";
import type { Category, Product } from "../lib/products";

// ─── Helpers ───────────────────────────────────────────────────────────────

const FRAME_TYPES: ("DC" | "X" | "DC/X")[] = ["DC", "X", "DC/X"];
const VIDEO_TYPES: ("analog" | "digital")[] = ["analog", "digital"];

function emptyForm(): Partial<Product> {
  return {
    category: "frame",
    name: "",
    price: 0,
    description: "",
    inStock: true,
    image: "",
    images: [],
    frameType: undefined,
    includesStraps: false,
    color: undefined,
    kv: undefined,
    kvOptions: [],
    cellCount: undefined,
    videoType: undefined,
    pitch: undefined,
    polarization: undefined,
  };
}

// ─── Main admin component ─────────────────────────────────────────────────

export default function AdminClient() {
  const [settings, setSettings] = useState<HomepageSettings>(DEFAULT_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>("frame");
  const [form, setForm] = useState<Partial<Product>>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingImgIdx, setUploadingImgIdx] = useState<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [dragSourceSlot, setDragSourceSlot] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [hoveredImg, setHoveredImg] = useState<string | null>(null);
  const [lightboxData, setLightboxData] = useState<{ images: string[]; activeIdx: number } | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadingSlotRef = useRef<number>(-1);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }));
    } catch { /* ignore */ }
  }, []);

  const loadProducts = () => {
    setLoading(true);
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: Product[]) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProducts(); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxData(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const showMsg = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  const panelStyle: React.CSSProperties = {
    border: `1px solid ${hexToRgba(settings.panelBorderColor, 30)}`,
    backgroundColor: hexToRgba(settings.panelBgColor, parseInt(settings.panelOpacity)),
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  };

  const cardBg = hexToRgba(settings.sliderBgColor, 80);
  const borderSubtle = hexToRgba(settings.panelBorderColor, 35);

  // ── Form handlers ──────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm(), category: activeCategory });
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    const formData: Partial<Product> = { ...p };
    // Backfill images[] from image field for products that only have the legacy image string
    if ((!formData.images || formData.images.length === 0) && formData.image) {
      formData.images = [formData.image];
    }
    // Backfill kvOptions from kv for legacy motor products
    if (formData.category === "motor" && !formData.kvOptions?.length && formData.kv) {
      formData.kvOptions = [formData.kv];
    }
    setForm(formData);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const uploadFile = async (file: File, idx: number) => {
    setUploadingImgIdx(idx);
    const fd = new FormData();
    fd.append("file", file);
    if (form.category) fd.append("category", form.category);
    if (form.name) fd.append("name", form.name);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const { filename } = await res.json();
      setForm((prev) => {
        const imgs = [...(prev.images ?? [])];
        imgs[idx] = filename;
        return { ...prev, images: imgs };
      });
      showMsg("Zdjęcie przesłane");
    } catch {
      showMsg("Błąd przesyłania zdjęcia", false);
    } finally {
      setUploadingImgIdx(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const idx = uploadingSlotRef.current;
    await uploadFile(file, idx);
  };

  const handleSave = async () => {
    if (!form.name?.trim()) { showMsg("Podaj nazwę produktu", false); return; }
    if (!form.price || form.price <= 0) { showMsg("Podaj prawidłową cenę", false); return; }
    setSaving(true);
    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PUT" : "POST";
      const payload = { ...form, image: form.images?.length ? form.images[0] : "" };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      showMsg(editingId ? "Produkt zaktualizowany" : "Produkt dodany");
      closeForm();
      loadProducts();
    } catch {
      showMsg("Błąd zapisu", false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showMsg("Produkt usunięty");
      setDeleteConfirm(null);
      loadProducts();
    } catch {
      showMsg("Błąd usuwania", false);
    }
  };

  // ── Category counts ────────────────────────────────────────────────────

  const countByCategory = (cat: Category) => products.filter((p) => p.category === cat).length;
  const filteredProducts = products.filter((p) => p.category === activeCategory);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div style={{ width: "100%", padding: "0 0 60px" }}>

      {/* Toast */}
      {msg && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: 10,
            backgroundColor: msg.ok ? "#2a6e2a" : "#8b1a1a",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          {msg.text}
        </div>
      )}

      {/* ── Add / Edit form ── */}
      {showForm && (
        <div
          style={{
            ...panelStyle,
            borderRadius: 16,
            padding: "24px 20px",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ color: settings.panelTitleColor, fontSize: 17, fontWeight: 700, margin: 0 }}>
              {editingId ? "Edytuj produkt" : "Dodaj nowy produkt"}
            </h2>
            <button onClick={closeForm} style={{ background: "none", border: "none", color: settings.panelTextColor, cursor: "pointer", fontSize: 20 }}>✕</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>

            {/* Category */}
            <FormField label="Kategoria" settings={settings}>
              <select
                value={form.category ?? "frame"}
                onChange={(e) => {
                  const cat = e.target.value as Category;
                  setForm((p) => ({ ...p, category: cat, frameType: undefined, includesStraps: false, color: undefined, kv: undefined, kvOptions: [], videoType: undefined, polarization: undefined }));
                  setActiveCategory(cat);
                }}
                style={inputStyle(settings)}
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </FormField>

            {/* Name */}
            <FormField label="Nazwa produktu *" settings={settings}>
              <input
                type="text"
                value={form.name ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="np. SpeedyBee F405 V4"
                style={inputStyle(settings)}
              />
            </FormField>

            {/* Price */}
            <FormField label="Cena (zł) *" settings={settings}>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price || ""}
                onChange={(e) => setForm((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                style={inputStyle(settings)}
              />
            </FormField>

            {/* In stock */}
            <FormField label="Dostępność" settings={settings}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: settings.panelTextColor }}>
                <input
                  type="checkbox"
                  checked={form.inStock ?? true}
                  onChange={(e) => setForm((p) => ({ ...p, inStock: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: settings.panelSubtitleColor }}
                />
                W magazynie
              </label>
            </FormField>

            {/* Frame-specific */}
            {form.category === "frame" && (
              <>
                <FormField label="Typ ramy" settings={settings}>
                  <select
                    value={form.frameType ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, frameType: e.target.value as "DC" | "X" | "DC/X" }))}
                    style={inputStyle(settings)}
                  >
                    <option value="">Wybierz...</option>
                    {FRAME_TYPES.map((t) => <option key={t} value={t}>{t === "DC/X" ? "DC/X (konwertowalny)" : t}</option>)}
                  </select>
                </FormField>
                <FormField label="Kolor ramy" settings={settings}>
                  <input
                    type="text"
                    value={form.color ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, color: e.target.value || undefined }))}
                    placeholder="np. Czarny, Carbon, Biały..."
                    style={inputStyle(settings)}
                  />
                </FormField>
                <FormField label="Paski do akumulatora w zestawie" settings={settings}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: settings.panelTextColor }}>
                    <input
                      type="checkbox"
                      checked={form.includesStraps ?? false}
                      onChange={(e) => setForm((p) => ({ ...p, includesStraps: e.target.checked }))}
                      style={{ width: 16, height: 16, accentColor: settings.panelSubtitleColor }}
                    />
                    Tak, zamieszczone w zestawie
                  </label>
                </FormField>
              </>
            )}

            {/* Motor-specific */}
            {form.category === "motor" && (
              <>
                <FormField label="KV (obroty)" settings={settings}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="np. 2400 (Enter aby dodać)"
                      id="kv-input"
                      style={inputStyle(settings)}
                      onFocus={(e) => e.target.select()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = parseInt((e.target as HTMLInputElement).value);
                          if (!val) return;
                          (e.target as HTMLInputElement).value = "";
                          setForm((p) => ({
                            ...p,
                            kvOptions: [...new Set([...(p.kvOptions ?? []), val])].sort((a, b) => a - b),
                          }));
                        }
                      }}
                    />
                    {(form.kvOptions ?? []).length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {(form.kvOptions ?? []).map((kv) => (
                          <span
                            key={kv}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              background: hexToRgba(settings.sliderBgColor, 80),
                              border: `1px solid ${hexToRgba(settings.panelBorderColor, 50)}`,
                              color: settings.panelTextColor,
                              borderRadius: 6, padding: "3px 8px", fontSize: 13, fontWeight: 600,
                            }}
                          >
                            {kv} KV
                            <button
                              type="button"
                              onClick={() => setForm((p) => ({ ...p, kvOptions: (p.kvOptions ?? []).filter((v) => v !== kv) }))}
                              style={{ background: "none", border: "none", cursor: "pointer", color: settings.panelSubtitleColor, fontSize: 16, lineHeight: 1, padding: "0 0 1px 4px" }}
                              aria-label={`Usuń ${kv} KV`}
                            >×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </FormField>
                <FormField label="Liczba ogniw (S)" settings={settings}>
                  <select
                    value={form.cellCount ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, cellCount: (e.target.value as "4s" | "6s") || undefined }))}
                    style={inputStyle(settings)}
                  >
                    <option value="6s">6S</option>
                    <option value="4s">4S</option>
                    <option value="">Nieokreślona</option>
                  </select>
                </FormField>
              </>
            )}

            {/* Battery-specific */}
            {form.category === "battery" && (
              <FormField label="Liczba ogniw (S)" settings={settings}>
                <select
                  value={form.cellCount ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, cellCount: (e.target.value as "4s" | "6s") || undefined }))}
                  style={inputStyle(settings)}
                >
                  <option value="6s">6S</option>
                  <option value="4s">4S</option>
                  <option value="">Nieokreślona</option>
                </select>
              </FormField>
            )}

            {/* Propeller-specific */}
            {form.category === "propeller" && (
              <>
                <FormField label=" (Pitch - Skok Śmigła)" settings={settings}>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={form.pitch ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, pitch: e.target.value ? parseFloat(e.target.value) : undefined }))}
                    placeholder="np. 3.5"
                    className="no-spinner"
                    style={inputStyle(settings)}
                  />
                </FormField>
                <FormField label="Kolor śmigła" settings={settings}>
                  <input
                    type="text"
                    value={form.color ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, color: e.target.value || undefined }))}
                    placeholder="np. Czarny, Biały, Miks..."
                    style={inputStyle(settings)}
                  />
                </FormField>
              </>
            )}

            {form.category === "antenna" && (
              <FormField label="Polaryzacja" settings={settings}>
                <select
                  value={form.polarization ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, polarization: (e.target.value as "RHCP" | "LHCP") || undefined }))}
                  style={inputStyle(settings)}
                >
                  <option value="">Dowolna / nie dotyczy</option>
                  <option value="RHCP">RHCP (analog)</option>
                  <option value="LHCP">LHCP (cyfrowy)</option>
                </select>
              </FormField>
            )}

            {/* Video-specific */}
            {(form.category === "video_bundle" || form.category === "camera" || form.category === "vtx") && (
              <FormField label="Typ wideo" settings={settings}>
                <select
                  value={form.videoType ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, videoType: e.target.value as "analog" | "digital" }))}
                  style={inputStyle(settings)}
                >
                  <option value="">Wybierz...</option>
                  {VIDEO_TYPES.map((t) => <option key={t} value={t}>{t === "analog" ? "Analogowy" : "Cyfrowy"}</option>)}
                </select>
              </FormField>
            )}

            {/* Description */}
            <div style={{ gridColumn: "1 / -1" }}>
              <FormField label="Opis (opcjonalny)" settings={settings}>
                <textarea
                  value={form.description ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={2}
                  placeholder="Krótki opis produktu..."
                  style={{ ...inputStyle(settings), resize: "vertical" as const, minHeight: 60 }}
                />
              </FormField>
            </div>

            {/* Images – max 5 */}
            <div style={{ gridColumn: "1 / -1" }}>
              <FormField label="Zdjęcia (max 5) – pierwsze jest głównym" settings={settings}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                  {/* Sloty */}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const imgs = form.images ?? [];
                      const filename = imgs[idx];
                      const isUploading = uploadingImgIdx === idx;
                      const isDraggedOver = dragOverSlot === idx;

                      if (filename) {
                        // Zajęty slot – miniaturka z możliwością zastąpienia przez drop
                        return (
                          <div
                            key={idx}
                            style={{ position: "relative", width: 80, height: 64 }}
                            draggable
                            onDragStart={() => setDragSourceSlot(idx)}
                            onDragEnd={() => { setDragSourceSlot(null); setDragOverSlot(null); }}
                            onDragOver={(e) => { e.preventDefault(); setDragOverSlot(idx); }}
                            onDragLeave={() => setDragOverSlot(null)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setDragOverSlot(null);
                              // Internal reorder
                              if (dragSourceSlot !== null && dragSourceSlot !== idx) {
                                setDragSourceSlot(null);
                                setForm((p) => {
                                  const copy = [...(p.images ?? [])];
                                  const [moved] = copy.splice(dragSourceSlot, 1);
                                  copy.splice(idx, 0, moved);
                                  return { ...p, images: copy };
                                });
                                return;
                              }
                              setDragSourceSlot(null);
                              // External file drop
                              const file = e.dataTransfer.files?.[0];
                              if (file) uploadFile(file, idx);
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`/products/${filename}`}
                              alt={`Zdjęcie ${idx + 1}`}
                              onClick={() => { uploadingSlotRef.current = idx; fileRef.current?.click(); }}
                              style={{
                                width: 80,
                                height: 64,
                                objectFit: "cover",
                                borderRadius: 8,
                                border: isDraggedOver
                                  ? `2px dashed ${settings.panelSubtitleColor}`
                                  : idx === 0
                                  ? `2px solid ${settings.panelSubtitleColor}`
                                  : `1px solid ${borderSubtle}`,
                                cursor: "pointer",
                                display: "block",
                                opacity: isDraggedOver ? 0.5 : 1,
                                transition: "opacity 0.15s",
                              }}
                            />
                            {isDraggedOver && (
                              <div style={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 22,
                                pointerEvents: "none",
                              }}>🔄</div>
                            )}
                            {idx === 0 && !isDraggedOver && (
                              <span style={{
                                position: "absolute",
                                top: 2,
                                left: 4,
                                fontSize: 9,
                                fontWeight: 700,
                                color: settings.panelSubtitleColor,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                pointerEvents: "none",
                              }}>główne</span>
                            )}
                            <button
                              type="button"
                              onClick={() => setForm((p) => {
                                const copy = [...(p.images ?? [])];
                                copy.splice(idx, 1);
                                return { ...p, images: copy };
                              })}
                              style={{
                                position: "absolute",
                                top: -6,
                                right: -6,
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                border: "none",
                                backgroundColor: "#c0392b",
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: 11,
                                lineHeight: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 0,
                              }}
                            >×</button>
                          </div>
                        );
                      }

                      if (idx === imgs.length) {
                        // Następny wolny slot – drop zone + klik
                        return (
                          <div
                            key={idx}
                            onDragOver={(e) => { e.preventDefault(); setDragOverSlot(idx); }}
                            onDragLeave={() => setDragOverSlot(null)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setDragOverSlot(null);
                              const files = Array.from(e.dataTransfer.files).filter((f) =>
                                f.type.startsWith("image/")
                              );
                              const currentImgs = form.images ?? [];
                              const free = 5 - currentImgs.length;
                              files.slice(0, free).forEach((file, i) => {
                                uploadFile(file, currentImgs.length + i);
                              });
                            }}
                            onClick={() => { uploadingSlotRef.current = idx; fileRef.current?.click(); }}
                            style={{
                              width: 80,
                              height: 64,
                              borderRadius: 8,
                              border: `2px dashed ${isDraggedOver ? settings.panelSubtitleColor : borderSubtle}`,
                              backgroundColor: isDraggedOver
                                ? hexToRgba(settings.panelSubtitleColor, 12)
                                : "transparent",
                              color: isDraggedOver ? settings.panelSubtitleColor : settings.panelTextColor,
                              cursor: "pointer",
                              fontSize: isUploading ? 10 : 22,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.15s",
                              userSelect: "none",
                            }}
                          >
                            {isUploading ? "…" : isDraggedOver ? "📥" : "+"}
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />
                </div>
              </FormField>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "flex-end" }}>
            <button
              onClick={closeForm}
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                border: `2px solid ${borderSubtle}`,
                backgroundColor: "transparent",
                color: settings.panelTextColor,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Anuluj
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "10px 28px",
                borderRadius: 10,
                border: "none",
                backgroundColor: settings.panelSubtitleColor,
                color: "#111",
                cursor: saving ? "not-allowed" : "pointer",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {saving ? "Zapisywanie..." : editingId ? "Zapisz zmiany" : "Dodaj produkt"}
            </button>
          </div>
        </div>
      )}

      {/* ── Asortyment – Category tabs ── */}
      <div style={{ ...panelStyle, borderRadius: 16, padding: "16px 20px", marginBottom: 20 }}>
        <h3
          style={{
            color: settings.panelTitleColor,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            margin: "0 0 12px",
          }}
        >
          Asortyment
        </h3>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
        {ALL_CATEGORIES.map((cat) => {
          const active = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                border: `2px solid ${active ? settings.panelSubtitleColor : borderSubtle}`,
                backgroundColor: active ? hexToRgba(settings.panelSubtitleColor, 18) : "transparent",
                color: active ? settings.panelSubtitleColor : settings.panelTextColor,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: active ? 700 : 400,
                transition: "all 0.15s",
              }}
            >
              {CATEGORY_LABELS[cat]}
              <span
                style={{
                  marginLeft: 6,
                  backgroundColor: active ? settings.panelSubtitleColor : hexToRgba(settings.panelBorderColor, 40),
                  color: active ? "#111" : settings.panelTextColor,
                  borderRadius: 10,
                  padding: "1px 7px",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {countByCategory(cat)}
              </span>
            </button>
          );
        })}
        </div>
      </div>

      {/* ── Product list ── */}
      <div style={{ ...panelStyle, borderRadius: 16, padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ color: settings.panelTitleColor, fontSize: 16, fontWeight: 700, margin: 0 }}>
            {CATEGORY_LABELS[activeCategory]}
            <span style={{ color: settings.panelTextColor, fontWeight: 400, fontSize: 13, marginLeft: 10 }}>
              ({filteredProducts.length} produktów)
            </span>
          </h2>
          <button
            onClick={openAdd}
            style={{
              padding: "8px 20px",
              borderRadius: 10,
              border: "none",
              backgroundColor: settings.panelSubtitleColor,
              color: "#111",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            + Dodaj produkt
          </button>
        </div>

        {loading ? (
          <p style={{ color: settings.panelTextColor }}>Ładowanie...</p>
        ) : filteredProducts.length === 0 ? (
          <p style={{ color: settings.panelTextColor, padding: "20px 0" }}>
            Brak produktów w tej kategorii. Kliknij &quot;+ Dodaj produkt&quot;.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 14px",
                  borderRadius: 12,
                  backgroundColor: cardBg,
                  border: `1px solid ${borderSubtle}`,
                  flexWrap: "wrap",
                }}
              >
                {/* Image thumb */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                {(p.images?.[0] || p.image) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/products/${p.images?.[0] || p.image}`}
                    alt=""
                    onMouseEnter={() => setHoveredImg(p.id)}
                    onMouseLeave={() => setHoveredImg(null)}
                    onClick={() => { const imgs = p.images?.length ? p.images : p.image ? [p.image] : []; if (imgs.length) setLightboxData({ images: imgs, activeIdx: 0 }); }}
                    style={{
                      width: 112,
                      height: 88,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: `1px solid ${borderSubtle}`,
                      flexShrink: 0,
                      cursor: "zoom-in",
                      transition: "transform 0.2s",
                      transform: hoveredImg === p.id ? "scale(1.08)" : "scale(1)",
                      zIndex: hoveredImg === p.id ? 10 : 1,
                      position: "relative",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 112,
                      height: 88,
                      borderRadius: 8,
                      backgroundColor: hexToRgba(settings.panelBorderColor, 15),
                      border: `1px dashed ${borderSubtle}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    📷
                  </div>
                )}
                {/* Extra image thumbnails */}
                {p.images && p.images.length > 1 && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", width: 112 }}>
                    {p.images.slice(1).map((img) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={img}
                        src={`/products/${img}`}
                        alt=""
                        style={{
                          width: 32,
                          height: 26,
                          objectFit: "cover",
                          borderRadius: 4,
                          border: `1px solid ${borderSubtle}`,
                          opacity: 0.8,
                        }}
                      />
                    ))}
                  </div>
                )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: settings.panelTitleColor }}>
                    {p.name}
                    {p.category === "frame" && p.frameType && (
                      <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 900, color: "#ffd700", letterSpacing: "0.04em" }}>
                        {p.frameType === "DC/X" ? "DC/X" : p.frameType}
                      </span>
                    )}
                    {!p.inStock && (
                      <span style={{ marginLeft: 8, fontSize: 11, color: "#e05252", fontWeight: 400 }}>niedostępny</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: settings.panelTextColor, marginTop: 2 }}>
                    {p.category === "frame" && p.frameType && `Typ: ${p.frameType}${p.color ? " · " + p.color : ""}${p.includesStraps ? " · paski w zestawie" : ""} · `}
                    {p.category === "motor" && (p.kvOptions?.length ? p.kvOptions.join(" / ") + " kV · " : p.kv ? `${p.kv} kV · ` : "")}
                    {p.category === "motor" && p.cellCount && `${p.cellCount.toUpperCase()} · `}
                    {p.category === "battery" && p.cellCount && `${p.cellCount.toUpperCase()} · `}
                    {p.category === "propeller" && p.pitch != null && `Skok ${p.pitch} · `}
                    {p.category === "antenna" && p.polarization && `${p.polarization} · `}
                    {(p.category === "video_bundle" || p.category === "camera" || p.category === "vtx") && p.videoType && `${p.videoType === "analog" ? "Analog" : "Digital"} · `}
                    {p.description}
                  </div>
                </div>

                {/* Price */}
                <div style={{ fontWeight: 700, fontSize: 16, color: settings.panelSubtitleColor, flexShrink: 0 }}>
                  {p.price.toFixed(2)} zł
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => openEdit(p)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 8,
                      border: `1px solid ${borderSubtle}`,
                      backgroundColor: "transparent",
                      color: settings.panelTextColor,
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Edytuj
                  </button>
                  {deleteConfirm === p.id ? (
                    <>
                      <button
                        onClick={() => handleDelete(p.id)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          border: "none",
                          backgroundColor: "#8b1a1a",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        Potwierdź
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 8,
                          border: `1px solid ${borderSubtle}`,
                          backgroundColor: "transparent",
                          color: settings.panelTextColor,
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        Anuluj
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(p.id)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        border: `1px solid #8b1a1a`,
                        backgroundColor: "transparent",
                        color: "#e05252",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Usuń
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox overlay */}
      {lightboxData && (
        <div
          onClick={() => setLightboxData(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            cursor: "zoom-out",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/products/${lightboxData.images[lightboxData.activeIdx]}`}
            alt=""
            style={{
              maxWidth: "90vw",
              maxHeight: lightboxData.images.length > 1 ? "calc(90vh - 72px)" : "90vh",
              objectFit: "contain",
              borderRadius: 10,
              boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
              pointerEvents: "none",
            }}
          />
          {lightboxData.images.length > 1 && (
            <div
              style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}
              onClick={(e) => e.stopPropagation()}
            >
              {lightboxData.images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img}
                  src={`/products/${img}`}
                  alt=""
                  onClick={(e) => { e.stopPropagation(); setLightboxData((prev) => prev ? { ...prev, activeIdx: i } : null); }}
                  style={{
                    width: 60,
                    height: 48,
                    objectFit: "cover",
                    borderRadius: 6,
                    cursor: "pointer",
                    border: i === lightboxData.activeIdx ? "2px solid #fff" : "2px solid rgba(255,255,255,0.25)",
                    opacity: i === lightboxData.activeIdx ? 1 : 0.55,
                    transition: "all 0.12s",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Form field wrapper ────────────────────────────────────────────────────

function FormField({
  label,
  settings,
  children,
}: {
  label: string;
  settings: HomepageSettings;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, color: settings.panelTextColor, fontWeight: 600, letterSpacing: 0.5 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function inputStyle(settings: HomepageSettings): React.CSSProperties {
  return {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    border: `1px solid ${hexToRgba(settings.panelBorderColor, 50)}`,
    backgroundColor: hexToRgba(settings.sliderBgColor, 90),
    color: settings.panelTitleColor,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };
}

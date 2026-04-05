"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  hexToRgba,
} from "../lib/settings";
import type { HomepageSettings } from "../lib/settings";

const PRESETS: Record<string, HomepageSettings> = {
  "Mario": { ...DEFAULT_SETTINGS, panelTitleColor: "#9D2FC1", subpageTitleColor: "#9D2FC1" }, // default dark military
  "Sky": {
    ...DEFAULT_SETTINGS,
    panelBgColor: "#0A1628",
    panelOpacity: "85",
    panelBorderColor: "#1E5FA8",
    panelTitleColor: "#E8F4FD",
    subpageTitleColor: "#E8F4FD",
    panelSubtitleColor: "#4DB8FF",
    panelTextColor: "#8BB8D4",
    sliderBgColor: "#0D1F35",
    sliderBorderColor: "#1E5FA8",
    advantageBgColor: "#1E5FA8",
    infoTextColor: "#8BB8D4",
  },
  "Zachód": {
    ...DEFAULT_SETTINGS,
    panelBgColor: "#1A0A00",
    panelOpacity: "85",
    panelBorderColor: "#8B3000",
    panelTitleColor: "#FFF5E6",
    subpageTitleColor: "#FFF5E6",
    panelSubtitleColor: "#FF6B1A",
    panelTextColor: "#C4936A",
    sliderBgColor: "#200D00",
    sliderBorderColor: "#8B3000",
    advantageBgColor: "#8B3000",
    infoTextColor: "#C4936A",
  },
  "Ciemny": {
    ...DEFAULT_SETTINGS,
    panelBgColor: "#1A1A1A",
    panelOpacity: "85",
    panelBorderColor: "#555555",
    panelTitleColor: "#F0F0F0",
    subpageTitleColor: "#F0F0F0",
    panelSubtitleColor: "#A8A8A8",
    panelTextColor: "#787878",
    sliderBgColor: "#111111",
    sliderBorderColor: "#444444",
    advantageBgColor: "#2E2E2E",
    infoTextColor: "#909090",
  },
  "Jasny": {
    ...DEFAULT_SETTINGS,
    panelBgColor: "#F5F5F0",
    panelOpacity: "90",
    panelBorderColor: "#B0A898",
    panelTitleColor: "#1A1A1A",
    subpageTitleColor: "#FFFFFF",
    panelSubtitleColor: "#7A5C2E",
    panelTextColor: "#4A4A4A",
    sliderBgColor: "#E8E5DF",
    sliderBorderColor: "#B0A898",
    advantageBgColor: "#D6D0C4",
    infoTextColor: "#5A5A5A",
  },
};

// Resize image to max 1920×1080, JPEG 85% quality
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX_W = 1920,
        MAX_H = 1080;
      let w = img.width,
        h = img.height;
      if (w > MAX_W || h > MAX_H) {
        const ratio = Math.min(MAX_W / w, MAX_H / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("canvas context")); return; }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = url;
  });
}


// ─── Media Panel ────────────────────────────────────────────────────────────

type MediaFolder = "panel_1_home" | "slider" | "videos";

// Resize image to max 1920×1080 JPEG 85% and return as File
function resizeImageFile(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX_W = 1920, MAX_H = 1080;
      let w = img.width, h = img.height;
      if (w > MAX_W || h > MAX_H) {
        const ratio = Math.min(MAX_W / w, MAX_H / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(url);
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => {
        if (!blob) { resolve(file); return; }
        const outName = file.name.replace(/\.[^.]+$/, ".jpg");
        resolve(new File([blob], outName, { type: "image/jpeg" }));
      }, "image/jpeg", 0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

function MediaPanel({
  folder,
  accept,
  canSort = false,
  canCaption = false,
  saveLabel = "Zapisz zmiany",
  settings,
  borderSubtle,
}: {
  folder: MediaFolder;
  accept: string;
  canSort?: boolean;
  canCaption?: boolean;
  saveLabel?: string;
  settings: HomepageSettings;
  borderSubtle: string;
}) {
  const [files, setFiles] = useState<string[]>([]);
  const [savedFiles, setSavedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOverDrop, setDragOverDrop] = useState(false);
  const [sortDragIdx, setSortDragIdx] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const [savedCaptions, setSavedCaptions] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isVideo = folder === "videos";

  const loadFiles = () => {
    setLoading(true);
    fetch(`/api/media?folder=${folder}`)
      .then((r) => r.json())
      .then((data: { files?: string[] }) => {
        const f = data.files ?? [];
        setFiles(f);
        setSavedFiles(f);
      })
      .catch(() => { setFiles([]); setSavedFiles([]); })
      .finally(() => setLoading(false));
  };

  const loadCaptions = () => {
    fetch(`/api/media/captions?folder=${folder}`)
      .then((r) => r.json())
      .then((data: { captions?: Record<string, string> }) => {
        const c = data.captions ?? {};
        setCaptions(c);
        setSavedCaptions(c);
      })
      .catch(() => {});
  };

  useEffect(() => { loadFiles(); if (canCaption) loadCaptions(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveCaptionsData = async (newCaptions: Record<string, string>) => {
    await fetch("/api/media/captions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder, captions: newCaptions }),
    });
    setSavedCaptions(newCaptions);
  };

  const saveOrderData = async (newOrder: string[]) => {
    await fetch("/api/media/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder, order: newOrder }),
    });
    setSavedFiles(newOrder);
  };

  const captionsChanged = JSON.stringify(captions) !== JSON.stringify(savedCaptions);
  const orderChanged = JSON.stringify(files) !== JSON.stringify(savedFiles);
  const hasChanges = captionsChanged || orderChanged;

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      if (captionsChanged) await saveCaptionsData(captions);
      if (orderChanged) await saveOrderData(files);
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    let fileToUpload = file;
    if (!isVideo && file.type.startsWith("image/")) {
      fileToUpload = await resizeImageFile(file);
    }
    const fd = new FormData();
    fd.append("file", fileToUpload);
    fd.append("folder", folder);
    try {
      const res = await fetch("/api/media/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      loadFiles();
    } catch {
      alert("Błąd przesyłania pliku");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer.types.includes("Files")) return;
    setDragOverDrop(false);
    Array.from(e.dataTransfer.files).forEach((f) => uploadFile(f));
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    await uploadFile(file);
  };

  const handleDelete = async (filename: string) => {
    try {
      const res = await fetch(
        `/api/media?folder=${folder}&filename=${encodeURIComponent(filename)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      setDeleteConfirm(null);
      if (canCaption) {
        const newCaptions = { ...captions };
        delete newCaptions[filename];
        setCaptions(newCaptions);
        await saveCaptionsData(newCaptions);
      }
      loadFiles(); // resets both files + savedFiles from server
    } catch {
      alert("Błąd usuwania pliku");
    }
  };

  // ─── Drag-to-reorder handlers ───────────────────────────────────────────
  const handleSortDragStart = (e: React.DragEvent, idx: number) => {
    setSortDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));
  };

  const handleSortDragEnter = (idx: number) => {
    if (sortDragIdx === null || sortDragIdx === idx) return;
    setFiles((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(sortDragIdx, 1);
      copy.splice(idx, 0, item);
      return copy;
    });
    setSortDragIdx(idx);
  };

  const handleSortDragEnd = (currentFiles: string[]) => {
    // just clear drag state — order persisted on explicit save
    setSortDragIdx(null);
    // keep currentFiles in state so orderChanged is detected
    setFiles(currentFiles);
  };

  const thumbW = isVideo ? 160 : 135;
  const thumbH = isVideo ? 90 : 108;
  const bs = borderSubtle;

  return (
    <div>
      {loading ? (
        <p style={{ color: settings.panelTextColor, padding: "6px 0", fontSize: 13 }}>Ładowanie...</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-start" }}>
          {files.map((filename, idx) => (
            // Outer wrapper: never draggable — contains dragZone + caption input as siblings
            <div key={filename} style={{ width: thumbW }}>
              {/* Drag zone — only this div is draggable */}
              <div
                draggable={canSort}
                onDragStart={canSort ? (e) => handleSortDragStart(e, idx) : undefined}
                onDragEnter={canSort ? () => handleSortDragEnter(idx) : undefined}
                onDragOver={canSort ? (e) => e.preventDefault() : undefined}
                onDragEnd={canSort ? () => handleSortDragEnd(files) : undefined}
                style={{
                  position: "relative",
                  width: thumbW,
                  opacity: sortDragIdx === idx ? 0.4 : 1,
                  cursor: canSort ? "grab" : "default",
                  transition: "opacity 0.15s",
                }}
              >
                {canSort && (
                  <div
                    style={{
                      position: "absolute",
                      top: 3,
                      left: 3,
                      zIndex: 2,
                      color: "#fff",
                      background: "rgba(0,0,0,0.55)",
                      borderRadius: 3,
                      padding: "1px 3px",
                      fontSize: 10,
                      lineHeight: 1,
                      pointerEvents: "none",
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    ⠿
                  </div>
                )}
                {isVideo ? (
                  <video
                    src={`/${folder}/${encodeURIComponent(filename)}`}
                    style={{
                      width: thumbW,
                      height: thumbH,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: `1px solid ${bs}`,
                      display: "block",
                    }}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/${folder}/${encodeURIComponent(filename)}`}
                    alt={filename}
                    style={{
                      width: thumbW,
                      height: thumbH,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: sortDragIdx === idx
                        ? `2px dashed ${settings.panelSubtitleColor}`
                        : `1px solid ${bs}`,
                      display: "block",
                    }}
                  />
                )}
                <div
                  style={{
                    position: "absolute",
                    bottom: 4,
                    left: 4,
                    right: 4,
                    fontSize: 9,
                    color: "#fff",
                    background: "rgba(0,0,0,0.65)",
                    borderRadius: 3,
                    padding: "1px 4px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                  }}
                >
                  {filename}
                </div>
                {deleteConfirm === filename ? (
                  <div style={{ position: "absolute", top: -6, right: -6, display: "flex", gap: 3 }}>
                    <button
                      onClick={() => handleDelete(filename)}
                      style={{
                        width: 20, height: 20, borderRadius: "50%", border: "none",
                        backgroundColor: "#c0392b", color: "#fff", cursor: "pointer",
                        fontSize: 11, display: "flex", alignItems: "center",
                        justifyContent: "center", padding: 0, fontWeight: 700,
                      }}
                    >✓</button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      style={{
                        width: 20, height: 20, borderRadius: "50%", border: "none",
                        backgroundColor: "#555", color: "#fff", cursor: "pointer",
                        fontSize: 11, display: "flex", alignItems: "center",
                        justifyContent: "center", padding: 0,
                      }}
                    >✕</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(filename)}
                    style={{
                      position: "absolute", top: -6, right: -6, width: 18, height: 18,
                      borderRadius: "50%", border: "none", backgroundColor: "#c0392b",
                      color: "#fff", cursor: "pointer", fontSize: 11, lineHeight: 1,
                      display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                    }}
                  >×</button>
                )}
              </div>{/* end drag zone */}
              {/* Caption input — outside draggable container, fully interactive */}
              {canCaption && (
                <input
                  value={captions[filename] ?? ""}
                  placeholder="Podpis…"
                  maxLength={200}
                  onChange={(e) => setCaptions((prev) => ({ ...prev, [filename]: e.target.value }))}
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: 5,
                    fontSize: 10,
                    padding: "3px 6px",
                    borderRadius: 4,
                    border: `1px solid ${bs}`,
                    background: "rgba(0,0,0,0.35)",
                    color: "#e0e0e0",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              )}
            </div>
          ))}

          {/* Drop zone / add slot */}
          <div
            onDragOver={(e) => {
              if (e.dataTransfer.types.includes("Files")) {
                e.preventDefault();
                setDragOverDrop(true);
              }
            }}
            onDragLeave={() => setDragOverDrop(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              width: thumbW,
              height: thumbH,
              borderRadius: 8,
              border: `2px dashed ${dragOverDrop ? settings.panelSubtitleColor : bs}`,
              backgroundColor: dragOverDrop
                ? hexToRgba(settings.panelSubtitleColor, 12)
                : "transparent",
              color: dragOverDrop ? settings.panelSubtitleColor : settings.panelTextColor,
              cursor: uploading ? "wait" : "pointer",
              fontSize: uploading ? 10 : 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
              userSelect: "none",
            }}
          >
            {uploading ? "…" : "+"}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            style={{ display: "none" }}
            onChange={handleFileInput}
          />
        </div>
      )}      {/* Save button — shown when there are any unsaved changes (order or captions) */}
      {(canSort || canCaption) && !loading && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={handleSaveAll}
            disabled={!hasChanges || saving}
            style={{
              background: hasChanges ? settings.panelSubtitleColor : "rgba(255,255,255,0.1)",
              color: hasChanges ? "#111" : hexToRgba(settings.panelTextColor, 50),
              border: "none",
              borderRadius: 8,
              padding: "8px 20px",
              fontWeight: 700,
              fontSize: 12,
              cursor: hasChanges && !saving ? "pointer" : "default",
              letterSpacing: "0.05em",
              transition: "all 0.15s",
            }}
          >
            {saving ? "Zapisywanie…" : saveLabel}
          </button>
          {hasChanges && !saving && (
            <>
              <button
                onClick={() => { setFiles(savedFiles); setCaptions(savedCaptions); }}
                style={{
                  background: "transparent",
                  color: hexToRgba(settings.panelTextColor, 70),
                  border: `1px solid ${hexToRgba(settings.panelBorderColor, 40)}`,
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontWeight: 500,
                  fontSize: 12,
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  transition: "all 0.15s",
                }}
              >
                Nie zapisuj
              </button>
              <span style={{ fontSize: 11, color: settings.panelSubtitleColor }}>● niezapisane zmiany</span>
            </>
          )}
        </div>
      )}    </div>
  );
}

// ─── Color row ────────────────────────────────────────────────────────────────

function SettingsColorRow({
  label,
  colorKey,
  settings,
  borderSubtle,
  onChange,
}: {
  label: string;
  colorKey: keyof HomepageSettings;
  settings: HomepageSettings;
  borderSubtle: string;
  onChange: (key: keyof HomepageSettings, value: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "11px 16px",
        borderRadius: 10,
        backgroundColor: hexToRgba(settings.sliderBgColor, 60),
        border: `1px solid ${borderSubtle}`,
        gap: 14,
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontSize: 13, color: settings.panelTextColor, fontWeight: 500 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <input
          type="color"
          value={settings[colorKey] as string}
          onChange={(e) => onChange(colorKey, e.target.value)}
          style={{
            width: 34,
            height: 30,
            padding: 2,
            borderRadius: 4,
            border: `1px solid ${borderSubtle}`,
            background: "transparent",
            cursor: "pointer",
          }}
        />
        <input
          type="text"
          value={settings[colorKey] as string}
          onChange={(e) => onChange(colorKey, e.target.value)}
          style={{
            width: 90,
            background: hexToRgba(settings.sliderBgColor, 90),
            border: `1px solid ${borderSubtle}`,
            color: settings.panelTitleColor,
            fontSize: 12,
            fontFamily: "monospace",
            borderRadius: 6,
            padding: "4px 8px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>
    </div>
  );
}


export default function SettingsClient() {
  const [settings, setSettings] = useState<HomepageSettings>(DEFAULT_SETTINGS);
  const [bgFileName, setBgFileName] = useState("");
  const [saved, setSaved] = useState(false);

  const panelStyle: React.CSSProperties = {
    border: `2px solid ${settings.panelBorderColor}`,
    backgroundColor: hexToRgba(settings.panelBgColor, parseInt(settings.panelOpacity)),
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  };
  const borderSubtle = hexToRgba(settings.panelBorderColor, 35);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed: HomepageSettings = {
          ...DEFAULT_SETTINGS,
          ...JSON.parse(stored),
        };
        setSettings(parsed);
        if (parsed.bgDataUrl) setBgFileName("(plik załadowany)");
      }
    } catch {
      /* ignore */
    }
  }, []);

  function set(key: keyof HomepageSettings, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleBgFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImage(file);
      set("bgDataUrl", dataUrl);
      setBgFileName(file.name);
    } catch {
      alert("Nie udało się wczytać pliku.");
    }
  }

  function clearBg() {
    set("bgDataUrl", "");
    setBgFileName("");
  }

  function handleSave() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert(
        "Nie można zapisać ustawień – plik tła może być zbyt duży. Spróbuj z mniejszym zdjęciem."
      );
    }
  }

  function applyPreset(name: string) {
    const preset = PRESETS[name];
    if (!preset) return;
    const merged = { ...preset, bgApplyToSubpages: settings.bgApplyToSubpages, panelBgApplyToSubpages: true };
    setSettings(merged);
    setBgFileName("");
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaved(false);
    }
  }

  const sectionTitle = (text: string) => (
    <h3
      style={{
        color: settings.panelTitleColor,
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: 2,
        textTransform: "uppercase",
        margin: "0 0 16px",
      }}
    >
      {text}
    </h3>
  );

  const rowBg = hexToRgba(settings.sliderBgColor, 60);

  return (
    <div style={{ width: "100%", maxWidth: 900, margin: "0 auto", padding: "0 16px 60px" }}>

        {/* Presety */}
        <div style={{ ...panelStyle, borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
          {sectionTitle("Szybkie presety")}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {Object.keys(PRESETS).map((name) => (
              <button
                key={name}
                onClick={() => applyPreset(name)}
                style={{
                  background: "transparent",
                  color: settings.panelTextColor,
                  border: `1px solid ${borderSubtle}`,
                  borderRadius: 20,
                  padding: "7px 20px",
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Wygląd – scalony panel */}
        <div style={{ ...panelStyle, borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
          {sectionTitle("Wygląd i ustawienia")}

          {/* Tło strony */}
          <p style={{ fontSize: 11, color: settings.panelSubtitleColor, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>Tło strony</p>
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 10,
              backgroundColor: rowBg,
              border: `1px solid ${borderSubtle}`,
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: hexToRgba(settings.sliderBgColor, 90),
                  border: `1px solid ${borderSubtle}`,
                  color: settings.panelTextColor,
                  padding: "7px 16px",
                  borderRadius: 8,
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Wybierz plik z dysku
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBgFile}
                  style={{ display: "none" }}
                />
              </label>
              {bgFileName ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: settings.panelSubtitleColor, fontSize: 12 }}>{bgFileName}</span>
                  <button
                    onClick={clearBg}
                    style={{
                      color: "#e05252",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      padding: 0,
                    }}
                  >
                    ✕ Usuń
                  </button>
                </div>
              ) : (
                <span style={{ color: hexToRgba(settings.panelBorderColor, 55), fontSize: 12 }}>
                  Domyślnie: /images/background.jpg
                </span>
              )}
            </div>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                fontSize: 13,
                color: settings.bgApplyToSubpages ? settings.panelTextColor : hexToRgba(settings.panelBorderColor, 60),
                marginTop: 12,
              }}
            >
              <input
                type="checkbox"
                checked={settings.bgApplyToSubpages}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, bgApplyToSubpages: e.target.checked }))
                }
                style={{ accentColor: settings.panelSubtitleColor, width: 15, height: 15, cursor: "pointer" }}
              />
              Zastosuj tło do podstron
            </label>
          </div>

          {/* Kolory paneli */}
          <p style={{ fontSize: 11, color: settings.panelSubtitleColor, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>Kolory paneli</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>

            {/* Panel bg color */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "11px 16px",
                borderRadius: 10,
                backgroundColor: rowBg,
                border: `1px solid ${borderSubtle}`,
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 13, color: settings.panelTextColor, fontWeight: 500 }}>
                  Kolor tła header, footer i paneli
                </span>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    cursor: "pointer",
                    fontSize: 12,
                    color: settings.panelBgApplyToSubpages
                      ? settings.panelTextColor
                      : hexToRgba(settings.panelBorderColor, 60),
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.panelBgApplyToSubpages}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, panelBgApplyToSubpages: e.target.checked }))
                    }
                    style={{ accentColor: settings.panelSubtitleColor, width: 14, height: 14, cursor: "pointer" }}
                  />
                  Zastosuj do podstron
                </label>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <input
                  type="color"
                  value={settings.panelBgColor}
                  onChange={(e) => set("panelBgColor", e.target.value)}
                  style={{
                    width: 34,
                    height: 30,
                    padding: 2,
                    borderRadius: 4,
                    border: `1px solid ${borderSubtle}`,
                    background: "transparent",
                    cursor: "pointer",
                  }}
                />
                <input
                  type="text"
                  value={settings.panelBgColor}
                  onChange={(e) => set("panelBgColor", e.target.value)}
                  style={{
                    width: 90,
                    background: hexToRgba(settings.sliderBgColor, 90),
                    border: `1px solid ${borderSubtle}`,
                    color: settings.panelTitleColor,
                    fontSize: 12,
                    fontFamily: "monospace",
                    borderRadius: 6,
                    padding: "4px 8px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Panel opacity */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "11px 16px",
                borderRadius: 10,
                backgroundColor: rowBg,
                border: `1px solid ${borderSubtle}`,
                gap: 14,
              }}
            >
              <span style={{ fontSize: 13, color: settings.panelTextColor, fontWeight: 500 }}>
                Przezroczystość paneli
              </span>
              <select
                value={settings.panelOpacity}
                onChange={(e) => set("panelOpacity", e.target.value)}
                style={{
                  background: hexToRgba(settings.sliderBgColor, 90),
                  border: `1px solid ${borderSubtle}`,
                  color: settings.panelTitleColor,
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontSize: 13,
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="20">20%</option>
                <option value="40">40%</option>
                <option value="60">60%</option>
                <option value="80">80%</option>
              </select>
            </div>

            <SettingsColorRow label="Kolor ramek paneli" colorKey="panelBorderColor" settings={settings} borderSubtle={borderSubtle} onChange={set} />
            <SettingsColorRow label="Kolor tytułu (panel + nagłówek strony home)" colorKey="panelTitleColor" settings={settings} borderSubtle={borderSubtle} onChange={set} />
            <SettingsColorRow label="Kolor tytułu nagłówka podstron" colorKey="subpageTitleColor" settings={settings} borderSubtle={borderSubtle} onChange={set} />
            <SettingsColorRow label="Kolor podtytułu w panelu i nagłówku" colorKey="panelSubtitleColor" settings={settings} borderSubtle={borderSubtle} onChange={set} />
            <SettingsColorRow label="Kolor tekstu w panelu" colorKey="panelTextColor" settings={settings} borderSubtle={borderSubtle} onChange={set} />
          </div>

          {/* Slider i elementy */}
          <p style={{ fontSize: 11, color: settings.panelSubtitleColor, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>Slider i elementy</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            <SettingsColorRow label="Kolor tła slidera i tła przycisków" colorKey="sliderBgColor" settings={settings} borderSubtle={borderSubtle} onChange={set} />
            <SettingsColorRow label="Kolor ramek zdjęć w sliderze" colorKey="sliderBorderColor" settings={settings} borderSubtle={borderSubtle} onChange={set} />
            <SettingsColorRow label='Kolor tekstu panelu "Informacje"' colorKey="infoTextColor" settings={settings} borderSubtle={borderSubtle} onChange={set} />
          </div>

          {/* Zapisz ustawienia */}
          <button
            onClick={handleSave}
            style={{
              background: settings.panelSubtitleColor,
              color: "#111",
              border: "none",
              borderRadius: 10,
              padding: "13px 32px",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              letterSpacing: "0.06em",
              width: "100%",
            }}
          >
            Zapisz ustawienia
          </button>
          {saved && (
            <span style={{ display: "block", color: settings.panelSubtitleColor, fontSize: 13, textAlign: "center", marginTop: 8 }}>
              ✓ Zapisano — odśwież stronę główną, aby zobaczyć zmiany
            </span>
          )}
        </div>

        {/* Media – Panel 1 strony home */}
        <div style={{ ...panelStyle, borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
          {sectionTitle("Panel 1 – strona home (zdjęcia)")}
          <p style={{ fontSize: 12, color: settings.panelTextColor, marginBottom: 14, marginTop: -8 }}>
            Zdjęcia wyświetlane w panelu 1 na stronie głównej. Przeciągnij lub kliknij "+" aby dodać.
          </p>
          <MediaPanel folder="panel_1_home" accept="image/jpeg,image/png,image/webp,image/gif" canSort saveLabel="Zapisz zmiany w panelu 1" settings={settings} borderSubtle={borderSubtle} />
        </div>

        {/* Media – Slider strony home */}
        <div style={{ ...panelStyle, borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
          {sectionTitle("Slider – strona home (zdjęcia)")}
          <p style={{ fontSize: 12, color: settings.panelTextColor, marginBottom: 14, marginTop: -8 }}>
            Zdjęcia wyświetlane w sliderze na stronie głównej.
          </p>
          <MediaPanel folder="slider" accept="image/jpeg,image/png,image/webp,image/gif" canSort canCaption saveLabel="Zapisz zmiany w sliderze" settings={settings} borderSubtle={borderSubtle} />
        </div>

        {/* Media – Filmy Warsztaty */}
        <div style={{ ...panelStyle, borderRadius: 16, padding: "20px 24px", marginBottom: 28 }}>
          {sectionTitle("Warsztaty – filmy")}
          <p style={{ fontSize: 12, color: settings.panelTextColor, marginBottom: 14, marginTop: -8 }}>
            Filmy wideo wyświetlane na stronie Warsztaty (mp4, mov, webm – max 200 MB).
          </p>
          <MediaPanel folder="videos" accept="video/mp4,video/quicktime,video/webm,video/*" canSort canCaption saveLabel="Zapisz zmiany w filmach" settings={settings} borderSubtle={borderSubtle} />
        </div>

        <p style={{ marginTop: 20, fontSize: 12, color: hexToRgba(settings.panelBorderColor, 60), lineHeight: 1.7 }}>
          Ustawienia przechowywane lokalnie w przeglądarce (localStorage).
          Zdjęcie tła jest skalowane do max 1920×1080 przed zapisem.
        </p>
      </div>
  );
}

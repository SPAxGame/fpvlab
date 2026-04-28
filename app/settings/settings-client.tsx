"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  PRESET_BACKGROUNDS_KEY,
  hexToRgba,
} from "../lib/settings";
import type { HomepageSettings } from "../lib/settings";

const PRESETS: Record<string, HomepageSettings> = {
  "Mario": { ...DEFAULT_SETTINGS, panelTitleColor: "#9D2FC1", subpageTitleColor: "#9D2FC1" }, // default dark military
  "Sky": {
    ...DEFAULT_SETTINGS,
    panelBgColor: "#0A1628",
    panelOpacity: "60",
    panelBorderColor: "#4A8CC8",
    panelTitleColor: "#E8F4FD",
    subpageTitleColor: "#E8F4FD",
    panelSubtitleColor: "#5BC4FF",
    panelTextColor: "#A8D0E8",
    sliderBgColor: "#0D1F35",
    sliderBorderColor: "#4A8CC8",
    advantageBgColor: "#1E5FA8",
    infoTextColor: "#A8D0E8",
  },
  "Zachód": {
    ...DEFAULT_SETTINGS,
    panelBgColor: "#1A0A00",
    panelOpacity: "60",
    panelBorderColor: "#C05010",
    panelTitleColor: "#FFF5E6",
    subpageTitleColor: "#FFF5E6",
    panelSubtitleColor: "#FF8040",
    panelTextColor: "#D8A87C",
    sliderBgColor: "#200D00",
    sliderBorderColor: "#C05010",
    advantageBgColor: "#8B3000",
    infoTextColor: "#D8A87C",
  },
  "Ciemny": {
    ...DEFAULT_SETTINGS,
    panelBgColor: "#1A1A1A",
    panelOpacity: "60",
    panelBorderColor: "#707070",
    panelTitleColor: "#F0F0F0",
    subpageTitleColor: "#F0F0F0",
    panelSubtitleColor: "#C0C0C0",
    panelTextColor: "#A8A8A8",
    sliderBgColor: "#111111",
    sliderBorderColor: "#606060",
    advantageBgColor: "#2E2E2E",
    infoTextColor: "#A8A8A8",
  },
  "Jasny": {
    ...DEFAULT_SETTINGS,
    panelBgColor: "#F5F5F0",
    panelOpacity: "60",
    panelBorderColor: "#7A6C5C",
    panelTitleColor: "#1A1A1A",
    subpageTitleColor: "#FFFFFF",
    panelSubtitleColor: "#6A4C1E",
    panelTextColor: "#4A4A4A",
    sliderBgColor: "#E8E5DF",
    sliderBorderColor: "#7A6C5C",
    advantageBgColor: "#C8C0B4",
    infoTextColor: "#4A4A4A",
  },
};

const PRESET_BG_DEFAULTS: Record<string, string> = {
  "Mario":  "/images/background_mario.jpg",
  "Sky":    "/images/background_sky.jpg",
  "Zachód": "/images/background_zachod.jpg",
  "Ciemny": "/images/background_ciemny.jpg",
  "Jasny":  "/images/background_jasny.jpg",
};

const CUSTOM_PRESETS_KEY = "fpv-custom-presets";

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

type MediaFolder = "panel_1_home" | "slider" | "videos" | "panel_drony_fpv";

// Resize image to max 1920×1080 and return as File.
// PNGs are kept as PNG to preserve transparency; other formats are converted to JPEG 85%.
function resizeImageFile(file: File): Promise<File> {
  return new Promise((resolve) => {
    const isPng = file.type === "image/png";
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
      if (isPng) {
        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name, { type: "image/png" }));
        }, "image/png");
      } else {
        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return; }
          const outName = file.name.replace(/\.[^.]+$/, ".jpg");
          resolve(new File([blob], outName, { type: "image/jpeg" }));
        }, "image/jpeg", 0.85);
      }
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
                      border: `2px solid ${hexToRgba(settings.panelBorderColor, 60)}`,
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
                        : `2px solid ${hexToRgba(settings.panelBorderColor, 60)}`,
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
  const [presetBgs, setPresetBgs] = useState<Record<string, string>>({ ...PRESET_BG_DEFAULTS });
  const [savedPresetBgs, setSavedPresetBgs] = useState<Record<string, string>>({ ...PRESET_BG_DEFAULTS });
  const [presetBgFileNames, setPresetBgFileNames] = useState<Record<string, string>>({});
  const [presetBgRowSaved, setPresetBgRowSaved] = useState<Record<string, boolean>>({});
  const [customPresets, setCustomPresets] = useState<Record<string, HomepageSettings>>({});
  const [newPresetName, setNewPresetName] = useState("");

  const panelStyle: React.CSSProperties = {
    border: `1px solid ${hexToRgba(settings.panelBorderColor, 30)}`,
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
      const storedPresetBgs = localStorage.getItem(PRESET_BACKGROUNDS_KEY);
      if (storedPresetBgs) {
        const merged = { ...PRESET_BG_DEFAULTS, ...JSON.parse(storedPresetBgs) };
        setPresetBgs(merged);
        setSavedPresetBgs(merged);
      }
      const storedCustom = localStorage.getItem(CUSTOM_PRESETS_KEY);
      if (storedCustom) setCustomPresets(JSON.parse(storedCustom));
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
    const presetBg = presetBgs[name] ?? PRESET_BG_DEFAULTS[name] ?? "";
    const isDataUrl = presetBg.startsWith("data:");
    const merged = {
      ...preset,
      bgApplyToSubpages: settings.bgApplyToSubpages,
      panelBgApplyToSubpages: true,
      bgDataUrl: isDataUrl ? presetBg : "",
      bgImagePath: isDataUrl ? "" : presetBg,
    };
    setSettings(merged);
    setBgFileName(isDataUrl ? (presetBgFileNames[name] ?? "(plik załadowany)") : "");
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
      window.location.reload();
    } catch {
      setSaved(false);
    }
  }

  async function handlePresetBgFile(e: ChangeEvent<HTMLInputElement>, presetName: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const dataUrl = await resizeImage(file);
      setPresetBgs((prev) => ({ ...prev, [presetName]: dataUrl }));
      setPresetBgFileNames((prev) => ({ ...prev, [presetName]: file.name }));
    } catch {
      alert("Nie udało się wczytać pliku.");
    }
  }

  function resetPresetBg(presetName: string) {
    setPresetBgs((prev) => ({ ...prev, [presetName]: PRESET_BG_DEFAULTS[presetName] ?? "" }));
    setPresetBgFileNames((prev) => {
      const next = { ...prev };
      delete next[presetName];
      return next;
    });
  }

  function savePresetBg(presetName: string) {
    try {
      localStorage.setItem(PRESET_BACKGROUNDS_KEY, JSON.stringify(presetBgs));
      setSavedPresetBgs({ ...presetBgs });
      setPresetBgRowSaved((prev) => ({ ...prev, [presetName]: true }));
      setTimeout(() => setPresetBgRowSaved((prev) => ({ ...prev, [presetName]: false })), 2500);
    } catch {
      alert("Nie można zapisać – plik tła może być zbyt duży. Spróbuj z mniejszym zdjęciem.");
    }
  }

  function saveAsCustomPreset() {
    const name = newPresetName.trim();
    if (!name) return;
    const presetToSave = { ...settings, bgDataUrl: "" };
    const updated = { ...customPresets, [name]: presetToSave };
    setCustomPresets(updated);
    try {
      localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(updated));
    } catch {
      alert("Nie można zapisać presetu – spróbuj bez zdjęcia tła.");
    }
    setNewPresetName("");
  }

  function deleteCustomPreset(name: string) {
    const updated = { ...customPresets };
    delete updated[name];
    setCustomPresets(updated);
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(updated));
  }

  function applyCustomPreset(name: string) {
    const preset = customPresets[name];
    if (!preset) return;
    const presetBg = presetBgs[name] ?? "";
    const isDataUrl = presetBg.startsWith("data:");
    const merged = {
      ...DEFAULT_SETTINGS,
      ...preset,
      bgDataUrl: isDataUrl ? presetBg : "",
      bgImagePath: isDataUrl ? "" : presetBg,
    };
    setSettings(merged);
    setBgFileName(isDataUrl ? "(plik załadowany)" : "");
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
      window.location.reload();
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
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/propeller_ico.png" alt="" style={{ width: 16, height: 16, minWidth: 16, objectFit: "contain" }} />
      {text}
    </h3>
  );

  const rowBg = hexToRgba(settings.sliderBgColor, 60);

  return (
    <div style={{ width: "100%", padding: "0 0 60px" }}>

        {/* Presety */}
        <div style={{ ...panelStyle, borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
          {sectionTitle("Szybkie presety")}
          <p style={{ fontSize: 11, color: settings.panelSubtitleColor, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>Wbudowane</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
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
          <p style={{ fontSize: 11, color: settings.panelSubtitleColor, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>Własne presety</p>
          {Object.keys(customPresets).length > 0 ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
              {Object.keys(customPresets).map((name) => (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: `1px solid ${borderSubtle}`,
                    borderRadius: 20,
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => applyCustomPreset(name)}
                    style={{
                      background: "transparent",
                      color: settings.panelTextColor,
                      border: "none",
                      borderRight: `1px solid ${borderSubtle}`,
                      padding: "7px 16px",
                      fontSize: 13,
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    {name}
                  </button>
                  <button
                    onClick={() => deleteCustomPreset(name)}
                    title="Usuń preset"
                    style={{
                      background: "transparent",
                      color: hexToRgba(settings.panelTextColor, 60),
                      border: "none",
                      padding: "7px 10px",
                      fontSize: 15,
                      cursor: "pointer",
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: hexToRgba(settings.panelTextColor, 50), marginBottom: 12, marginTop: 0 }}>
              Brak własnych presetów.
            </p>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveAsCustomPreset()}
              placeholder="Nazwa nowego presetu…"
              maxLength={40}
              style={{
                flex: 1,
                maxWidth: 260,
                background: hexToRgba(settings.sliderBgColor, 90),
                border: `1px solid ${borderSubtle}`,
                color: settings.panelTitleColor,
                fontSize: 13,
                borderRadius: 20,
                padding: "7px 16px",
                outline: "none",
              }}
            />
            <button
              onClick={saveAsCustomPreset}
              disabled={!newPresetName.trim()}
              style={{
                background: newPresetName.trim() ? settings.panelSubtitleColor : hexToRgba(settings.panelBorderColor, 30),
                color: newPresetName.trim() ? "#111" : hexToRgba(settings.panelTextColor, 40),
                border: "none",
                borderRadius: 20,
                padding: "7px 20px",
                fontSize: 13,
                fontWeight: 700,
                cursor: newPresetName.trim() ? "pointer" : "default",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              Zapisz preset
            </button>
          </div>
        </div>

        {/* Tła stron dla presetów */}
        <div style={{ ...panelStyle, borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
          {sectionTitle("Tła stron dla presetów")}
          <p style={{ fontSize: 12, color: settings.panelTextColor, marginBottom: 16, marginTop: -8 }}>
            Każdy preset może mieć przypisane własne tło strony. Domyślnie używane są pliki z folderu <code style={{ background: "rgba(255,255,255,0.07)", padding: "1px 5px", borderRadius: 4 }}>/images/</code>. Kliknij "Wybierz plik" aby załadować własny obraz.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.keys(PRESETS).map((presetName) => {
              const bg = presetBgs[presetName] ?? PRESET_BG_DEFAULTS[presetName] ?? "";
              const isDataUrl = bg.startsWith("data:");
              const defaultBg = PRESET_BG_DEFAULTS[presetName] ?? "";
              const isCustom = bg !== defaultBg;
              const displayLabel = isDataUrl
                ? (presetBgFileNames[presetName] ?? "(plik załadowany)")
                : bg || "—";
              return (
                <div
                  key={presetName}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    borderRadius: 10,
                    backgroundColor: hexToRgba(settings.sliderBgColor, 60),
                    border: `1px solid ${borderSubtle}`,
                    flexWrap: "wrap",
                  }}
                >
                  {/* Preset name */}
                  <span
                    style={{
                      minWidth: 64,
                      fontSize: 13,
                      fontWeight: 700,
                      color: settings.panelTitleColor,
                    }}
                  >
                    {presetName}
                  </span>

                  {/* Thumbnail */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bg || defaultBg}
                    alt=""
                    style={{
                      width: 72,
                      height: 46,
                      objectFit: "cover",
                      borderRadius: 5,
                      border: `2px solid ${hexToRgba(settings.panelBorderColor, 60)}`,
                      flexShrink: 0,
                    }}
                  />

                  {/* File label */}
                  <span
                    style={{
                      flex: 1,
                      fontSize: 11,
                      color: isCustom ? settings.panelSubtitleColor : hexToRgba(settings.panelTextColor, 65),
                      wordBreak: "break-all",
                      minWidth: 120,
                    }}
                  >
                    {displayLabel}
                  </span>

                  {/* Buttons */}
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                    <label
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: hexToRgba(settings.sliderBgColor, 90),
                        border: `1px solid ${borderSubtle}`,
                        color: settings.panelTextColor,
                        padding: "6px 14px",
                        borderRadius: 7,
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Wybierz plik z dysku
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handlePresetBgFile(e, presetName)}
                      />
                    </label>
                    {isCustom && (
                      <button
                        onClick={() => resetPresetBg(presetName)}
                        style={{
                          background: "none",
                          border: `1px solid ${hexToRgba(settings.panelBorderColor, 40)}`,
                          color: hexToRgba(settings.panelTextColor, 70),
                          borderRadius: 7,
                          padding: "6px 12px",
                          fontSize: 12,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ↩ Domyślne
                      </button>
                    )}
                    <button
                      onClick={() => savePresetBg(presetName)}
                      disabled={savedPresetBgs[presetName] === presetBgs[presetName] && !presetBgRowSaved[presetName]}
                      style={{
                        background: presetBgRowSaved[presetName]
                          ? hexToRgba(settings.panelSubtitleColor, 60)
                          : savedPresetBgs[presetName] === presetBgs[presetName]
                          ? hexToRgba(settings.panelBorderColor, 30)
                          : settings.panelSubtitleColor,
                        color: savedPresetBgs[presetName] === presetBgs[presetName] && !presetBgRowSaved[presetName]
                          ? hexToRgba(settings.panelTextColor, 40)
                          : "#111",
                        border: "none",
                        borderRadius: 7,
                        padding: "6px 14px",
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: savedPresetBgs[presetName] === presetBgs[presetName] && !presetBgRowSaved[presetName] ? "default" : "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.15s",
                      }}
                    >
                      {presetBgRowSaved[presetName] ? "✓ Zapisano" : "Zapisz"}
                    </button>
                  </div>
                </div>
              );
            })}
            {Object.keys(customPresets).length > 0 && (
              <>
                <p style={{ fontSize: 11, color: settings.panelSubtitleColor, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "12px 0 4px" }}>Własne presety</p>
                {Object.keys(customPresets).map((presetName) => {
                  const bg = presetBgs[presetName] ?? "";
                  const isDataUrl = bg.startsWith("data:");
                  const hasBg = bg !== "";
                  const displayLabel = isDataUrl
                    ? (presetBgFileNames[presetName] ?? "(plik załadowany)")
                    : bg || "— brak tła";
                  return (
                    <div
                      key={presetName}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 14px",
                        borderRadius: 10,
                        backgroundColor: hexToRgba(settings.sliderBgColor, 60),
                        border: `1px solid ${borderSubtle}`,
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ minWidth: 64, fontSize: 13, fontWeight: 700, color: settings.panelTitleColor }}>
                        {presetName}
                      </span>
                      {hasBg ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={bg}
                          alt=""
                          style={{
                            width: 72, height: 46, objectFit: "cover",
                            borderRadius: 5,
                            border: `2px solid ${hexToRgba(settings.panelBorderColor, 60)}`,
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div style={{
                          width: 72, height: 46, borderRadius: 5,
                          border: `2px dashed ${hexToRgba(settings.panelBorderColor, 40)}`,
                          flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, color: hexToRgba(settings.panelTextColor, 40),
                        }}>brak</div>
                      )}
                      <span style={{ flex: 1, fontSize: 11, color: hasBg ? settings.panelSubtitleColor : hexToRgba(settings.panelTextColor, 40), wordBreak: "break-all", minWidth: 120 }}>
                        {displayLabel}
                      </span>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                        <label style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          background: hexToRgba(settings.sliderBgColor, 90),
                          border: `1px solid ${borderSubtle}`,
                          color: settings.panelTextColor, padding: "6px 14px", borderRadius: 7,
                          fontSize: 12, cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap",
                        }}>
                          Wybierz plik z dysku
                          <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handlePresetBgFile(e, presetName)} />
                        </label>
                        {hasBg && (
                          <button
                            onClick={() => resetPresetBg(presetName)}
                            style={{
                              background: "none",
                              border: `1px solid ${hexToRgba(settings.panelBorderColor, 40)}`,
                              color: hexToRgba(settings.panelTextColor, 70),
                              borderRadius: 7, padding: "6px 12px", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
                            }}
                          >
                            ✖ Usuń tło
                          </button>
                        )}
                        <button
                          onClick={() => savePresetBg(presetName)}
                          disabled={savedPresetBgs[presetName] === presetBgs[presetName] && !presetBgRowSaved[presetName]}
                          style={{
                            background: presetBgRowSaved[presetName]
                              ? hexToRgba(settings.panelSubtitleColor, 60)
                              : savedPresetBgs[presetName] === presetBgs[presetName]
                              ? hexToRgba(settings.panelBorderColor, 30)
                              : settings.panelSubtitleColor,
                            color: savedPresetBgs[presetName] === presetBgs[presetName] && !presetBgRowSaved[presetName]
                              ? hexToRgba(settings.panelTextColor, 40) : "#111",
                            border: "none", borderRadius: 7, padding: "6px 14px",
                            fontWeight: 700, fontSize: 12,
                            cursor: savedPresetBgs[presetName] === presetBgs[presetName] && !presetBgRowSaved[presetName] ? "default" : "pointer",
                            whiteSpace: "nowrap", transition: "all 0.15s",
                          }}
                        >
                          {presetBgRowSaved[presetName] ? "✓ Zapisano" : "Zapisz"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

        </div>

        {/* Wygląd – scalony panel */}
        <div style={{ ...panelStyle, borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
          {sectionTitle("Wygląd i ustawienia")}

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
            Zapisz ustawienia wyglądu
          </button>
          {saved && (
            <span style={{ display: "block", color: settings.panelSubtitleColor, fontSize: 13, textAlign: "center", marginTop: 8 }}>
              ✓ Zapisano - odśwież stronę główną, aby zobaczyć zmiany
            </span>
          )}
        </div>

        <p style={{ marginTop: 20, fontSize: 12, color: hexToRgba(settings.panelBorderColor, 60), lineHeight: 1.7 }}>
          Ustawienia przechowywane lokalnie w przeglądarce (localStorage).
          Zdjęcie tła jest skalowane do max 1920×1080 przed zapisem.
        </p>
      </div>
  );
}

export function MediaSettingsClient() {
  const [settings, setSettings] = useState<HomepageSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }));
    } catch { /* ignore */ }
  }, []);

  const panelStyle: React.CSSProperties = {
    border: `1px solid ${hexToRgba(settings.panelBorderColor, 30)}`,
    backgroundColor: hexToRgba(settings.panelBgColor, parseInt(settings.panelOpacity)),
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  };
  const borderSubtle = hexToRgba(settings.panelBorderColor, 35);

  const sectionTitle = (text: string) => (
    <h3
      style={{
        color: settings.panelTitleColor,
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: 2,
        textTransform: "uppercase",
        margin: "0 0 16px",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/propeller_ico.png" alt="" style={{ width: 16, height: 16, minWidth: 16, objectFit: "contain" }} />
      {text}
    </h3>
  );

  return (
    <div style={{ width: "100%", padding: "0 0 60px" }}>
      {/* Media – Filmy Warsztaty */}
      <div style={{ ...panelStyle, borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
        {sectionTitle("Warsztaty – filmy")}
        <p style={{ fontSize: 12, color: settings.panelTextColor, marginBottom: 14, marginTop: -8 }}>
          Filmy wideo wyświetlane na stronie Warsztaty (mp4, mov, webm – max 200 MB).
        </p>
        <MediaPanel folder="videos" accept="video/mp4,video/quicktime,video/webm,video/*" canSort canCaption saveLabel="Zapisz zmiany w podpisach filmów" settings={settings} borderSubtle={borderSubtle} />
      </div>

      {/* Media – Panel 1 strony home */}
      <div style={{ ...panelStyle, borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
        {sectionTitle("Panel – strona home (zdjęcia)")}
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
        <MediaPanel folder="slider" accept="image/jpeg,image/png,image/webp,image/gif" canSort canCaption saveLabel="Zapisz zmiany w podpisach zdjęć" settings={settings} borderSubtle={borderSubtle} />
      </div>

      {/* Media – Drony FPV */}
      <div style={{ ...panelStyle, borderRadius: 16, padding: "20px 24px", marginBottom: 28 }}>
        {sectionTitle("Panel – strona Drony FPV – zdjęcia")}
        <p style={{ fontSize: 12, color: settings.panelTextColor, marginBottom: 14, marginTop: -8 }}>
          Zdjęcia przyporządkowane do 6 klocków na stronie Drony FPV.<br />Kolejność odpowiada kolejności klocków: Drony wyścigowe, Freestyle, Long range, HD, Budżetowe, Na zamówienie.
        </p>
        <MediaPanel folder="panel_drony_fpv" accept="image/jpeg,image/png,image/webp,image/gif" canSort saveLabel="Zapisz kolejność zdjęć" settings={settings} borderSubtle={borderSubtle} />
      </div>
    </div>
  );
}

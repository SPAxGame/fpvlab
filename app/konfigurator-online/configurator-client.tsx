"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  hexToRgba,
} from "../lib/settings";
import type { HomepageSettings } from "../lib/settings";
import { CATEGORY_LABELS } from "../lib/products";
import type { Category, Product } from "../lib/products";

// ─── Step definition ───────────────────────────────────────────────────────

type ConfigStep =
  | "frame"
  | "motor"
  | "stack"
  | "video_type"
  | "video_mode"
  | "video_bundle"
  | "camera"
  | "vtx"
  | "antenna"
  | "elrs"
  | "gps"
  | "buzzer"
  | "battery_strap"
  | "battery"
  | "summary"
  | "koniec";

type VideoType = "analog" | "digital";
type VideoMode = "bundle" | "separate";

interface Selections {
  frame?: Product | null;
  motor?: Product | null;
  stack?: Product | null;
  videoType?: VideoType | null;
  videoMode?: VideoMode | null;
  videoBundle?: Product | null;
  camera?: Product | null;
  vtx?: Product | null;
  antenna?: Product | null;
  elrs?: Product | null;
  gps?: Product | null;
  buzzer?: Product | null;
  batteryStrap?: Product | null;
  battery?: Product | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function totalPrice(sel: Selections): number {
  const items: (Product | null | undefined)[] = [
    sel.frame, sel.motor, sel.stack,
    sel.videoBundle, sel.camera, sel.vtx, sel.antenna,
    sel.elrs, sel.gps, sel.buzzer, sel.batteryStrap, sel.battery,
  ];
  return items.reduce((sum, p) => sum + (p?.price ?? 0), 0);
}

function buildSteps(sel: Selections): ConfigStep[] {
  const steps: ConfigStep[] = ["frame", "motor", "stack", "video_type"];
  if (sel.videoType) {
    steps.push("video_mode");
    if (sel.videoMode === "bundle") {
      steps.push("video_bundle");
    } else if (sel.videoMode === "separate") {
      steps.push("camera", "vtx", "antenna");
    }
  }
  steps.push("elrs", "gps", "buzzer");
  if (sel.frame && !sel.frame.includesStraps) {
    steps.push("battery_strap");
  }
  steps.push("battery", "summary", "koniec");
  return steps;
}

function stepLabel(step: ConfigStep): string {
  const map: Record<ConfigStep, string> = {
    frame: "Rama",
    motor: "Silniki",
    stack: "Stack",
    video_type: "Typ video",
    video_mode: "Tryb video",
    video_bundle: "Zestaw video",
    camera: "Kamera",
    vtx: "Nadajnik VTX",
    antenna: "Antena",
    elrs: "ELRS",
    gps: "GPS",
    buzzer: "Buzzer",
    battery_strap: "Paski akum.",
    battery: "Akumulator",
    summary: "Podsumowanie",
    koniec: "Koniec",
  };
  return map[step];
}

const OPTIONAL_STEPS: ConfigStep[] = ["gps", "buzzer", "battery_strap"];

function stepHasSelection(step: ConfigStep, sel: Selections): boolean {
  switch (step) {
    case "frame": return sel.frame !== undefined;
    case "motor": return sel.motor !== undefined;
    case "stack": return sel.stack !== undefined;
    case "video_type": return sel.videoType !== undefined;
    case "video_mode": return sel.videoMode !== undefined;
    case "video_bundle": return sel.videoBundle !== undefined;
    case "camera": return sel.camera !== undefined;
    case "vtx": return sel.vtx !== undefined;
    case "antenna": return sel.antenna !== undefined;
    case "elrs": return sel.elrs !== undefined;
    case "gps": return sel.gps !== undefined;
    case "buzzer": return sel.buzzer !== undefined;
    case "battery_strap": return sel.batteryStrap !== undefined;
    case "battery": return sel.battery !== undefined;
    case "summary": return true;
    case "koniec": return true;
  }
}

// ─── Product card ──────────────────────────────────────────────────────────

function ProductCard({
  product,
  selected,
  onSelect,
  settings,
}: {
  product: Product;
  selected: boolean;
  onSelect: () => void;
  settings: HomepageSettings;
}) {
  const borderColor = selected
    ? settings.panelSubtitleColor
    : hexToRgba(settings.panelBorderColor, 40);
  const bg = selected
    ? hexToRgba(settings.panelSubtitleColor, 18)
    : hexToRgba(settings.sliderBgColor, 80);

  const allImages = product.images?.length ? product.images : product.image ? [product.image] : [];
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
      {/* Lightbox */}
      {lightbox && allImages.length > 0 && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              filter: "drop-shadow(0 8px 40px rgba(0,0,0,0.85))",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/products/${allImages[activeImg]}`}
              alt={product.name}
              onClick={() => setLightbox(false)}
              style={{
                maxWidth: "92vw",
                maxHeight: "88vh",
                borderRadius: 12,
                objectFit: "contain",
                display: "block",
                cursor: "zoom-out",
              }}
            />
            {allImages.length > 1 && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{ display: "flex", gap: 8 }}
              >
                {allImages.map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img}
                    src={`/products/${img}`}
                    alt=""
                    onClick={(e) => { e.stopPropagation(); setActiveImg(i); }}
                    style={{
                      width: 52,
                      height: 40,
                      objectFit: "cover",
                      borderRadius: 6,
                      cursor: "pointer",
                      border: i === activeImg ? "2px solid #fff" : "2px solid rgba(255,255,255,0.25)",
                      opacity: i === activeImg ? 1 : 0.6,
                      transition: "all 0.15s",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div
        style={{
          border: `2px solid ${borderColor}`,
          borderRadius: 14,
          backgroundColor: bg,
          padding: "14px 16px",
          textAlign: "left",
          transition: "all 0.18s",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {selected && (
          <span
            style={{
              position: "absolute",
              top: 10,
              right: 12,
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: settings.panelSubtitleColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "#111",
              zIndex: 1,
            }}
          >
            ✓
          </span>
        )}
        {allImages.length > 0 ? (
          <>
            <div style={{ position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/products/${allImages[activeImg]}`}
                alt={product.name}
                onClick={(e) => { e.stopPropagation(); setLightbox(true); }}
                style={{
                  width: "100%",
                  height: 140,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: `1px solid ${hexToRgba(settings.panelBorderColor, 30)}`,
                  display: "block",
                  cursor: "zoom-in",
                }}
              />
            </div>
            {/* Miniaturki – poza blokiem relative */}
            {allImages.length > 1 && (
              <div
                style={{ display: "flex", gap: 5, flexWrap: "wrap" }}
                onClick={(e) => e.stopPropagation()}
              >
                {allImages.map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img}
                    src={`/products/${img}`}
                    alt=""
                    onClick={() => setActiveImg(i)}
                    style={{
                      width: 52,
                      height: 40,
                      objectFit: "cover",
                      borderRadius: 5,
                      cursor: "pointer",
                      border: i === activeImg
                        ? `2px solid ${settings.panelSubtitleColor}`
                        : `2px solid transparent`,
                      opacity: i === activeImg ? 1 : 0.55,
                      transition: "all 0.12s",
                    }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{
            width: "100%",
            height: 140,
            borderRadius: 8,
            border: `1px solid ${hexToRgba(settings.panelBorderColor, 30)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 6,
            color: hexToRgba(settings.panelTextColor, 35),
            fontSize: 12,
            backgroundColor: hexToRgba(settings.panelBorderColor, 8),
          }}>
            <span style={{ fontSize: 28, opacity: 0.4 }}>🖼️</span>
            <span>Brak zdjęcia</span>
          </div>
        )}
        <div style={{ fontWeight: 700, fontSize: 14, color: settings.panelTitleColor, lineHeight: 1.3 }}>
          {product.name}
        </div>
        {product.description && (
          <div style={{ fontSize: 12, color: settings.panelTextColor, lineHeight: 1.4 }}>
            {product.description}
          </div>
        )}
        <div
          style={{
            fontWeight: 700,
            fontSize: 16,
            color: settings.panelSubtitleColor,
            marginTop: "auto",
          }}
        >
          {product.price.toFixed(2)} zł
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          style={{
            background: selected ? settings.panelSubtitleColor : "transparent",
            color: selected ? "#111" : settings.panelSubtitleColor,
            border: `2px solid ${settings.panelSubtitleColor}`,
            borderRadius: 8,
            padding: "8px 0",
            fontWeight: 700,
            fontSize: 12,
            cursor: "pointer",
            letterSpacing: "0.12em",
            width: "100%",
            transition: "all 0.15s",
          }}
        >
          {selected ? "✓ WYBRANO" : "WYBIERZ"}
        </button>
      </div>
    </>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function ConfiguratorClient() {
  const [settings, setSettings] = useState<HomepageSettings>(DEFAULT_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<ConfigStep>("frame");
  const [selections, setSelections] = useState<Selections>({});
  const [returnToSummary, setReturnToSummary] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<Array<{ key: string; ts: number; selections: Selections; total: number; note?: string }>>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: Product[]) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const loadSavedConfigs = () => {
    const configs: Array<{ key: string; ts: number; selections: Selections; total: number; note?: string }> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("fpv_config_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key) ?? "{}");
          configs.push({ key, ts: parseInt(key.replace("fpv_config_", "")) || 0, ...data });
        } catch { /* skip */ }
      }
    }
    configs.sort((a, b) => b.ts - a.ts);
    setSavedConfigs(configs);
  };

  useEffect(() => { loadSavedConfigs(); }, []);

  const steps = buildSteps(selections);
  const stepIndex = steps.indexOf(currentStep);

  const panelStyle = {
    border: `2px solid ${settings.panelBorderColor}`,
    backgroundColor: hexToRgba(settings.panelBgColor, parseInt(settings.panelOpacity)),
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  };

  // ── Selections handlers ──────────────────────────────────────────────────

  const selectProduct = useCallback((step: ConfigStep, product: Product) => {
    setSelections((prev) => {
      const next = { ...prev };
      switch (step) {
        case "frame": next.frame = product; break;
        case "motor": next.motor = product; break;
        case "stack": next.stack = product; break;
        case "video_bundle": next.videoBundle = product; break;
        case "camera": next.camera = product; break;
        case "vtx": next.vtx = product; break;
        case "antenna": next.antenna = product; break;
        case "elrs": next.elrs = product; break;
        case "gps": next.gps = product; break;
        case "buzzer": next.buzzer = product; break;
        case "battery_strap": next.batteryStrap = product; break;
        case "battery": next.battery = product; break;
      }
      return next;
    });
  }, []);

  const getSelected = (step: ConfigStep): Product | null | undefined => {
    switch (step) {
      case "frame": return selections.frame;
      case "motor": return selections.motor;
      case "stack": return selections.stack;
      case "video_bundle": return selections.videoBundle;
      case "camera": return selections.camera;
      case "vtx": return selections.vtx;
      case "antenna": return selections.antenna;
      case "elrs": return selections.elrs;
      case "gps": return selections.gps;
      case "buzzer": return selections.buzzer;
      case "battery_strap": return selections.batteryStrap;
      case "battery": return selections.battery;
      default: return undefined;
    }
  };

  const getProductsForStep = (step: ConfigStep): Product[] => {
    const catMap: Partial<Record<ConfigStep, Category>> = {
      frame: "frame", motor: "motor", stack: "stack",
      video_bundle: "video_bundle", camera: "camera",
      vtx: "vtx", antenna: "antenna", elrs: "elrs",
      gps: "gps", buzzer: "buzzer",
      battery_strap: "battery_strap", battery: "battery",
    };
    const cat = catMap[step];
    if (!cat) return [];
    let filtered = products.filter((p) => p.category === cat && p.inStock);
    if ((step === "video_bundle" || step === "camera" || step === "vtx") && selections.videoType) {
      filtered = filtered.filter((p) => p.videoType === selections.videoType);
    }
    if (step === "antenna" && selections.videoType) {
      const requiredPol = selections.videoType === "analog" ? "RHCP" : "LHCP";
      filtered = filtered.filter((p) => !p.polarization || p.polarization === requiredPol);
    }
    return filtered;
  };

  const canGoNext = stepHasSelection(currentStep, selections);
  const isOptional = OPTIONAL_STEPS.includes(currentStep);

  const goNext = () => {
    if (returnToSummary) {
      setReturnToSummary(false);
      setCurrentStep("summary");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const nextSteps = buildSteps(
      currentStep === "frame" && selections.frame
        ? selections
        : selections
    );
    const idx = nextSteps.indexOf(currentStep);
    if (idx < nextSteps.length - 1) {
      setCurrentStep(nextSteps[idx + 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    if (returnToSummary) {
      setReturnToSummary(false);
      setCurrentStep("summary");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const skipCurrentStep = () => {
    setSelections((prev) => {
      const next = { ...prev };
      if (currentStep === "gps") next.gps = null;
      else if (currentStep === "buzzer") next.buzzer = null;
      else if (currentStep === "battery_strap") next.batteryStrap = null;
      else if (currentStep === "frame") next.frame = null;
      else if (currentStep === "motor") next.motor = null;
      else if (currentStep === "stack") next.stack = null;
      else if (currentStep === "video_type") {
        next.videoType = null;
        next.videoMode = undefined;
        next.videoBundle = undefined;
        next.camera = undefined;
        next.vtx = undefined;
        next.antenna = undefined;
      } else if (currentStep === "video_mode") {
        next.videoMode = null;
        next.videoBundle = undefined;
        next.camera = undefined;
        next.vtx = undefined;
        next.antenna = undefined;
      } else if (currentStep === "video_bundle") next.videoBundle = null;
      else if (currentStep === "camera") next.camera = null;
      else if (currentStep === "vtx") next.vtx = null;
      else if (currentStep === "antenna") next.antenna = null;
      else if (currentStep === "elrs") next.elrs = null;
      else if (currentStep === "battery") next.battery = null;
      return next;
    });
    if (returnToSummary) {
      setReturnToSummary(false);
      setCurrentStep("summary");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const nextSteps2 = buildSteps(selections);
      const idx2 = nextSteps2.indexOf(currentStep);
      if (idx2 < nextSteps2.length - 1) setCurrentStep(nextSteps2[idx2 + 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const sendConfig = () => {
    const lines = buildSummaryLines(selections);
    const body = lines.map((l) => `${l.label}: ${l.value}`).join("\n");
    const total = totalPrice(selections);
    const subject = "Konfiguracja drona FPV- zapytanie ofertowe ze strony fpvlab.pl";
    const fullBody = `Zapytanie dotyczy następującej konfiguracji:\n\n${body}\n\nŁączna kwota: ${total.toFixed(2)} zł\n\nUWAGI do zapytania:\n\nDzień dobry, `;
    window.location.href = `mailto:kontakt@fpvlab.pl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullBody)}`;
  };

  const saveConfig = (note: string) => {
    if (savedConfigs.length >= 10) return;
    localStorage.setItem(
      "fpv_config_" + Date.now(),
      JSON.stringify({ selections, total: totalPrice(selections), note: note.trim() })
    );
    loadSavedConfigs();
  };

  const savePdf = async () => {
    const lines = buildSummaryLines(selections);
    const total = totalPrice(selections);
    const date = new Date().toLocaleString("pl-PL");

    // Convert images to base64 so they work in a standalone HTML file
    const toBase64 = async (src: string): Promise<string> => {
      try {
        const res = await fetch(src);
        const blob = await res.blob();
        return await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch {
        return "";
      }
    };

    const imgMap: Record<string, string> = {};
    await Promise.all(
      lines
        .filter((l) => l.product?.image)
        .map(async (l) => {
          const src = `/products/${l.product!.image}`;
          imgMap[src] = await toBase64(src);
        })
    );

    const logoBase64 = await toBase64("/images/fpv_lab_logo.jpg");
    const qrBase64 = await toBase64("/images/qrcode_fpvlabpl_black.png");

    const rows = lines
      .map((l) => {
        const src = l.product?.image ? `/products/${l.product.image}` : null;
        const imgHtml = src && imgMap[src]
          ? `<img src="${imgMap[src]}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;border:1px solid #ddd;display:block" />`
          : `<div style="width:48px;height:48px;border-radius:6px;border:1px solid #eee;background:#f5f5f5"></div>`;
        return `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #ddd;vertical-align:middle">${imgHtml}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #ddd;color:#555;font-size:12px;text-transform:uppercase;letter-spacing:1px;vertical-align:middle">${l.label}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #ddd;font-weight:600;vertical-align:middle">${l.value}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #ddd;text-align:right;font-weight:700;color:#e0a020;vertical-align:middle">${l.price !== undefined ? l.price.toFixed(2) + " zł" : ""}</td>
        </tr>`;
      })
      .join("");

    const logoImg = logoBase64
      ? `<img src="${logoBase64}" style="height:48px;object-fit:contain;display:block" />`
      : `<span style="color:#fff;font-weight:700;font-size:18px">FPV Lab</span>`;

    const html = `<!DOCTYPE html><html lang="pl"><head><meta charset="UTF-8"><title>Konfiguracja drona FPV</title>
      <style>
        body{font-family:sans-serif;margin:0;padding:0;color:#222}
        .header{background:#111;padding:14px 32px;display:flex;align-items:center;justify-content:space-between}
        .header-right{text-align:right;line-height:1.2;white-space:nowrap}
        .header-right .tagline{font-size:20px;font-weight:800;letter-spacing:2px;color:#9D2FC1}
        .header-right .domain{font-size:20px;font-weight:800;letter-spacing:2px;color:#CCA12C;margin-left:10px}
        .divider{height:4px;background:linear-gradient(90deg,#e0a020,#ffcc55)}
        .content{padding:28px 32px;padding-bottom:140px}
        .meta{text-align:center;margin-bottom:6px;color:#777;font-size:13px}
        .section-title{text-align:center;font-size:16px;font-weight:700;color:#222;margin:0 0 20px;letter-spacing:1px;text-transform:uppercase}
        table{width:100%;border-collapse:collapse}
        th{text-align:left;padding:8px 12px;border-bottom:3px solid #111;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888}
        .total{margin-top:24px;padding:14px 16px;border:2px solid #e0a020;border-radius:8px;display:flex;justify-content:space-between;align-items:center}
        .total-label{font-weight:700;font-size:16px}
        .total-price{font-weight:700;font-size:22px;color:#e0a020}
        @media print{
          @page{margin:0;size:A4}
          body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
        }
      </style></head>
      <body>
        <div class="header">
          ${logoImg}
          <div class="header-right">
            <span class="tagline">KONFIGURATOR DRONÓW FPV</span>
          </div>
        </div>
        <div class="divider"></div>
        <div class="content">
          <div class="meta">Konfiguracja drona FPV &nbsp;·&nbsp; ${date}</div>
          <div class="section-title">Zestawienie wybranych elementów</div>
          <table><thead><tr><th></th><th>Komponent</th><th>Produkt</th><th style="text-align:right">Cena</th></tr></thead><tbody>${rows}</tbody></table>
          <div class="total"><span class="total-label">Łączna kwota</span><span class="total-price">${total.toFixed(2)} zł</span></div>
        </div>
        <div style="position:fixed;bottom:0;left:0;right:0;padding:12px 32px;border-top:2px solid #ccc;display:flex;justify-content:space-between;align-items:center;background:#fff">
          <span style="font-size:32px;font-weight:900;letter-spacing:2px;background:linear-gradient(90deg,#9D2FC1,#CCA12C);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">www.fpvlab.pl</span>
          ${qrBase64 ? `<img src="${qrBase64}" width="80" height="80" alt="QR www.fpvlab.pl" style="display:block" />` : ""}
        </div>
      </body></html>`;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onafterprint = () => printWindow.close();
    setTimeout(() => printWindow.print(), 400);
  };

  const deleteSavedConfig = (key: string) => {
    localStorage.removeItem(key);
    loadSavedConfigs();
  };

  const resetConfig = () => {
    setSelections({});
    setReturnToSummary(false);
    setCurrentStep("frame");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80, color: settings.panelTextColor }}>
        Ładowanie produktów...
      </div>
    );
  }

  return (
    <>
      {/* ── Progress bar ── */}
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ ...panelStyle, borderRadius: 12, padding: "12px 20px" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "nowrap",
              alignItems: "center",
              width: "100%",
            }}
          >
        {steps.filter((s) => s !== "summary").map((s, i) => {
          const done = s === "koniec"
            ? (currentStep === "koniec" || stepIndex >= steps.indexOf("koniec"))
            : stepHasSelection(s, selections);
          const active = s === "koniec"
            ? (currentStep === "summary" || currentStep === "koniec")
            : s === currentStep;
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: "1 1 0", minWidth: 0 }}>
              <button
                onClick={() => {
                  const si = steps.indexOf(s);
                  if (si <= stepIndex || done) setCurrentStep(s);
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  background: "none",
                  border: "none",
                  cursor: (steps.indexOf(s) <= stepIndex || done) ? "pointer" : "default",
                  padding: "0 4px",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    backgroundColor: active
                      ? settings.panelSubtitleColor
                      : done
                      ? hexToRgba(settings.panelSubtitleColor, 50)
                      : hexToRgba(settings.panelBorderColor, 30),
                    border: `2px solid ${active ? settings.panelSubtitleColor : hexToRgba(settings.panelBorderColor, 50)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: active ? "#111" : done ? "#111" : settings.panelTextColor,
                    transition: "all 0.2s",
                  }}
                >
                  {done && !active ? "✓" : i + 1}
                </div>
                <span
                  style={{
                    fontSize: 9,
                    color: active ? settings.panelSubtitleColor : settings.panelTextColor,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    fontWeight: active ? 700 : 400,
                  }}
                >
                  {stepLabel(s)}
                </span>
              </button>
              {i < steps.filter((s2) => s2 !== "summary").length - 1 && (
                <div
                  style={{
                    flex: "1 1 0",
                    minWidth: 8,
                    height: 2,
                    backgroundColor: hexToRgba(settings.panelBorderColor, 80),
                    marginBottom: 20,
                  }}
                />
              )}
            </div>
          );
        })}
          </div>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 900, margin: "0 auto", padding: "0 16px 48px" }}>

      {/* ── Price counter ── */}
      {currentStep !== "koniec" && (
      <div
        style={{
          ...panelStyle,
          borderRadius: 12,
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <span style={{ color: settings.panelTextColor, fontSize: 13 }}>
          {currentStep === "summary" ? (
            <b style={{ color: settings.panelTitleColor }}>{stepLabel(currentStep)}</b>
          ) : (
            <>Krok {stepIndex + 1} / {steps.length - 2} — <b style={{ color: settings.panelTitleColor }}>{stepLabel(currentStep)}</b></>
          )}
        </span>
        <span style={{ color: settings.panelSubtitleColor, fontWeight: 700, fontSize: 18 }}>
          {totalPrice(selections).toFixed(2)} zł
        </span>
      </div>
      )}

      {/* ── Step content ── */}
      <div style={{ ...panelStyle, borderRadius: 16, padding: "24px 20px", minHeight: 300 }}>
        <StepContent
          step={currentStep}
          selections={selections}
          setSelections={setSelections}
          products={products}
          settings={settings}
          getProductsForStep={getProductsForStep}
          getSelected={getSelected}
          selectProduct={selectProduct}
          onChangeStep={(step) => {
            setReturnToSummary(true);
            setCurrentStep(step);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>

      {/* ── Navigation buttons ── */}
      {currentStep !== "summary" && currentStep !== "koniec" && (
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          {stepIndex > 0 && (
            <button
              onClick={goBack}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: 10,
                border: `2px solid ${hexToRgba(settings.panelBorderColor, 60)}`,
                backgroundColor: "transparent",
                color: settings.panelTextColor,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              ← Wróć
            </button>
          )}
          <button
            onClick={skipCurrentStep}
            style={{
              flex: 2,
              padding: "10px 16px",
              borderRadius: 10,
              border: `1px solid ${hexToRgba(settings.panelBorderColor, 35)}`,
              backgroundColor: "transparent",
              color: hexToRgba(settings.panelTextColor, 70),
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Produktu z kategorii „{stepLabel(currentStep)}" nie potrzebuję
          </button>
          <button
            onClick={goNext}
            disabled={!canGoNext}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              backgroundColor: canGoNext ? settings.panelSubtitleColor : hexToRgba(settings.panelBorderColor, 40),
              color: canGoNext ? "#111" : settings.panelTextColor,
              cursor: canGoNext ? "pointer" : "not-allowed",
              fontSize: 14,
              fontWeight: 700,
              transition: "all 0.2s",
            }}
          >
            {returnToSummary ? "Zatwierdź zmianę →" : "Dalej →"}
          </button>
        </div>
      )}


      {(currentStep === "summary" || currentStep === "koniec") && (
        <SummaryActions
          selections={selections}
          settings={settings}
          panelStyle={panelStyle}
          onSave={(n) => { saveConfig(n); }}
          onSavePdf={savePdf}
          onSend={sendConfig}
          onReset={resetConfig}
          savedCount={savedConfigs.length}
          isSummary={currentStep === "summary"}
        />
      )}

      {/* ── Saved configurations ── */}
      {savedConfigs.length > 0 && (
        <div style={{ ...panelStyle, borderRadius: 16, padding: "20px", marginTop: 32 }}>
          <h2 style={{ color: settings.panelTitleColor, fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>
            Zapisane konfiguracje
            <span style={{ color: settings.panelTextColor, fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
              ({savedConfigs.length})
            </span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {savedConfigs.map(({ key, ts, selections: sel, total, note }, idx) => {
              const lines = buildSummaryLines(sel);
              const configNum = savedConfigs.length - idx;
              return (
                <div
                  key={key}
                  style={{
                    border: `1px solid ${hexToRgba(settings.panelBorderColor, 35)}`,
                    borderRadius: 12,
                    padding: "14px 16px",
                    backgroundColor: hexToRgba(settings.sliderBgColor, 60),
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: settings.panelTitleColor, marginBottom: 2 }}>
                        Konfiguracja {configNum}{note ? <span style={{ fontWeight: 400, fontSize: 13, color: settings.panelTextColor, marginLeft: 6 }}>– {note}</span> : null}
                      </div>
                      <div style={{ fontSize: 12, color: settings.panelTextColor }}>
                        {new Date(ts).toLocaleString("pl-PL")}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: settings.panelSubtitleColor, fontSize: 15 }}>
                      {total.toFixed(2)} zł
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px", marginBottom: 12 }}>
                    {lines.filter((l) => l.value !== "Pominięto").map((l) => (
                      <div key={l.label} style={{ fontSize: 12, color: settings.panelTextColor }}>
                        <span style={{ color: hexToRgba(settings.panelBorderColor, 70) }}>{l.label}:</span>{" "}
                        <span style={{ color: settings.panelTitleColor }}>{l.value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      onClick={() => { setSelections(sel); setCurrentStep("summary"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      style={{
                        padding: "6px 16px",
                        borderRadius: 8,
                        border: `2px solid ${settings.panelSubtitleColor}`,
                        backgroundColor: "transparent",
                        color: settings.panelSubtitleColor,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Wczytaj
                    </button>
                    <button
                      onClick={() => deleteSavedConfig(key)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        border: "1px solid #8b1a1a",
                        backgroundColor: "transparent",
                        color: "#e05252",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>
    </>
  );
}

// ─── Step content ──────────────────────────────────────────────────────────

function StepContent({
  step,
  selections,
  setSelections,
  getProductsForStep,
  getSelected,
  selectProduct,
  settings,
  onChangeStep,
}: {
  step: ConfigStep;
  selections: Selections;
  setSelections: React.Dispatch<React.SetStateAction<Selections>>;
  products: Product[];
  settings: HomepageSettings;
  getProductsForStep: (s: ConfigStep) => Product[];
  getSelected: (s: ConfigStep) => Product | null | undefined;
  selectProduct: (s: ConfigStep, p: Product) => void;
  onChangeStep: (step: ConfigStep) => void;
}) {
  if (step === "summary") {
    return <SummaryStep selections={selections} settings={settings} onChangeStep={onChangeStep} />;
  }
  if (step === "koniec") {
    return <KoniecStep selections={selections} settings={settings} />;
  }

  if (step === "video_type") {
    return (
      <ChoiceStep
        title="Wybierz typ systemu wideo"
        options={[
          { value: "analog", label: "Analogowy", desc: "Klasyczny system FPV. Niski koszt, szeroka kompatybilność. Typowe opóźnienie ~30ms." },
          { value: "digital", label: "Cyfrowy", desc: "Obraz HD w czasie rzeczywistym (np. DJI O3, Walksnail). Droższy, ale jakość obrazu bez porównania." },
        ]}
        selected={selections.videoType ?? undefined}
        onSelect={(v) => {
          setSelections((prev) => ({
            ...prev,
            videoType: v as VideoType,
            videoMode: undefined,
            videoBundle: undefined,
            camera: undefined,
            vtx: undefined,
            antenna: undefined,
          }));
        }}
        settings={settings}
      />
    );
  }

  if (step === "video_mode") {
    return (
      <ChoiceStep
        title="Wybierz sposób doboru systemu wideo"
        options={[
          { value: "bundle", label: "Zestaw (kamera + VTX + antena)", desc: "Gotowy, sprawdzony zestaw. Wszystkie elementy dobrane do siebie." },
          { value: "separate", label: "Elementy oddzielnie", desc: "Wybierz kamerę, VTX i antenę osobno. Większa elastyczność." },
        ]}
        selected={selections.videoMode ?? undefined}
        onSelect={(v) => {
          setSelections((prev) => ({
            ...prev,
            videoMode: v as VideoMode,
            videoBundle: undefined,
            camera: undefined,
            vtx: undefined,
            antenna: undefined,
          }));
        }}
        settings={settings}
      />
    );
  }

  const stepProductList = getProductsForStep(step);
  const selectedProduct = getSelected(step);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const groupByKv = step === "motor" && stepProductList.some((p) => p.kv);

  const sortedProductList = groupByKv
    ? stepProductList
    : [...stepProductList].sort((a, b) =>
        sortOrder === "asc" ? a.price - b.price : b.price - a.price
      );

  const borderSubtle = hexToRgba(settings.panelBorderColor, 35);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ color: settings.panelTitleColor, fontSize: 18, fontWeight: 700, margin: 0 }}>
          {stepLabel(step)}
        </h2>
        {!groupByKv && stepProductList.length > 1 && (
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            style={{
              background: hexToRgba(settings.sliderBgColor, 90),
              border: `1px solid ${borderSubtle}`,
              color: settings.panelTextColor,
              padding: "5px 10px",
              borderRadius: 6,
              fontSize: 12,
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="asc">od najtańszych</option>
            <option value="desc">od najdroższych</option>
          </select>
        )}
      </div>
      {OPTIONAL_STEPS.includes(step) && (
        <p style={{ color: settings.panelSubtitleColor, fontSize: 12, marginBottom: 16 }}>
          Opcjonalny — możesz pominąć ten krok
        </p>
      )}
      {stepProductList.length === 0 ? (
        <p style={{ color: settings.panelTextColor, marginTop: 24 }}>
          Brak produktów w tej kategorii. Dodaj je w panelu administracyjnym.
        </p>
      ) : groupByKv ? (
        <KvGroups
          products={stepProductList}
          selected={selectedProduct ?? undefined}
          onSelect={(p) => selectProduct(step, p)}
          settings={settings}
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 14,
            marginTop: 16,
          }}
        >
          {sortedProductList.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              selected={selectedProduct?.id === p.id}
              onSelect={() => selectProduct(step, p)}
              settings={settings}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── KV groups ─────────────────────────────────────────────────────────────

function KvGroups({
  products,
  selected,
  onSelect,
  settings,
}: {
  products: Product[];
  selected?: Product;
  onSelect: (p: Product) => void;
  settings: HomepageSettings;
}) {
  const kvValues = [...new Set(products.map((p) => p.kv ?? 0))].sort((a, b) => a - b);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 16 }}>
      {kvValues.map((kv) => (
        <div key={kv}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: settings.panelSubtitleColor,
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 10,
              paddingBottom: 6,
              borderBottom: `1px solid ${hexToRgba(settings.panelBorderColor, 30)}`,
            }}
          >
            {kv} kV
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            {products
              .filter((p) => p.kv === kv)
              .map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  selected={selected?.id === p.id}
                  onSelect={() => onSelect(p)}
                  settings={settings}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Choice step ───────────────────────────────────────────────────────────

function ChoiceStep({
  title,
  options,
  selected,
  onSelect,
  settings,
}: {
  title: string;
  options: { value: string; label: string; desc: string }[];
  selected?: string;
  onSelect: (v: string) => void;
  settings: HomepageSettings;
}) {
  return (
    <div>
      <h2 style={{ color: settings.panelTitleColor, fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {options.map((o) => {
          const isSelected = selected === o.value;
          return (
            <button
              key={o.value}
              onClick={() => onSelect(o.value)}
              style={{
                border: `2px solid ${isSelected ? settings.panelSubtitleColor : hexToRgba(settings.panelBorderColor, 40)}`,
                borderRadius: 14,
                backgroundColor: isSelected
                  ? hexToRgba(settings.panelSubtitleColor, 18)
                  : hexToRgba(settings.sliderBgColor, 80),
                padding: "18px 20px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.18s",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 15, color: settings.panelTitleColor, marginBottom: 4 }}>
                {isSelected && <span style={{ color: settings.panelSubtitleColor }}>✓ </span>}
                {o.label}
              </div>
              <div style={{ fontSize: 13, color: settings.panelTextColor }}>
                {o.desc}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Summary ───────────────────────────────────────────────────────────────

function buildSummaryLines(sel: Selections) {
  const lines: { label: string; value: string; price?: number; product?: Product; step?: ConfigStep }[] = [];
  const add = (label: string, p: Product | null | undefined, step?: ConfigStep) => {
    if (p) lines.push({ label, value: p.name, price: p.price, product: p, step });
    else if (p === null) lines.push({ label, value: "Pominięto", step });
  };
  add("Rama", sel.frame, "frame");
  add("Silniki", sel.motor, "motor");
  add("Stack", sel.stack, "stack");
  if (sel.videoType === null) {
    lines.push({ label: "System wideo", value: "Pominięto", step: "video_type" });
  } else if (sel.videoType !== undefined) {
    if (sel.videoMode === null) {
      lines.push({ label: "Tryb systemu wideo", value: "Pominięto", step: "video_mode" });
    } else if (sel.videoMode === "bundle") {
      add("Zestaw video", sel.videoBundle, "video_bundle");
    } else if (sel.videoMode === "separate") {
      add("Kamera", sel.camera, "camera");
      add("Nadajnik VTX", sel.vtx, "vtx");
      add("Antena", sel.antenna, "antenna");
    }
  }
  add("Moduł ELRS", sel.elrs, "elrs");
  add("GPS", sel.gps, "gps");
  add("Buzzer", sel.buzzer, "buzzer");
  add("Paski do akumulatora", sel.batteryStrap, "battery_strap");
  add("Akumulator", sel.battery, "battery");
  return lines;
}

function SummaryStep({
  selections,
  settings,
  onChangeStep,
}: {
  selections: Selections;
  settings: HomepageSettings;
  onChangeStep: (step: ConfigStep) => void;
}) {
  const [hoveredImg, setHoveredImg] = useState<number | null>(null);
  const lines = buildSummaryLines(selections);
  const total = totalPrice(selections);

  return (
    <div>
      <h2 style={{ color: settings.panelTitleColor, fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
        Podsumowanie konfiguracji
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              borderRadius: 10,
              backgroundColor: hexToRgba(settings.sliderBgColor, 60),
              border: `1px solid ${hexToRgba(settings.panelBorderColor, 25)}`,
              flexWrap: "wrap",
            }}
          >
            {/* Image with hover zoom */}
            {l.product?.image && (
              <div
                style={{ position: "relative", flexShrink: 0, zIndex: hoveredImg === i ? 20 : 1 }}
                onMouseEnter={() => setHoveredImg(i)}
                onMouseLeave={() => setHoveredImg(null)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/products/${l.product.image}`}
                  alt={l.product.name}
                  style={{
                    width: 54,
                    height: 54,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: hoveredImg === i ? "none" : `1px solid ${hexToRgba(settings.panelBorderColor, 30)}`,
                    transform: hoveredImg === i ? "scale(2.8)" : "scale(1)",
                    transformOrigin: "left center",
                    transition: "transform 0.2s",
                    display: "block",
                  }}
                />
              </div>
            )}
            {/* Label + name */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: settings.panelTextColor, textTransform: "uppercase", letterSpacing: 1 }}>
                {l.label}
              </div>
              <div style={{ fontSize: 14, color: settings.panelTitleColor, fontWeight: 600, marginTop: 2, wordBreak: "break-word" }}>
                {l.value}
              </div>
            </div>
            {/* Price */}
            {l.price !== undefined && (
              <div style={{ fontWeight: 700, color: settings.panelSubtitleColor, fontSize: 15, flexShrink: 0 }}>
                {l.price.toFixed(2)} zł
              </div>
            )}
            {/* Zmień button */}
            {l.step && (
              <button
                onClick={() => onChangeStep(l.step!)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 8,
                  border: `1px solid ${hexToRgba(settings.panelBorderColor, 50)}`,
                  backgroundColor: "transparent",
                  color: settings.panelTextColor,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 500,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                Zmień
              </button>
            )}
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 20,
          padding: "14px 16px",
          borderRadius: 12,
          border: `2px solid ${settings.panelSubtitleColor}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: settings.panelTitleColor, fontWeight: 700, fontSize: 16 }}>Łączna kwota</span>
        <span style={{ color: settings.panelSubtitleColor, fontWeight: 700, fontSize: 22 }}>
          {total.toFixed(2)} zł
        </span>
      </div>
    </div>
  );
}

function KoniecStep({ selections, settings }: { selections: Selections; settings: HomepageSettings }) {
  const total = totalPrice(selections);
  return (
    <div style={{ textAlign: "center", padding: "40px 16px" }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
      <h2 style={{ color: settings.panelTitleColor, fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
        Konfiguracja gotowa!
      </h2>
      <p style={{ color: settings.panelTextColor, fontSize: 14, marginBottom: 24 }}>
        Twój build FPV jest skonfigurowany. Możesz go zapisać lub wysłać do nas,
        abyśmy przygotowali Ci dedykowaną ofertę.
      </p>
      <div style={{ color: settings.panelSubtitleColor, fontWeight: 700, fontSize: 28 }}>
        {total.toFixed(2)} zł
      </div>
    </div>
  );
}

function SummaryActions({
  selections,
  settings,
  panelStyle,
  onSave,
  onSavePdf,
  onSend,
  onReset,
  savedCount,
  isSummary,
}: {
  selections: Selections;
  settings: HomepageSettings;
  panelStyle: React.CSSProperties;
  onSave: (note: string) => void;
  onSavePdf: () => void;
  onSend: () => void;
  onReset: () => void;
  savedCount: number;
  isSummary: boolean;
}) {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogNote, setDialogNote] = useState("");
  const atLimit = savedCount >= 10;

  const handleConfirmSave = () => {
    onSave(dialogNote);
    setDialogNote("");
    setShowDialog(false);
  };

  return (
    <div style={{ marginTop: 16 }}>

      {/* ── Save dialog ── */}
      {showDialog && (
        <div
          onClick={() => setShowDialog(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              ...panelStyle, borderRadius: 18, padding: "32px 28px 24px",
              width: "100%", maxWidth: 440, margin: "0 16px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ textAlign: "center", fontSize: 28, marginBottom: 10 }}>💾</div>
            <h3 style={{ color: settings.panelTitleColor, fontSize: 17, fontWeight: 700, margin: "0 0 10px", textAlign: "center" }}>
              Zapisz konfigurację
            </h3>
            <p style={{ color: settings.panelTextColor, fontSize: 13, textAlign: "center", margin: "0 0 20px", lineHeight: 1.6 }}>
              Nadaj nazwę, by łatwo ją rozpoznać na liście —{" "}
              <span style={{ color: settings.panelSubtitleColor, fontStyle: "italic" }}>
                np. &ldquo;5-cal analog, budżetowy&rdquo;
              </span>
              . Ułatwi Ci to wybór finalnej konfiguracji.
            </p>
            <input
              type="text"
              value={dialogNote}
              onChange={(e) => setDialogNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmSave();
                if (e.key === "Escape") setShowDialog(false);
              }}
              placeholder="Opis konfiguracji (opcjonalnie)…"
              maxLength={60}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 10,
                border: `1px solid ${hexToRgba(settings.panelBorderColor, 60)}`,
                backgroundColor: hexToRgba(settings.sliderBgColor, 80),
                color: settings.panelTitleColor, fontSize: 14,
                outline: "none", boxSizing: "border-box", marginBottom: 20,
              }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowDialog(false)}
                style={{
                  flex: 1, padding: "10px", borderRadius: 10,
                  border: `2px solid ${hexToRgba(settings.panelBorderColor, 50)}`,
                  backgroundColor: "transparent", color: settings.panelTextColor,
                  cursor: "pointer", fontSize: 14, fontWeight: 600,
                }}
              >Anuluj</button>
              <button
                onClick={handleConfirmSave}
                style={{
                  flex: 2, padding: "10px", borderRadius: 10, border: "none",
                  backgroundColor: settings.panelSubtitleColor, color: "#111",
                  cursor: "pointer", fontSize: 14, fontWeight: 700,
                }}
              >Zapisz</button>
            </div>
          </div>
        </div>
      )}

      {atLimit && (
        <div style={{
          marginBottom: 12,
          padding: "10px 16px",
          borderRadius: 10,
          backgroundColor: hexToRgba("#ff4444", 12),
          border: "1px solid #ff4444",
          color: "#ff6666",
          fontSize: 13,
        }}>
          Osiągnięto limit 10 zapisanych konfiguracji. Usuń zbędne konfiguracje z panelu poniżej, aby móc zapisać nową.
        </div>
      )}
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <button
          onClick={() => { if (!atLimit) setShowDialog(true); }}
          disabled={atLimit}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 10,
            border: `2px solid ${atLimit ? hexToRgba(settings.panelBorderColor, 30) : hexToRgba(settings.panelBorderColor, 60)}`,
            backgroundColor: hexToRgba(settings.sliderBgColor, 80),
            color: atLimit ? hexToRgba(settings.panelTextColor, 40) : settings.panelTitleColor,
            cursor: atLimit ? "not-allowed" : "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Zapisz konfigurację w panelu poniżej (max. 10 konfiguracji)
        </button>
        <button
          onClick={onSavePdf}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 10,
            border: `2px solid ${hexToRgba(settings.panelBorderColor, 60)}`,
            backgroundColor: hexToRgba(settings.sliderBgColor, 80),
            color: settings.panelTitleColor,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Zapisz konfigurację do PDF 📄<br />lub wydrukuj 🖨️
        </button>
        <button
          onClick={onReset}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 10,
            border: `2px solid ${hexToRgba(settings.panelBorderColor, 60)}`,
            backgroundColor: "transparent",
            color: settings.panelTextColor,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {isSummary ? "Stwórz nową konfigurację" : "Zacznij od nowa"}
        </button>
      </div>
      <button
        onClick={onSend}
        style={{
          width: "100%",
          padding: "12px 28px",
          borderRadius: 10,
          border: "none",
          backgroundColor: settings.panelSubtitleColor,
          color: "#111",
          cursor: "pointer",
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        Wyślij zapytanie ofertowe z wybraną konfiguracją ✉
      </button>
    </div>
  );
}

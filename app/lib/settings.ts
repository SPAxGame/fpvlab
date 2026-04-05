export interface HomepageSettings {
  bgDataUrl: string;
  bgApplyToSubpages: boolean;
  panelBgColor: string;
  panelBgApplyToSubpages: boolean;
  panelOpacity: string; // '20' | '40' | '60' | '80'
  panelBorderColor: string;
  panelTitleColor: string;
  subpageTitleColor: string;
  panelSubtitleColor: string;
  panelTextColor: string;
  sliderBgColor: string;
  sliderBorderColor: string;
  advantageBgColor: string;
  infoTextColor: string;
}

export const DEFAULT_SETTINGS: HomepageSettings = {
  bgDataUrl: "",
  bgApplyToSubpages: false,
  panelBgColor: "#171717",
  panelBgApplyToSubpages: false,
  panelOpacity: "80",
  panelBorderColor: "#575E6B",
  panelTitleColor: "#FFFFFF",
  subpageTitleColor: "#FFFFFF",
  panelSubtitleColor: "#CCA12C",
  panelTextColor: "#9BA5B0",
  sliderBgColor: "#23272F",
  sliderBorderColor: "#575E6B",
  advantageBgColor: "#575E6B",
  infoTextColor: "#9BA5B0",
};

export const SETTINGS_KEY = "homepageSettings";

export function hexToRgba(hex: string, opacityPercent: number): string {
  const h = hex.replace("#", "").padEnd(6, "0");
  const r = parseInt(h.slice(0, 2), 16) || 0;
  const g = parseInt(h.slice(2, 4), 16) || 0;
  const b = parseInt(h.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${(opacityPercent / 100).toFixed(2)})`;
}

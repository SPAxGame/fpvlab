export interface HomepageSettings {
  bgDataUrl: string;
  bgImagePath: string;
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
  bgImagePath: "",
  bgApplyToSubpages: true,
  panelBgColor: "#171717",
  panelBgApplyToSubpages: false,
  panelOpacity: "60",
  panelBorderColor: "#727A88",
  panelTitleColor: "#FFFFFF",
  subpageTitleColor: "#FFFFFF",
  panelSubtitleColor: "#CCA12C",
  panelTextColor: "#B0BAC4",
  sliderBgColor: "#23272F",
  sliderBorderColor: "#727A88",
  advantageBgColor: "#727A88",
  infoTextColor: "#B0BAC4",
};

export const SETTINGS_KEY = "homepageSettings";
export const PRESET_BACKGROUNDS_KEY = "presetBackgrounds";

export function hexToRgba(hex: string, opacityPercent: number): string {
  const h = hex.replace("#", "").padEnd(6, "0");
  const r = parseInt(h.slice(0, 2), 16) || 0;
  const g = parseInt(h.slice(2, 4), 16) || 0;
  const b = parseInt(h.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${(opacityPercent / 100).toFixed(2)})`;
}

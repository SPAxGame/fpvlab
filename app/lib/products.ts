export type Category =
  | "frame"
  | "motor"
  | "stack"
  | "video_bundle"
  | "camera"
  | "vtx"
  | "antenna"
  | "elrs"
  | "gps"
  | "buzzer"
  | "battery_strap"
  | "battery";

export const CATEGORY_LABELS: Record<Category, string> = {
  frame: "Rama",
  motor: "Silniki",
  stack: "Stack (FC + ESC)",
  video_bundle: "Zestaw video (kamera + VTX + antena)",
  camera: "Kamera",
  vtx: "Nadajnik VTX",
  antenna: "Antena",
  elrs: "Moduł ELRS",
  gps: "Moduł GPS",
  buzzer: "Buzzer",
  battery_strap: "Paski do akumulatora",
  battery: "Akumulator",
};

export const ALL_CATEGORIES: Category[] = [
  "frame",
  "motor",
  "stack",
  "video_bundle",
  "camera",
  "vtx",
  "antenna",
  "elrs",
  "gps",
  "buzzer",
  "battery_strap",
  "battery",
];

export interface Product {
  id: string;
  category: Category;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  description?: string;
  inStock: boolean;
  // frame-specific
  frameType?: "DC" | "X";
  includesStraps?: boolean;
  color?: string;
  // motor-specific
  kv?: number;
  // video-specific
  videoType?: "analog" | "digital";
  // antenna-specific
  polarization?: "RHCP" | "LHCP";
}

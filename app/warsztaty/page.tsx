import type { Metadata } from "next";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import WarsztatyClient from "./warsztaty-client";

export const metadata: Metadata = {
  title: "Warsztaty FPV",
};

export default function WarsztatyPage() {
  let videos: string[] = [];
  let captions: Record<string, string> = {};

  try {
    const dirPath = join(process.cwd(), "public", "videos");
    const VIDEO_EXT = /\.(mp4|mov|webm|avi|mkv)$/i;
    const allFiles = readdirSync(dirPath).filter(
      (f) => VIDEO_EXT.test(f) && f !== "_order.json" && f !== "_captions.json"
    );
    try {
      const raw = readFileSync(join(dirPath, "_order.json"), "utf8");
      const saved: unknown = JSON.parse(raw);
      if (Array.isArray(saved)) {
        const ordered = (saved as string[]).filter((f) => allFiles.includes(f));
        allFiles.forEach((f) => { if (!ordered.includes(f)) ordered.push(f); });
        videos = ordered;
      } else {
        videos = allFiles.sort();
      }
    } catch {
      videos = allFiles.sort();
    }
    try {
      captions = JSON.parse(readFileSync(join(dirPath, "_captions.json"), "utf8")) as Record<string, string>;
    } catch {
      // no captions file yet
    }
  } catch {
    // videos directory missing
  }

  return <WarsztatyClient videos={videos} captions={captions} />;
}
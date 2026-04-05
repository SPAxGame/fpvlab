import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import HomepageClient from "./homepage-client";

function readOrderedImages(dirName: string, urlPrefix: string, ext: RegExp): string[] {
  const dirPath = join(process.cwd(), "public", dirName);
  try {
    const allFiles = readdirSync(dirPath).filter((f) => ext.test(f) && f !== "_order.json");
    let ordered: string[] = [];
    try {
      const raw = readFileSync(join(dirPath, "_order.json"), "utf8");
      const saved: unknown = JSON.parse(raw);
      if (Array.isArray(saved)) {
        ordered = (saved as string[]).filter((f) => allFiles.includes(f));
        allFiles.forEach((f) => { if (!ordered.includes(f)) ordered.push(f); });
      }
    } catch {
      ordered = [...allFiles].sort();
    }
    return ordered.map((f) => `${urlPrefix}/${f}`);
  } catch {
    return [];
  }
}

export default function Home() {
  const sliderImages = readOrderedImages("slider", "/slider", /\.(jpe?g|png|webp|gif)$/i);
  const panel1Images = readOrderedImages("panel_1_home", "/panel_1_home", /\.(jpe?g|jpeg|png|webp|gif)$/i);

  return <HomepageClient sliderImages={sliderImages} panel1Images={panel1Images} />;
}

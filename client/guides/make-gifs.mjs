// Regenerates the animated setup guides in src/assets/guides/ from the
// scenes in this folder. Needs Google Chrome, ffmpeg and puppeteer-core:
//
//   npm i -D puppeteer-core
//   node guides/make-gifs.mjs
//
// Add scene names after the guides folder to render only those, e.g.
//   node guides/make-gifs.mjs guides instagram-desktop-bookmark
//
// Set CHROME_PATH if Chrome is installed somewhere other than the default
// Windows location.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";

const guides = path.resolve(process.argv[2] || path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(guides, "../src/assets/guides");
const chrome = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";

// posterAt is the moment shown, as a still image, to visitors who ask their
// system for reduced motion.
const SCENES = [
  { file: "desktop.html", name: "desktop-bookmark", posterAt: 2.2 },
  { file: "android.html", name: "android-bookmark", posterAt: 7.0 },
  { file: "instagram-desktop.html", name: "instagram-desktop-bookmark", posterAt: 6.7 },
  { file: "instagram-android.html", name: "instagram-android-bookmark", posterAt: 12.0 },
];
// Render at twice the size so text stays sharp on high-density screens.
const SCALE = 2;

fs.mkdirSync(out, { recursive: true });
// The scenes load the site's fonts from node_modules, which file:// pages may
// only do with this flag.
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--allow-file-access-from-files"] });
try {
  const only = process.argv.slice(3);
  for (const scene of SCENES.filter((s) => !only.length || only.includes(s.name))) {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(path.join(guides, scene.file)).href);
    await page.waitForFunction(() => typeof window.render === "function");
    const { width, height, fps, duration } = await page.evaluate(() => {
      const r = document.querySelector("#stage").getBoundingClientRect();
      return { width: r.width, height: r.height, fps: window.FPS, duration: window.DURATION };
    });
    await page.setViewport({ width, height, deviceScaleFactor: SCALE });

    const shot = async (t, file) => {
      await page.evaluate((at) => window.render(at), t);
      await page.screenshot({ path: file, clip: { x: 0, y: 0, width, height } });
    };
    const frames = fs.mkdtempSync(path.join(os.tmpdir(), "guide-"));
    const count = Math.round(duration * fps);
    for (let i = 0; i < count; i++) await shot(i / fps, path.join(frames, `f${String(i).padStart(4, "0")}.png`));
    await shot(scene.posterAt, path.join(out, `${scene.name}.png`));

    // One shared palette, and only the changed part of each frame is stored.
    const gif = path.join(out, `${scene.name}.gif`);
    execFileSync("ffmpeg", [
      "-y", "-loglevel", "error", "-framerate", String(fps), "-i", path.join(frames, "f%04d.png"),
      "-vf", "split[a][b];[a]palettegen=max_colors=256:stats_mode=full[p];[b][p]paletteuse=dither=none:diff_mode=rectangle",
      "-loop", "0", gif,
    ]);
    fs.rmSync(frames, { recursive: true, force: true });
    console.log(`${scene.name}.gif: ${count} frames, ${Math.round(fs.statSync(gif).size / 1024)} KB`);
    await page.close();
  }
} finally {
  await browser.close();
}

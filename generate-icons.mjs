// generate-icons.mjs — Génère les icônes PNG PWA de SetLab
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS_DIR = path.join(__dirname, "public/icons");
const SIZES = [192, 512];
const COLORS = { bg: [198, 67, 80], fg: [222, 25, 7] };

function hsl(h, s, l) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

async function generateIcons() {
  try {
    for (const size of SIZES) {
      // Générer le SVG directement (pas de fichier source nécessaire)
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.125)}" fill="${hsl(...COLORS.bg)}"/>
  <text x="${size / 2}" y="${Math.round(size * 0.62)}" font-family="system-ui,sans-serif" font-size="${Math.round(size * 0.42)}" font-weight="700" fill="${hsl(...COLORS.fg)}" text-anchor="middle">SL</text>
</svg>`;

      await sharp(Buffer.from(svgContent)).png().toFile(path.join(ICONS_DIR, `icon-${size}x${size}.png`));
      console.log(`✓ icon-${size}x${size}.png`);
    }
    console.log("\n✅ Icônes PWA générées");
  } catch (err) {
    console.error("❌ Erreur:", err.message);
    process.exit(1);
  }
}

generateIcons();

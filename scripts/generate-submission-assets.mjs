import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(new URL("..", import.meta.url).pathname);
const outDir = join(root, "base-submission");

const W = 1284;
const H = 2778;

const palette = {
  paper: "#F3EFEB",
  black: "#0B0B0B",
  cream: "#F4EFDB",
  red: "#F54D36",
  blue: "#115DFF",
  yellow: "#F8D73D",
  green: "#1E8A5C",
  purple: "#6E47FF",
  pink: "#FF8CC6",
};

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrap(text, maxChars) {
  const words = text.split(" ");
  const result = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      result.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) result.push(current);
  return result;
}

function frame(content, bg = palette.paper) {
  return `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${bg}"/>
    ${content}
  </svg>`;
}

function header(title, subtitle) {
  const lines = wrap(subtitle, 34);
  return `
    <rect x="0" y="0" width="${W}" height="350" fill="${palette.yellow}" stroke="${palette.black}" stroke-width="6"/>
    <text x="72" y="100" font-family="Arial, sans-serif" font-size="38" font-weight="900" fill="${palette.black}">BASE PALETTE PRESS</text>
    <text x="72" y="206" font-family="Arial, sans-serif" font-size="86" font-weight="900" fill="${palette.black}">${esc(title)}</text>
    ${lines.map((line, index) => `<text x="76" y="${274 + index * 40}" font-family="Arial, sans-serif" font-size="32" font-weight="700" fill="${palette.black}" opacity="0.72">${esc(line)}</text>`).join("")}
  `;
}

function card(x, y, width, height, title, lines, bg = "#FFFFFF", fg = palette.black) {
  const wrapped = lines.flatMap((line, index) => (index === 0 ? [line] : wrap(line, Math.floor((width - 56) / 12))));
  return `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${bg}" stroke="${palette.black}" stroke-width="6"/>
      <text x="${x + 24}" y="${y + 48}" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="${fg}" opacity="0.62">${esc(title)}</text>
      ${wrapped.map((line, index) => `<text x="${x + 24}" y="${y + 106 + index * 34}" font-family="Arial, sans-serif" font-size="${index === 0 ? 34 : 28}" font-weight="${index === 0 ? 900 : 700}" fill="${fg}">${esc(line)}</text>`).join("")}
    </g>
  `;
}

function poster(x, y, width, title, note, colors) {
  return `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="1040" fill="#FFFFFF" stroke="${palette.black}" stroke-width="6"/>
      ${colors.map((shade, index) => `
        <rect x="${x}" y="${y + index * 228}" width="${width}" height="228" fill="${shade}" stroke="${palette.black}" stroke-width="6"/>
        <text x="${x + width - 24}" y="${y + index * 228 + 206}" text-anchor="end" font-family="Arial, sans-serif" font-size="26" font-weight="900" fill="${palette.black}" opacity="0.72">${shade}</text>
      `).join("")}
      <rect x="${x}" y="${y + 684}" width="${width}" height="356" fill="${palette.cream}" stroke="${palette.black}" stroke-width="6"/>
      <text x="${x + 26}" y="${y + 752}" font-family="Arial, sans-serif" font-size="54" font-weight="900" fill="${palette.black}">${esc(title)}</text>
      ${wrap(note, 28).map((line, index) => `<text x="${x + 26}" y="${y + 810 + index * 34}" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="${palette.black}" opacity="0.72">${esc(line)}</text>`).join("")}
    </g>
  `;
}

function screenshot1() {
  const content = `
    ${header("Publish color like a poster.", "Pick three tones, name the composition, and pin a compact visual study to Base.")}
    ${card(72, 420, 540, 258, "Compose", ["Late Print", "Three tones", "One sharp caption"], "#FFFFFF")}
    ${card(672, 420, 540, 258, "Use case", ["Palette archive", "Design references", "Fast visual taste board"], "#F54D36", "#FFFFFF")}
    ${poster(72, 726, 540, "Late Print", "A sharp headline palette for days that need strong contrast and no visual hesitation.", [palette.black, palette.cream, palette.red])}
    ${card(672, 726, 540, 300, "Preset system", ["Signal Cover", "#115DFF / #F8D73D / #FFFFFF"], "#FFFFFF")}
    ${card(672, 1068, 540, 230, "Action", ["Publish palette", "Wallet-connected poster record"], "#115DFF", "#FFFFFF")}
    ${card(672, 1340, 540, 180, "Format", ["Three colors only"], "#F8D73D")}
    <rect x="72" y="2522" width="1140" height="122" fill="${palette.black}" stroke="${palette.black}" stroke-width="6"/>
    <text x="642" y="2597" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="900" fill="#FFFFFF">PUBLISH PALETTE</text>
  `;
  return frame(content);
}

function screenshot2() {
  const content = `
    ${header("A real visual archive, not a generic list.", "The poster board makes each palette readable at a glance and easier to revisit later.")}
    ${poster(72, 420, 520, "Signal Cover", "High-contrast tones that feel loud, direct, and built for front-page attention.", [palette.blue, palette.yellow, "#FFFFFF"])}
    ${poster(622, 420, 520, "Field Notes", "A grounded mix for practical products, maps, labels, and utility-first interfaces.", [palette.green, "#F6C06A", "#2B2039"])}
    ${card(72, 1500, 520, 214, "Poster A", ["Published on Base", "May 14, 2026"], "#FFFFFF")}
    ${card(622, 1500, 520, 214, "Poster B", ["Author-linked visual study"], "#FFFFFF")}
    ${card(72, 1762, 1070, 260, "Why this feels different", ["Instead of a bland card list, the archive reads like a stack of saved covers and color studies."], "#F8D73D")}
  `;
  return frame(content, "#ECE8E1");
}

function screenshot3() {
  const content = `
    ${header("Look up any palette by ID.", "Open a saved poster to inspect its title, caption, three tones, and author.")}
    ${card(72, 420, 1140, 248, "Lookup result", ["Late Print", "May 14, 2026", "Author: 0x9936...9652"], "#FFFFFF")}
    ${poster(72, 716, 560, "Late Print", "A sharp headline palette for days that need strong contrast and no visual hesitation.", [palette.black, palette.cream, palette.red])}
    ${card(678, 716, 534, 248, "Color A", [palette.black], palette.black, "#FFFFFF")}
    ${card(678, 1010, 534, 248, "Color B", [palette.cream], "#FFFFFF")}
    ${card(678, 1304, 534, 248, "Color C", [palette.red], palette.red, "#FFFFFF")}
    ${card(678, 1598, 534, 260, "Caption", ["Use palette records as a lightweight chain-native taste archive."], "#115DFF", "#FFFFFF")}
    <rect x="72" y="2522" width="1140" height="122" fill="${palette.red}" stroke="${palette.black}" stroke-width="6"/>
    <text x="642" y="2597" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="900" fill="#FFFFFF">LOOK UP NEXT PALETTE</text>
  `;
  return frame(content);
}

function iconSvg() {
  return `
  <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="${palette.paper}"/>
    <rect x="144" y="144" width="736" height="736" fill="#FFFFFF" stroke="${palette.black}" stroke-width="28"/>
    <rect x="214" y="230" width="596" height="156" fill="${palette.black}" stroke="${palette.black}" stroke-width="18"/>
    <rect x="214" y="404" width="596" height="156" fill="${palette.cream}" stroke="${palette.black}" stroke-width="18"/>
    <rect x="214" y="578" width="596" height="156" fill="${palette.red}" stroke="${palette.black}" stroke-width="18"/>
  </svg>`;
}

function thumbnailSvg() {
  return `
  <svg width="1910" height="1000" viewBox="0 0 1910 1000" xmlns="http://www.w3.org/2000/svg">
    <rect width="1910" height="1000" fill="${palette.paper}"/>
    <rect x="72" y="72" width="1766" height="220" fill="${palette.yellow}" stroke="${palette.black}" stroke-width="8"/>
    <text x="104" y="188" font-family="Arial, sans-serif" font-size="118" font-weight="900" fill="${palette.black}">Base Palette Press</text>
    <text x="108" y="260" font-family="Arial, sans-serif" font-size="44" font-weight="800" fill="${palette.black}" opacity="0.72">Turn 3 colors into a poster card and keep the palette study on Base.</text>
    ${poster(96, 344, 600, "Late Print", "A sharp headline palette for days that need strong contrast and no visual hesitation.", [palette.black, palette.cream, palette.red])}
    ${poster(760, 344, 520, "Signal Cover", "High-contrast tones built for front-page attention.", [palette.blue, palette.yellow, "#FFFFFF"])}
    ${card(1334, 344, 476, 248, "Format", ["3 colors", "1 title", "1 caption"], "#FFFFFF")}
    ${card(1334, 632, 476, 248, "Use case", ["Save design direction onchain"], palette.red, "#FFFFFF")}
  </svg>`;
}

async function writePng(name, svg, width = W, height = H) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg))
    .resize(width, height)
    .png({ quality: 92, compressionLevel: 9 })
    .toFile(file);
  return file;
}

async function writeJpg(name, svg, width, height) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg))
    .resize(width, height)
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(file);
  return file;
}

await mkdir(outDir, { recursive: true });

const files = [
  await writeJpg("app-icon.jpg", iconSvg(), 1024, 1024),
  await writeJpg("app-thumbnail.jpg", thumbnailSvg(), 1910, 1000),
  await writePng("screenshot-1.png", screenshot1()),
  await writePng("screenshot-2.png", screenshot2()),
  await writePng("screenshot-3.png", screenshot3()),
];

const manifest = {
  generatedAt: new Date().toISOString(),
  files,
};

await writeFile(join(outDir, "asset-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

for (const file of files) {
  console.log(file);
}

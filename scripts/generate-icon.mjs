import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "build");

const BG = [26, 42, 32, 255];
const GOLD = [212, 178, 74, 255];
const INK = [232, 239, 230, 255];

const T = [
  "11111",
  "00100",
  "00100",
  "00100",
  "00100",
  "00100",
  "00100",
];

const D = [
  "11110",
  "10001",
  "10001",
  "10001",
  "10001",
  "10001",
  "11110",
];

function crc32(buffer) {
  let crc = ~0;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return ~crc >>> 0;
}

function chunk(type, data) {
  const header = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([header, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(width, height, rgba) {
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function inRoundedRect(x, y, size, radius) {
  const max = size - 1;
  const cx = x < radius ? radius : x > max - radius ? max - radius : x;
  const cy = y < radius ? radius : y > max - radius ? max - radius : y;
  if (cx === x && cy === y) return true;
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= radius * radius;
}

function paintGlyph(pixels, size, glyph, originX, originY, scale, color) {
  for (let gy = 0; gy < glyph.length; gy += 1) {
    for (let gx = 0; gx < glyph[gy].length; gx += 1) {
      if (glyph[gy][gx] !== "1") continue;
      for (let dy = 0; dy < scale; dy += 1) {
        for (let dx = 0; dx < scale; dx += 1) {
          const x = originX + gx * scale + dx;
          const y = originY + gy * scale + dy;
          if (x < 0 || y < 0 || x >= size || y >= size) continue;
          pixels.set(color, (y * size + x) * 4);
        }
      }
    }
  }
}

function renderIcon(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const radius = Math.max(2, Math.round(size * 0.22));
  const border = Math.max(1, Math.round(size * 0.07));
  const innerRadius = Math.max(1, radius - border);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      if (!inRoundedRect(x, y, size, radius)) continue;
      const color =
        size >= 32 && inRoundedRect(x - border, y - border, size - border * 2, innerRadius)
          ? BG
          : GOLD;
      pixels.set(color, i);
    }
  }

  if (size >= 24) {
    const scale = Math.max(1, Math.floor(size / 22));
    const glyphW = 5 * scale;
    const glyphH = 7 * scale;
    const gap = Math.max(1, Math.round(scale * 0.7));
    const totalW = glyphW * 2 + gap;
    const originX = Math.round((size - totalW) / 2);
    const originY = Math.round((size - glyphH) / 2);
    paintGlyph(pixels, size, T, originX, originY, scale, GOLD);
    paintGlyph(pixels, size, D, originX + glyphW + gap, originY, scale, INK);
  } else {
    const inset = Math.max(2, Math.round(size * 0.28));
    for (let y = inset; y < size - inset; y += 1) {
      for (let x = inset; x < size - inset; x += 1) {
        pixels.set(GOLD, (y * size + x) * 4);
      }
    }
  }

  return encodePng(size, size, pixels);
}

function encodeIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  let offset = 6 + pngs.length * 16;
  for (const { size, data } of pngs) {
    const entry = Buffer.alloc(16);
    entry[0] = size >= 256 ? 0 : size;
    entry[1] = size >= 256 ? 0 : size;
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...pngs.map((png) => png.data)]);
}

mkdirSync(outDir, { recursive: true });
const sizes = [16, 24, 32, 48, 64, 128, 256];
const pngs = sizes.map((size) => ({ size, data: renderIcon(size) }));
writeFileSync(join(outDir, "icon.png"), pngs.find((png) => png.size === 256).data);
writeFileSync(join(outDir, "icon.ico"), encodeIco(pngs));
console.log(`Wrote ${join(outDir, "icon.png")} and ${join(outDir, "icon.ico")}`);

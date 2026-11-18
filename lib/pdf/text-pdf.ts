// Small PDF writer for itineraries. No dependencies, runs in the browser, nothing is uploaded.
// It uses the two standard Helvetica fonts (no embedding) with WinAnsi encoding, which covers Spanish, English,
// French, German, Italian, Portuguese and Catalan. Letters outside that set fall back to their plain letter.
// Decoration (colour band, logo, day labels, panels, ruled notes) is drawn with plain vector shapes, no images.

export type PdfFact = { label?: string; value: string; small?: boolean };
export type PdfBlock =
  | { kind: "title"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "subheading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "bullet"; text: string; lead?: string }
  | { kind: "note"; text: string }
  | { kind: "day"; label: string; title?: string }
  | { kind: "panel"; rows: PdfFact[] }
  | { kind: "notes"; title: string; lines: number }
  | { kind: "space"; points?: number };
/** Coloured cover band on the first page; when present it replaces a «title» block. */
export type PdfBanner = { title: string; kicker?: string; subtitle?: string };
export type PdfDocument = { title: string; blocks: PdfBlock[]; footer: string; banner?: PdfBanner };

const PAGE = { width: 595, height: 842, left: 56, right: 56, top: 64, bottom: 72 };

// cp1252 code points for bytes 0x80-0x9F (WinAnsiEncoding); the rest of 0x20-0xFF maps to itself.
const CP1252: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88,
  0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93,
  0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b,
  0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f,
};
const LETTER_FALLBACK: Record<string, string> = { ł: "l", Ł: "L", đ: "d", Đ: "D", ħ: "h", Ħ: "H", ı: "i", ŀ: "l", Ŀ: "L" };
const AS_SPACE = /[   -   　\t\r\n]/;
const DROPPED = /[­​-‏⁠﻿︀-️\u{1f000}-\u{1faff}☀-➿]/u;

function byteFor(char: string): number | null {
  const code = char.codePointAt(0)!;
  if (code >= 0x20 && code <= 0x7e) return code;
  if (code >= 0xa1 && code <= 0xff) return code;
  return CP1252[code] ?? null;
}

/** Text restricted to what WinAnsi can print: unsupported accents are dropped, symbols and emoji are removed. */
export function toWinAnsiText(text: string): string {
  let out = "";
  for (const raw of text.normalize("NFC")) {
    if (AS_SPACE.test(raw)) { out += " "; continue; }
    if (DROPPED.test(raw)) continue;
    if (/[‐-‒−]/.test(raw)) { out += "-"; continue; }
    if (byteFor(raw) !== null) { out += raw; continue; }
    const plain = LETTER_FALLBACK[raw] ?? raw.normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (plain.length === 1 && byteFor(plain) !== null) out += plain;
  }
  return out.replace(/ {2,}/g, " ").trim();
}

// Helvetica and Helvetica-Bold advance widths (1000 units per em) for ASCII 32-126.
const REGULAR = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556,
  278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944,
  667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556,
  500, 722, 500, 500, 500, 334, 260, 334, 584];
const BOLD = [278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556,
  333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944,
  667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611,
  556, 778, 556, 556, 500, 389, 280, 389, 584];
const SPECIAL: Record<string, number> = {
  "•": 350, "–": 556, "—": 1000, "‘": 222, "’": 222, "“": 333, "”": 333, "«": 556, "»": 556, "¿": 611, "¡": 333,
  "ß": 611, "æ": 889, "œ": 944, "Æ": 1000, "Œ": 1000, "ø": 611, "Ø": 778, "…": 1000, "€": 556, "·": 278, "°": 400, "©": 737,
};

function width(text: string, size: number, bold: boolean): number {
  let total = 0;
  for (const char of text) {
    const base = char.normalize("NFD")[0];
    const code = base.codePointAt(0)!;
    const table = bold ? BOLD : REGULAR;
    total += SPECIAL[char] ?? (code >= 32 && code <= 126 ? table[code - 32] : 556);
  }
  return (total * size) / 1000;
}

function wrap(text: string, maxWidth: number, size: number, bold: boolean): string[] {
  const words = text.split(" ").filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    let piece = word;
    // A single word longer than the line (a URL, say) is cut instead of running off the page.
    while (width(piece, size, bold) > maxWidth) {
      let cut = piece.length - 1;
      while (cut > 1 && width(piece.slice(0, cut), size, bold) > maxWidth) cut--;
      if (line) { lines.push(line); line = ""; }
      lines.push(piece.slice(0, cut));
      piece = piece.slice(cut);
    }
    const candidate = line ? `${line} ${piece}` : piece;
    if (width(candidate, size, bold) <= maxWidth) line = candidate;
    else { lines.push(line); line = piece; }
  }
  if (line) lines.push(line);
  return lines;
}

const hex = (text: string) => "<" + Array.from(text, (char) => (byteFor(char) ?? 0x20).toString(16).padStart(2, "0")).join("") + ">";
const utf16Hex = (text: string) => "<FEFF" + Array.from(text.normalize("NFC"), (char) =>
  char.codePointAt(0)! > 0xffff
    ? Array.from(char.length === 2 ? char : "", (_, i) => char.charCodeAt(i).toString(16).padStart(4, "0")).join("")
    : char.charCodeAt(0).toString(16).padStart(4, "0")).join("").toUpperCase() + ">";
const num = (value: number) => (Math.round(value * 100) / 100).toString();


const COLOR = {
  navy: "0.05 0.16 0.36", blue: "0.145 0.388 0.922", cyan: "0.404 0.91 0.976", tint: "0.933 0.957 1",
  ink: "0.1 0.1 0.1", gray: "0.38 0.38 0.38", rule: "0.78 0.83 0.9", white: "1 1 1", paleBlue: "0.8 0.9 1",
};

type Item =
  | { raw: string }
  | { text: string; x: number; y: number; size: number; bold: boolean; color: string; spacing?: number };

const rect = (x: number, y: number, w: number, h: number, color: string) => `${color} rg ${num(x)} ${num(y)} ${num(w)} ${num(h)} re f`;

/** Closed rounded rectangle path (fill it with «f»). */
function roundedRect(x: number, y: number, w: number, h: number, r: number): string {
  const k = r * 0.5523;
  const p = (a: number, b: number) => `${num(a)} ${num(b)}`;
  return [
    `${p(x + r, y)} m`, `${p(x + w - r, y)} l`,
    `${p(x + w - r + k, y)} ${p(x + w, y + r - k)} ${p(x + w, y + r)} c`, `${p(x + w, y + h - r)} l`,
    `${p(x + w, y + h - r + k)} ${p(x + w - r + k, y + h)} ${p(x + w - r, y + h)} c`, `${p(x + r, y + h)} l`,
    `${p(x + r - k, y + h)} ${p(x, y + h - r + k)} ${p(x, y + h - r)} c`, `${p(x, y + r)} l`,
    `${p(x, y + r - k)} ${p(x + r - k, y)} ${p(x + r, y)} c`, "h",
  ].join(" ");
}

/** The Destinauta icon (same shapes as app/icon.svg, 64-unit grid) drawn as vectors. */
function logo(x: number, top: number, size: number): string {
  const s = size / 64;
  const P = (a: number, b: number) => `${num(x + a * s)} ${num(top - b * s)}`;
  return [
    `${COLOR.blue} rg ${roundedRect(x, top - size, size, size, 16 * s)} f`,
    `${COLOR.white} rg ${P(21, 13)} m ${P(32, 13)} l ${P(45, 13)} ${P(53, 21)} ${P(53, 32)} c ${P(53, 43)} ${P(45, 51)} ${P(32, 51)} c`
      + ` ${P(21, 51)} l ${P(21, 13)} l h ${P(31, 22)} m ${P(31, 42)} l ${P(32, 42)} l ${P(39, 42)} ${P(43, 38)} ${P(43, 32)} c`
      + ` ${P(43, 26)} ${P(39, 22)} ${P(32, 22)} c ${P(31, 22)} l h f*`,
    `${COLOR.cyan} rg ${P(8, 49)} m ${P(13, 36)} l ${P(18, 49)} l ${P(13, 46)} l h f`,
  ].join("\n");
}

const STYLES = {
  title: { size: 20, bold: true, before: 0, after: 8, leading: 25, color: COLOR.navy },
  heading: { size: 13, bold: true, before: 16, after: 4, leading: 17, color: COLOR.navy },
  subheading: { size: 9, bold: true, before: 8, after: 3, leading: 13, color: COLOR.blue, spacing: 0.8 },
  paragraph: { size: 11, bold: false, before: 0, after: 6, leading: 15, color: COLOR.ink },
  bullet: { size: 11, bold: false, before: 0, after: 3, leading: 15, color: COLOR.ink },
  note: { size: 9, bold: false, before: 10, after: 2, leading: 12, color: COLOR.gray },
} as const;

/** First-page band: logo, wordmark, country, title and trip line. Returns what it draws and where it ends. */
function bannerItems(banner: PdfBanner, innerWidth: number): { items: Item[]; bottom: number } {
  const titleLines = wrap(toWinAnsiText(banner.title), innerWidth, 26, true).slice(0, 3);
  const subtitleLines = banner.subtitle ? wrap(toWinAnsiText(banner.subtitle), innerWidth, 11, false).slice(0, 2) : [];
  const texts: Item[] = [];
  let y = PAGE.height - 70;
  for (const line of titleLines) { y -= 31; texts.push({ text: line, x: PAGE.left, y, size: 26, bold: true, color: COLOR.white }); }
  if (subtitleLines.length) y -= 4;
  for (const line of subtitleLines) { y -= 16; texts.push({ text: line, x: PAGE.left, y, size: 11, bold: false, color: COLOR.paleBlue }); }
  const bottom = y - 22;
  const kicker = toWinAnsiText((banner.kicker ?? "").toUpperCase());
  const kickerItems: Item[] = kicker ? [{
    text: kicker, x: PAGE.width - PAGE.right - width(kicker, 9, true) - 1.5 * kicker.length, y: PAGE.height - 43,
    size: 9, bold: true, color: COLOR.cyan, spacing: 1.5,
  }] : [];
  return {
    bottom: bottom - 4,
    items: [
      { raw: rect(0, bottom, PAGE.width, PAGE.height - bottom, COLOR.navy) },
      { raw: rect(0, bottom - 4, PAGE.width, 4, COLOR.cyan) },
      { raw: logo(PAGE.left, PAGE.height - 24, 30) },
      { text: "DESTINAUTA", x: PAGE.left + 40, y: PAGE.height - 43, size: 12, bold: true, color: COLOR.white, spacing: 2 },
      ...kickerItems, ...texts,
    ],
  };
}

/** Lays the blocks out on A4 pages; headings and day labels never stay alone at the bottom of a page. */
function layout(doc: PdfDocument): Item[][] {
  const pages: Item[][] = [[]];
  const left = PAGE.left, right = PAGE.width - PAGE.right, innerWidth = right - left;
  const floor = PAGE.bottom;
  let y = PAGE.height - PAGE.top;
  let fresh = true; // nothing placed yet below the top of the current page: no spacing before the first block
  const page = () => pages[pages.length - 1];
  const newPage = () => { pages.push([]); y = PAGE.height - PAGE.top; fresh = true; };
  // Moves to a new page when `needed` does not fit; otherwise adds the spacing before the block.
  const room = (needed: number, before: number) => {
    if (y - before - needed < floor && !fresh) newPage();
    else if (!fresh) y -= before;
  };

  if (doc.banner) {
    const banner = bannerItems(doc.banner, innerWidth);
    pages[0].push(...banner.items);
    y = banner.bottom - 26;
  }

  for (const block of doc.blocks) {
    if (block.kind === "space") { y -= block.points ?? 8; continue; }

    if (block.kind === "day") {
      const label = toWinAnsiText(block.label.toUpperCase());
      if (!label) continue;
      const pill = width(label, 10, true) + 0.8 * label.length + 22;
      const title = block.title ? wrap(toWinAnsiText(block.title), innerWidth - pill - 10, 13, true).slice(0, 2) : [];
      room(20 + 2 * 15, 18);
      const top = y, baseline = top - 14;
      page().push({ raw: `${COLOR.navy} rg ${roundedRect(left, top - 20, pill, 20, 10)} f` });
      page().push({ text: label, x: left + 11, y: baseline, size: 10, bold: true, color: COLOR.white, spacing: 0.8 });
      let lowest = top - 20;
      title.forEach((line, index) => {
        const lineY = baseline - index * 17;
        page().push({ text: line, x: left + pill + 10, y: lineY, size: 13, bold: true, color: COLOR.navy });
        lowest = Math.min(lowest, lineY - 5);
      });
      y = lowest - 6; fresh = false;
      continue;
    }

    if (block.kind === "panel") {
      const labelWidth = 158, pad = 10;
      const rows = block.rows.map((row) => ({ label: toWinAnsiText(row.label ?? ""), value: toWinAnsiText(row.value), small: !!row.small }))
        .filter((row) => row.value);
      if (!rows.length) continue;
      const laid = rows.map((row) => {
        const leading = row.small ? 12 : 15, size = row.small ? 9 : 11;
        const x = row.label ? left + 14 + labelWidth : left + 14;
        const values = wrap(row.value, right - 10 - x, size, false);
        const labels = row.label ? wrap(row.label, labelWidth - 8, 9, true) : [];
        return { ...row, leading, size, x, values, labels, height: Math.max(values.length * leading, labels.length * 12 + 3) };
      });
      const height = pad * 2 + laid.reduce((sum, row) => sum + row.height, 0) + 4 * (laid.length - 1);
      room(height, 12);
      const top = y;
      page().push({ raw: `${rect(left, top - height, innerWidth, height, COLOR.tint)}\n${rect(left, top - height, 3, height, COLOR.blue)}` });
      let cursor = top - pad;
      laid.forEach((row, index) => {
        if (index) cursor -= 4;
        const first = cursor - row.leading;
        row.labels.forEach((text, i) => page().push({ text, x: left + 14, y: first - i * 12, size: 9, bold: true, color: COLOR.blue }));
        row.values.forEach((text, i) => page().push({ text, x: row.x, y: first - i * row.leading, size: row.size, bold: false, color: row.small ? COLOR.gray : COLOR.ink }));
        cursor -= row.height;
      });
      y = top - height - 8; fresh = false;
      continue;
    }

    if (block.kind === "notes") {
      const title = toWinAnsiText(block.title);
      const gap = 24, style = STYLES.heading;
      room(style.leading + style.after + 5 * gap, 22); // a notes area needs room for at least five lines
      if (title) { y -= style.leading; page().push({ text: title, x: left, y, size: style.size, bold: true, color: style.color }); y -= style.after; fresh = false; }
      const count = Math.min(Math.max(0, Math.floor(block.lines)), Math.floor((y - floor) / gap));
      for (let i = 0; i < count; i++) {
        y -= gap;
        page().push({ raw: `${COLOR.rule} RG 0.6 w [1 3] 0 d ${num(left)} ${num(y)} m ${num(right)} ${num(y)} l S [] 0 d` });
      }
      fresh = false;
      continue;
    }

    const style = STYLES[block.kind];
    const indent = block.kind === "bullet" ? 14 : 0;
    const lead = block.kind === "bullet" && block.lead ? toWinAnsiText(block.lead) : "";
    const body = toWinAnsiText(block.text);
    const joined = (lead ? lead + (body ? " - " : "") : "") + body;
    const text = block.kind === "subheading" ? toWinAnsiText(joined.toUpperCase()) : joined;
    const lines = wrap(text, innerWidth - indent, style.size, style.bold);
    if (!lines.length) continue;
    const keepNext = block.kind === "heading" || block.kind === "subheading" || block.kind === "title";
    room(style.leading + (keepNext ? 2 * 15 : 0), style.before);
    const spacing = "spacing" in style ? style.spacing : undefined;
    lines.forEach((line, lineIndex) => {
      if (y - style.leading < floor) newPage();
      y -= style.leading; fresh = false;
      if (block.kind === "bullet" && lineIndex === 0) page().push({ text: "•", x: left + 2, y, size: style.size, bold: false, color: COLOR.blue });
      page().push({ text: line, x: left + indent, y, size: style.size, bold: style.bold, color: style.color, spacing });
    });
    y -= style.after;
    if (block.kind === "title") page().push({ raw: `${COLOR.navy} RG 1 w ${num(left)} ${num(y + 2)} m ${num(right)} ${num(y + 2)} l S` });
  }
  return pages;
}

export function buildPdf(doc: PdfDocument): Uint8Array {
  const pages = layout(doc);
  const footer = toWinAnsiText(doc.footer);
  const objects: string[] = [];
  const add = (body: string) => { objects.push(body); return objects.length; };

  // 1 Catalog, 2 Pages, 3 Helvetica, 4 Helvetica-Bold, 5 Info; pages and contents follow.
  add("<< /Type /Catalog /Pages 2 0 R >>");
  add(""); // Pages, filled in once the page objects exist.
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  add(`<< /Title ${utf16Hex(doc.title)} /Producer ${utf16Hex("Destinauta")} >>`);
  const pageIds: number[] = [];
  pages.forEach((placed, pageIndex) => {
    const ops: string[] = [];
    // Slim colour strip on every page that has no cover band.
    if (!(doc.banner && pageIndex === 0)) ops.push(rect(0, PAGE.height - 8, PAGE.width, 8, COLOR.navy), rect(0, PAGE.height - 10, PAGE.width, 2, COLOR.cyan));
    for (const item of placed) {
      if ("raw" in item) { ops.push(item.raw); continue; }
      const spaced = item.spacing ? ` ${num(item.spacing)} Tc` : "";
      ops.push(`${item.color} rg BT${spaced} /${item.bold ? "F2" : "F1"} ${item.size} Tf ${num(item.x)} ${num(item.y)} Td ${hex(item.text)} Tj${spaced ? " 0 Tc" : ""} ET`);
    }
    const label = `${pageIndex + 1}/${pages.length}`;
    ops.push(`${COLOR.rule} RG 0.6 w ${num(PAGE.left)} 52 m ${num(PAGE.width - PAGE.right)} 52 l S`);
    ops.push(`0.45 0.45 0.45 rg BT /F1 9 Tf ${num(PAGE.left)} 36 Td ${hex(footer)} Tj ET`);
    ops.push(`0.45 0.45 0.45 rg BT /F1 9 Tf ${num(PAGE.width - PAGE.right - width(label, 9, false))} 36 Td ${hex(label)} Tj ET`);
    const stream = ops.join("\n");
    const contentId = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    pageIds.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE.width} ${PAGE.height}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`));
  });
  objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  let out = "%PDF-1.4\n%âãÏÓ\n";
  const offsets: number[] = [];
  objects.forEach((body, index) => { offsets.push(out.length); out += `${index + 1} 0 obj\n${body}\nendobj\n`; });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) out += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 5 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  // Every character is below 0x100, so one char is one byte.
  return Uint8Array.from(out, (char) => char.charCodeAt(0));
}

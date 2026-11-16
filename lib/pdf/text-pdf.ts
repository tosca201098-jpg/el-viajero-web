// Minimal text-only PDF writer for itineraries. No dependencies, runs in the browser, nothing is uploaded.
// It uses the two standard Helvetica fonts (no embedding) with WinAnsi encoding, which covers Spanish, English,
// French, German, Italian, Portuguese and Catalan. Letters outside that set fall back to their plain letter.

export type PdfBlock =
  | { kind: "title"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "subheading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "bullet"; text: string; lead?: string }
  | { kind: "note"; text: string }
  | { kind: "space"; points?: number };
export type PdfDocument = { title: string; blocks: PdfBlock[]; footer: string };

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

type Line = { text: string; x: number; size: number; bold: boolean; gray?: number; color?: string };
type Placed = Line & { y: number; rule?: boolean };

const STYLES = {
  title: { size: 20, bold: true, before: 0, after: 8, leading: 25, color: "0.04 0.23 0.42" },
  heading: { size: 13, bold: true, before: 14, after: 4, leading: 17, color: "0.04 0.23 0.42" },
  subheading: { size: 11, bold: true, before: 8, after: 2, leading: 15, color: "0.2 0.2 0.2" },
  paragraph: { size: 11, bold: false, before: 0, after: 6, leading: 15, color: "0.1 0.1 0.1" },
  bullet: { size: 11, bold: false, before: 0, after: 3, leading: 15, color: "0.1 0.1 0.1" },
  note: { size: 9, bold: false, before: 10, after: 2, leading: 12, color: "0.38 0.38 0.38" },
} as const;

/** Lays the blocks out on A4 pages; headings never stay alone at the bottom of a page. */
function layout(blocks: PdfBlock[]): Placed[][] {
  const pages: Placed[][] = [[]];
  const innerWidth = PAGE.width - PAGE.left - PAGE.right;
  const floor = PAGE.bottom;
  let y = PAGE.height - PAGE.top;
  const newPage = () => { pages.push([]); y = PAGE.height - PAGE.top; };

  blocks.forEach((block, index) => {
    if (block.kind === "space") { y -= block.points ?? 8; return; }
    const style = STYLES[block.kind];
    const indent = block.kind === "bullet" ? 14 : 0;
    const lead = block.kind === "bullet" && block.lead ? toWinAnsiText(block.lead) : "";
    const body = toWinAnsiText(block.text);
    const lines = wrap((lead ? lead + (body ? " - " : "") : "") + body, innerWidth - indent, style.size, style.bold);
    if (!lines.length) return;
    // Keep headings with at least two lines of what follows.
    const keep = block.kind === "heading" || block.kind === "subheading" || block.kind === "title"
      ? style.before + style.leading + 2 * 15 : style.before + style.leading;
    if (y - keep < floor && pages[pages.length - 1].length) newPage();
    else if (pages[pages.length - 1].length) y -= style.before;
    lines.forEach((text, lineIndex) => {
      if (y - style.leading < floor) newPage();
      y -= style.leading;
      const page = pages[pages.length - 1];
      if (block.kind === "bullet" && lineIndex === 0) page.push({ text: "•", x: PAGE.left + 2, y, size: style.size, bold: false, color: style.color });
      page.push({ text, x: PAGE.left + indent, y, size: style.size, bold: style.bold, color: style.color });
    });
    y -= style.after;
    if (block.kind === "title") pages[pages.length - 1].push({ text: "", x: PAGE.left, y: y + 2, size: 0, bold: false, rule: true });
    void index;
  });
  return pages;
}

export function buildPdf(doc: PdfDocument): Uint8Array {
  const pages = layout(doc.blocks);
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
    for (const line of placed) {
      if (line.rule) { ops.push(`0.04 0.23 0.42 RG 1 w ${num(PAGE.left)} ${num(line.y)} m ${num(PAGE.width - PAGE.right)} ${num(line.y)} l S`); continue; }
      ops.push(`${line.color ?? "0 0 0"} rg BT /${line.bold ? "F2" : "F1"} ${line.size} Tf ${num(line.x)} ${num(line.y)} Td ${hex(line.text)} Tj ET`);
    }
    const label = `${pageIndex + 1}/${pages.length}`;
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

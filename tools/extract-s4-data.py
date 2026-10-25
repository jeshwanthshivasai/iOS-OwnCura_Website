"""Generates lib/s4-data.ts, the data of 04's cross layout, from v5 (handoff/reference/index.html).

The four options come from the cross markup (v5 lines 275-328): each diagram's SVG verbatim, the label on the cross,
and the body's words. The frame tables (P9, CIR, FR, NL, FRL, WIN, REC) come from S4Ctl's preamble (v5 lines 492-499).
Run from the repository root:  python3 tools/extract-s4-data.py
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ref = (ROOT / "handoff/reference/index.html").read_text().split("\n")

cross = "\n".join(ref[274:328])
quads = re.split(r'<div data-cq="(\d)"', cross)[1:]
out = []
for i in range(0, len(quads), 2):
    q, body = int(quads[i]), quads[i + 1]
    r = float(re.search(r'data-cg="" data-r="([\d.]+)"', body).group(1))
    svg = re.search(r'<div data-cg=[^>]*><svg viewBox="([^"]+)" preserveAspectRatio="([^"]+)" aria-hidden="true" style="[^"]*">(.*?)</svg></div>', body, re.S)
    ct = re.search(r'<h3 data-ct=""( data-size-as="([^"]+)")? style="[^"]*">([^<]+)<span aria-hidden="true"', body)
    h3 = re.search(r'<h3 data-cs="\d" data-st="([\d.]+)" data-d0="([\d.]+)"[^>]*>(.*?)</h3>', body, re.S)
    lp = re.search(r'<p data-cs="\d" data-st="([\d.]+)" data-d0="([\d.]+)"[^>]*>(.*?)</p>', body, re.S)
    cta = re.search(r'<div data-cs="\d" data-fade="" style="[^"]*"><a href="([^"]+)"[^>]*>([^<]+)</a>', body)
    out.append(dict(
        q=q, r=r, viewBox=svg.group(1), par=svg.group(2), diagram=svg.group(3), label=html.unescape(ct.group(3)), sizeAs=ct.group(2),
        title=[html.unescape(w) for w in re.findall(r'<span data-w="" style="[^"]*">([^<]+)', h3.group(3))], titleSt=h3.group(1), titleD0=h3.group(2),
        lead=[[html.unescape(w), wt == "600"] for wt, w in re.findall(r'font-weight: (\d+); color: #[0-9A-F]+;"><span data-w="" style="[^"]*">([^<]+)</span>', lp.group(3))],
        leadSt=lp.group(1), leadD0=lp.group(2), desc=html.unescape(re.search(r'<p data-cs="\d" data-fade="" style="[^"]*">([^<]+)</p>', body).group(1)),
        href=cta.group(1), cta=html.unescape(cta.group(2)),
    ))

tables = {}
for k in ["P9", "CIR", "FR", "NL", "FRL"]:
    line = next(l for l in ref[489:501] if l.startswith("var " + k + " ="))
    tables[k] = line.split("=", 1)[1].strip().rstrip(";")
wl = next(l for l in ref[489:501] if l.startswith("var WIN ="))
tables["WIN"] = re.search(r"WIN = (\[\[.*?\]\]),", wl).group(1)
tables["REC"] = re.search(r"REC = (\[[^\]]*\])", wl).group(1)
for v in tables.values():
    json.loads(v)

ts = [
    '/* 04, your four options: the data of the cross layout, generated from handoff/reference/index.html (v5 lines 275-328 and 492-499) by tools/extract-s4-data.py. Do not edit by hand. */', '',
    'export interface Quadrant { q: number; r: number; viewBox: string; par: string; diagram: string; label: string; sizeAs: string | null; title: string[]; titleSt: string; titleD0: string; lead: [string, boolean][]; leadSt: string; leadD0: string; desc: string; href: string; cta: string }',
    'export interface Box { d: number[]; t: number[]; b?: number[] }', '',
    '/** The four options in order (Keep it, Grow it, Bring in a partner, Hand it over): the diagram (v5 SVG, verbatim), the label on the cross, and the body (title words, lead words with their weight, the description, the button). */',
    'export const QUADRANTS: Quadrant[] = ' + json.dumps(out, ensure_ascii=False, indent=1) + ';', '',
    '/** The numerals 1–4 as nine points each, so every in-between shape is a clean polygon (v5 P9), and their circles (v5 CIR). */',
    'export const P9: Record<string, [number, number][]> = ' + tables["P9"] + ';',
    'export const CIR: Record<string, [number, number, number][]> = ' + tables["CIR"] + ';',
    '/** Every state of the cross as the designer drew it (Two States 4a–4e, 1920 × 958), box by box: d = diagram x, y, height · t = title x, y, size, max width, right-aligned · b = body x, y, width (the active box only). */',
    'export const FR: Record<string, Box[]> = ' + tables["FR"] + ';',
    "/** Each title's line count in the 1920 frames. */",
    'export const NL: number[][] = ' + tables["NL"] + ';',
    "/** The laptop frames (Two States 5a–5e, 1512 × 844): their size, the 4's right edge, the cross bar, the cross centres, the line counts, and every box, with the body's sizes. */",
    'export const FRL: { W: number; H: number; L0: number; th: number; C: [number, number][]; NL: number[][]; st: Record<string, Box[]> } = ' + tables["FRL"] + ';',
    "/** Where each option holds in 04's progress, and where the grid gathers. */",
    'export const WIN: [number, number][] = ' + tables["WIN"] + ';',
    'export const REC: [number, number] = ' + tables["REC"] + ';',
]
(ROOT / "lib/s4-data.ts").write_text("\n".join(ts) + "\n")
print("wrote lib/s4-data.ts")

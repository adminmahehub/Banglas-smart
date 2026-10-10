import { encode } from './qrcode';

/** QR code as a square matrix of dark (true) / light (false) modules, without the quiet zone. Fully client-side. */
export function qrMatrix(text: string): boolean[][] {
  const r: any = encode(text, { ecc: 'M', border: 0 });
  return r.data as boolean[][];
}

/** Dark modules as one SVG path (1 unit = 1 module). Quiet zone of `quiet` modules is added around it. */
export function qrSvgParts(text: string, quiet = 4): { size: number; path: string } {
  const m = qrMatrix(text);
  const size = m.length + quiet * 2;
  let path = '';
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m.length; x++) if (m[y][x]) path += `M${x + quiet},${y + quiet}h1v1h-1z`;
  }
  return { size, path };
}

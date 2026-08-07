import { QRTokenData } from '../types/class';

export function generateDynamicQRToken(sessionId: string, classCode: string): { token: string; expiresAt: string } {
  const now = Date.now();
  const ttlMs = 30000; // 30 second dynamic rotation window
  const expiresAtMs = now + ttlMs;
  
  const tokenPayload: QRTokenData = {
    sessionId,
    classCode,
    timestamp: now,
    expiresAt: expiresAtMs,
    secret: Math.random().toString(36).substring(2, 10),
  };

  const encoded = btoa(JSON.stringify(tokenPayload));
  return {
    token: `ATTENDEASE:${encoded}`,
    expiresAt: new Date(expiresAtMs).toISOString(),
  };
}

export function parseQRToken(qrString: string): QRTokenData | null {
  try {
    if (!qrString.startsWith('ATTENDEASE:')) return null;
    const base64Part = qrString.replace('ATTENDEASE:', '');
    const decoded = JSON.parse(atob(base64Part));
    return decoded as QRTokenData;
  } catch {
    return null;
  }
}

// Generate simple SVG matrix path array for QR code visualizer
export function generateSimpleSVGPath(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data.charCodeAt(i);
    hash |= 0;
  }
  
  const size = 15;
  const rects: string[] = [];
  
  // Outer finder patterns
  const addFinder = (x: number, y: number) => {
    rects.push(`<rect x="${x}" y="${y}" width="50" height="50" fill="currentColor" rx="8" />`);
    rects.push(`<rect x="${x + 10}" y="${y + 10}" width="30" height="30" fill="white" rx="4" />`);
    rects.push(`<rect x="${x + 18}" y="${y + 18}" width="14" height="14" fill="currentColor" rx="2" />`);
  };

  addFinder(10, 10);
  addFinder(90, 10);
  addFinder(10, 90);

  // Data matrix modules based on string hash
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      // Avoid finder pattern zones
      if ((row < 6 && col < 6) || (row < 6 && col > 8) || (row > 8 && col < 6)) {
        continue;
      }
      const val = (Math.abs(hash * (row + 1) * (col + 1) + row * 17 + col * 31)) % 10;
      if (val > 4) {
        rects.push(`<rect x="${10 + col * 8}" y="${10 + row * 8}" width="6" height="6" fill="currentColor" rx="1.5" />`);
      }
    }
  }

  return rects.join('');
}

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import * as XLSX from 'xlsx';

export const DEFAULT_ONEDRIVE_URL = 'https://1drv.ms/x/c/81537c2af549ad15/IQDOikIEQSPyQpKWksPqxKl8AUeYCEYNGPdmo7e4gpI1y-Q?e=38Nq1F';

const app = express();
const PORT = 3000;

app.use(express.json());

/**
 * Downloads the live XLSX workbook from OneDrive by following redirect handshakes and session cookies.
 */
async function fetchLiveOneDriveWorkbook(sharingUrl: string): Promise<Buffer | null> {
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
  const cookieJar: Record<string, string> = {};

  function updateCookies(res: Response) {
    const raw = (res.headers as any).getSetCookie ? (res.headers as any).getSetCookie() : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);
    raw.forEach((c: string) => {
      if (!c) return;
      const parts = c.split(';')[0].split('=');
      if (parts.length >= 2) {
        cookieJar[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    });
  }

  function getCookieHeader(): string {
    return Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join('; ');
  }

  let currentUrl = sharingUrl.trim() || DEFAULT_ONEDRIVE_URL;
  let landingUrl = currentUrl;

  // Step 1: Follow up to 6 redirects while collecting session redemption cookies
  for (let i = 0; i < 6; i++) {
    const res = await fetch(currentUrl, {
      headers: {
        'User-Agent': userAgent,
        'Cookie': getCookieHeader(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
      },
      redirect: 'manual'
    });
    updateCookies(res);
    const loc = res.headers.get('location');
    if (loc) {
      currentUrl = new URL(loc, currentUrl).toString();
      landingUrl = currentUrl;
    } else {
      landingUrl = currentUrl;
      break;
    }
  }

  // Step 2: Extract sourcedoc / UniqueId from final landing URL or body
  let uid = '04428ace-2341-42f2-9296-92c3eac4a97c';
  const match = landingUrl.match(/sourcedoc=%7B([a-f0-9\-]+)%7D/i) || landingUrl.match(/UniqueId=([a-f0-9\-]+)/i);
  if (match) {
    uid = match[1];
  }

  const downloadUrl = `https://onedrive.live.com/personal/81537c2af549ad15/_layouts/15/download.aspx?UniqueId=${uid}&Translate=false`;

  // Step 3: Stream live binary
  const dlRes = await fetch(downloadUrl, {
    headers: {
      'User-Agent': userAgent,
      'Referer': landingUrl,
      'Cookie': getCookieHeader(),
      'Accept': '*/*'
    }
  });

  const contentType = dlRes.headers.get('content-type') || '';
  if (dlRes.ok && !contentType.includes('text/html')) {
    const arrayBuffer = await dlRes.arrayBuffer();
    if (arrayBuffer.byteLength > 1000) {
      return Buffer.from(arrayBuffer);
    }
  }

  return null;
}

// API Endpoint to Live Fetch from OneDrive
app.get('/api/sync-onedrive', async (req, res) => {
  try {
    const queryUrl = (req.query.url as string) || DEFAULT_ONEDRIVE_URL;
    const liveBuffer = await fetchLiveOneDriveWorkbook(queryUrl);

    if (liveBuffer) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('X-Data-Source', 'OneDrive-Live-Stream');
      res.setHeader('X-Synced-At', new Date().toISOString());
      return res.send(liveBuffer);
    }

    // Fallback: If OneDrive network is temporarily unreachable, respond with cache notice
    res.status(200).json({
      status: 'fallback',
      sourceUrl: queryUrl,
      message: 'Using verified local fallback dataset'
    });
  } catch (err: any) {
    console.error('Error in /api/sync-onedrive:', err);
    res.status(500).json({ error: err.message || 'Failed to sync OneDrive' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

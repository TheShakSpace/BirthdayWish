import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
const CONFIG_FILE = path.join(UPLOADS_DIR, 'saved-config.json');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Load saved custom photos & config
  app.get('/api/config', (_req, res) => {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
        res.json(JSON.parse(raw));
        return;
      }
    } catch (err) {
      console.error('Error reading saved config:', err);
    }
    res.json({});
  });

  // Save uploaded photo (base64 data URL) to disk in /public/uploads/
  app.post('/api/upload', (req, res) => {
    try {
      const { slotKey, dataUrl } = req.body as { slotKey?: string; dataUrl?: string };
      if (!slotKey || !dataUrl || !dataUrl.startsWith('data:image/')) {
        res.status(400).json({ error: 'Invalid image payload' });
        return;
      }

      const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!matches) {
        res.status(400).json({ error: 'Malformed data URL' });
        return;
      }

      const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      const base64Data = matches[2];
      const safeSlot = slotKey.replace(/[^a-zA-Z0-9_-]/g, '');
      const filename = `${safeSlot}_${Date.now()}.${ext}`;
      const filePath = path.join(UPLOADS_DIR, filename);

      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
      const publicUrl = `/uploads/${filename}`;

      // Update saved-config.json
      let currentConfig: Record<string, unknown> = {};
      if (fs.existsSync(CONFIG_FILE)) {
        try {
          currentConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
        } catch {
          currentConfig = {};
        }
      }
      currentConfig[safeSlot] = publicUrl;
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(currentConfig, null, 2));

      res.json({ url: publicUrl, config: currentConfig });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Failed to save image' });
    }
  });

  // Save text config (captions, recipient name, secret code, etc.)
  app.post('/api/config', (req, res) => {
    try {
      let currentConfig: Record<string, unknown> = {};
      if (fs.existsSync(CONFIG_FILE)) {
        try {
          currentConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
        } catch {
          currentConfig = {};
        }
      }
      const updated = { ...currentConfig, ...req.body };
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2));
      res.json({ config: updated });
    } catch (err) {
      console.error('Save config error:', err);
      res.status(500).json({ error: 'Failed to save config' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

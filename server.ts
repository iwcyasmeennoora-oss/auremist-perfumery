import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createOrderViaServerSupabase,
  fetchCatalogAndZonesFromSupabase,
  getServerSupabaseDiagnostics,
  isServerSupabaseConfigured,
  testServerSupabaseConnection,
  type CreateOrderRequestBody,
} from './server/supabaseServer.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

for (const envFile of ['.env.local', '.env']) {
  const envPath = path.resolve(__dirname, envFile);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}

async function startServer() {
  const app = express();
  const isProd = process.env.NODE_ENV === 'production';
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '8mb' }));

  app.use('/api', (_req: Request, res: Response, next) => {
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate',
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    const diag = getServerSupabaseDiagnostics();
    res.json({
      ok: true,
      supabaseConfigured: diag.configured,
      env: {
        hasUrl: diag.hasUrl,
        hasKey: diag.hasKey,
        urlVar: diag.urlVar,
        keyVar: diag.keyVar,
      },
    });
  });

  const handleSupabaseTest = async (_req: Request, res: Response) => {
    try {
      const result = await testServerSupabaseConnection();
      res.status(result.ok ? 200 : result.configured ? 502 : 503).json(result);
    } catch (error) {
      res.status(500).json({
        ok: false,
        configured: isServerSupabaseConfigured(),
        message:
          error instanceof Error
            ? error.message
            : 'Unexpected error testing Supabase connection.',
      });
    }
  };

  app.get('/api/supabase/test', handleSupabaseTest);
  app.get('/api/health/supabase', handleSupabaseTest);

  app.get('/api/catalog', async (_req: Request, res: Response) => {
    try {
      const catalog = await fetchCatalogAndZonesFromSupabase();
      res.status(catalog.ok ? 200 : catalog.configured ? 502 : 503).json(catalog);
    } catch (error) {
      res.status(500).json({
        ok: false,
        configured: isServerSupabaseConfigured(),
        products: [],
        variants: [],
        deliveryZones: [],
        message:
          error instanceof Error
            ? error.message
            : 'Failed to load catalog from Supabase.',
      });
    }
  });

  app.post('/api/orders', async (req: Request, res: Response) => {
    try {
      const body = (req.body ?? {}) as CreateOrderRequestBody;
      const result = await createOrderViaServerSupabase(body);
      res.status(result.statusCode).json(result);
    } catch (error) {
      res.status(500).json({
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : 'Unexpected server error while placing your order.',
      });
    }
  });

  app.all('/api/*', (_req: Request, res: Response) => {
    res.status(404).json({ ok: false, message: 'API route not found.' });
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
        return;
      }
      res.status(404).send('Production build not found.');
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`AUREMIST server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start AUREMIST server:', err);
  process.exit(1);
});

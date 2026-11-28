import {
  fetchCatalogAndZonesFromSupabase,
  isServerSupabaseConfigured,
} from '../server/supabaseServer.ts';
import {
  sendJson,
  type VercelRequest,
  type VercelResponse,
} from './_vercelHelper.ts';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    sendJson(res, 405, { ok: false, message: 'Method not allowed.' });
    return;
  }

  try {
    const catalog = await fetchCatalogAndZonesFromSupabase();
    sendJson(res, catalog.ok ? 200 : catalog.configured ? 502 : 503, catalog);
  } catch (error) {
    sendJson(res, 500, {
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
}

import {
  isServerSupabaseConfigured,
  testServerSupabaseConnection,
} from '../../server/supabaseServer.ts';
import {
  sendJson,
  type VercelRequest,
  type VercelResponse,
} from '../_vercelHelper.ts';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    sendJson(res, 405, { ok: false, message: 'Method not allowed.' });
    return;
  }

  try {
    const result = await testServerSupabaseConnection();
    sendJson(res, result.ok ? 200 : result.configured ? 502 : 503, result);
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      configured: isServerSupabaseConfigured(),
      message:
        error instanceof Error
          ? error.message
          : 'Unexpected error testing Supabase connection.',
    });
  }
}

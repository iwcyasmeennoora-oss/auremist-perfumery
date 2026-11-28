import { getServerSupabaseDiagnostics } from '../server/supabaseServer.ts';
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

  const diag = getServerSupabaseDiagnostics();
  sendJson(res, 200, {
    ok: true,
    supabaseConfigured: diag.configured,
    env: {
      hasUrl: diag.hasUrl,
      hasKey: diag.hasKey,
      urlVar: diag.urlVar,
      keyVar: diag.keyVar,
    },
  });
}

import {
  createOrderViaServerSupabase,
  type CreateOrderRequestBody,
} from '../server/supabaseServer.ts';
import {
  readJsonBody,
  sendJson,
  type VercelRequest,
  type VercelResponse,
} from './_vercelHelper.ts';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, message: 'Method not allowed.' });
    return;
  }

  try {
    const body = await readJsonBody<CreateOrderRequestBody>(req);
    const result = await createOrderViaServerSupabase(body ?? {});
    sendJson(res, result.statusCode, result);
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unexpected server error while placing your order.',
    });
  }
}

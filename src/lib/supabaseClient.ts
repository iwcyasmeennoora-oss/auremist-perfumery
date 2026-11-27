import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey: string | null = null;

export function normalizeSupabaseUrl(rawUrl: string | undefined): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  const stripped = trimmed.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
  try {
    const parsed = new URL(stripped);
    const isLocalhost =
      parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    if (parsed.protocol !== 'https:' && !(isLocalhost && parsed.protocol === 'http:')) {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

function getSupabaseEnv(): { url: string | null; key: string | null } {
  const url = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
  const rawKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY;
  const key =
    typeof rawKey === 'string' && rawKey.trim().length > 0
      ? rawKey.trim()
      : null;

  return { url, key };
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseEnv();
  return Boolean(url && key);
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseEnv();
  if (!url || !key) return null;

  const configKey = `${url}::${key.slice(0, 12)}`;
  if (cachedClient && cachedConfigKey === configKey) {
    return cachedClient;
  }

  cachedClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  cachedConfigKey = configKey;
  return cachedClient;
}

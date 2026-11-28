export interface ServerSupabaseHealth {
  ok: boolean;
  supabaseConfigured: boolean;
}

export interface ServerSupabaseTestResponse {
  ok: boolean;
  configured: boolean;
  message: string;
  counts?: {
    products: number;
    productVariants: number;
    deliveryZones: number;
  };
}

let cachedSupabaseConfigured: boolean | null = null;

export async function fetchServerSupabaseStatus(): Promise<ServerSupabaseHealth> {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      return { ok: false, supabaseConfigured: false };
    }
    const data = (await response.json()) as Partial<ServerSupabaseHealth>;
    const configured = Boolean(data.supabaseConfigured);
    cachedSupabaseConfigured = configured;
    return {
      ok: Boolean(data.ok),
      supabaseConfigured: configured,
    };
  } catch {
    return { ok: false, supabaseConfigured: false };
  }
}

export function isSupabaseConfigured(): boolean {
  return cachedSupabaseConfigured ?? true;
}

export async function testServerSupabaseConnection(): Promise<ServerSupabaseTestResponse> {
  try {
    const response = await fetch('/api/supabase/test', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    const data = (await response.json()) as ServerSupabaseTestResponse;
    cachedSupabaseConfigured = Boolean(data.configured);
    return data;
  } catch {
    return {
      ok: false,
      configured: false,
      message: 'Unable to reach backend Supabase health check endpoint.',
    };
  }
}

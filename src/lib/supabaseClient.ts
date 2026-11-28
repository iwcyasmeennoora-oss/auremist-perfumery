export interface ServerSupabaseHealth {
  ok: boolean;
  apiReachable: boolean;
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

async function readJsonResponse<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return null;
  }
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchServerSupabaseStatus(): Promise<ServerSupabaseHealth> {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const data = await readJsonResponse<Partial<ServerSupabaseHealth>>(response);
      if (data && typeof data.supabaseConfigured === 'boolean') {
        cachedSupabaseConfigured = data.supabaseConfigured;
        return {
          ok: Boolean(data.ok),
          apiReachable: true,
          supabaseConfigured: data.supabaseConfigured,
        };
      }
    }

    const fallback = await fetch('/api/supabase/test', {
      method: 'GET',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });
    const testData = await readJsonResponse<Partial<ServerSupabaseTestResponse>>(fallback);
    if (testData && typeof testData.configured === 'boolean') {
      cachedSupabaseConfigured = testData.configured;
      return {
        ok: Boolean(testData.ok),
        apiReachable: true,
        supabaseConfigured: testData.configured,
      };
    }

    return { ok: false, apiReachable: false, supabaseConfigured: false };
  } catch {
    return { ok: false, apiReachable: false, supabaseConfigured: false };
  }
}

export function isSupabaseConfigured(): boolean {
  return cachedSupabaseConfigured ?? true;
}

export async function testServerSupabaseConnection(): Promise<ServerSupabaseTestResponse> {
  try {
    const response = await fetch('/api/supabase/test', {
      method: 'GET',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });
    const data = await readJsonResponse<ServerSupabaseTestResponse>(response);
    if (!data) {
      return {
        ok: false,
        configured: false,
        message: 'Backend Supabase health endpoint returned an unexpected response.',
      };
    }
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

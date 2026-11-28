import { ALL_PERFUMES } from '../data/fragrances';
import {
  BottleSize,
  BottleVariant,
  DeliveryZoneOption,
  PerfumeProduct,
} from '../types/perfume';
import { setServerDeliveryZones } from './shipping';

interface ApiCatalogProduct {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  full_description: string | null;
  default_size: string;
  price_pkr: number;
  original_price_pkr: number | null;
  in_stock: boolean;
  featured_rank: number;
  newest_rank: number;
}

interface ApiCatalogVariant {
  product_id: string;
  bottle_size: BottleSize;
  sku: string;
  price_pkr: number;
  original_price_pkr: number | null;
  stock_count: number;
}

interface ApiDeliveryZone {
  id: string;
  name: string;
  region: string;
  fee_pkr: number;
  estimated_window: string | null;
  supported_provinces: string[] | null;
  priority_cities: string[] | null;
  is_nationwide_fallback: boolean;
}

interface ApiCatalogResponse {
  ok: boolean;
  configured: boolean;
  products: ApiCatalogProduct[];
  variants: ApiCatalogVariant[];
  deliveryZones: ApiDeliveryZone[];
}

export async function fetchLiveCatalogAndZones(): Promise<{
  products: PerfumeProduct[];
  deliveryZones: DeliveryZoneOption[] | null;
}> {
  try {
    const response = await fetch('/api/catalog', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      return { products: ALL_PERFUMES, deliveryZones: null };
    }

    const data = (await response.json()) as ApiCatalogResponse;
    if (!data.ok || !Array.isArray(data.products) || data.products.length === 0) {
      return { products: ALL_PERFUMES, deliveryZones: null };
    }

    const dbProductMap = new Map(data.products.map((p) => [p.id, p]));
    const dbVariantsByProduct = new Map<string, BottleVariant[]>();

    for (const v of data.variants ?? []) {
      const list = dbVariantsByProduct.get(v.product_id) ?? [];
      list.push({
        size: v.bottle_size,
        price: v.price_pkr,
        originalPrice:
          v.original_price_pkr !== null ? v.original_price_pkr : undefined,
        sku: v.sku,
        stockCount: v.stock_count,
      });
      dbVariantsByProduct.set(v.product_id, list);
    }

    const sizeOrder: Record<BottleSize, number> = {
      '30ml': 1,
      '50ml': 2,
      '100ml': 3,
    };

    const mergedProducts: PerfumeProduct[] = ALL_PERFUMES.map((base) => {
      const dbProd = dbProductMap.get(base.id);
      if (!dbProd) return base;

      const dbVariants = dbVariantsByProduct.get(base.id);
      const variants =
        dbVariants && dbVariants.length > 0
          ? [...dbVariants].sort(
              (a, b) => (sizeOrder[a.size] ?? 9) - (sizeOrder[b.size] ?? 9),
            )
          : base.variants;

      const hasAnyStock = variants.some((v) => v.stockCount > 0);
      return {
        ...base,
        name: dbProd.name || base.name,
        subtitle: dbProd.subtitle || base.subtitle,
        description: dbProd.description || base.description,
        fullDescription: dbProd.full_description ?? base.fullDescription,
        price: Number.isFinite(dbProd.price_pkr) ? dbProd.price_pkr : base.price,
        originalPrice:
          dbProd.original_price_pkr !== null
            ? dbProd.original_price_pkr
            : base.originalPrice,
        inStock: Boolean(dbProd.in_stock && hasAnyStock),
        featuredRank: dbProd.featured_rank ?? base.featuredRank,
        newestRank: dbProd.newest_rank ?? base.newestRank,
        variants,
      };
    });

    let mappedZones: DeliveryZoneOption[] | null = null;
    if (Array.isArray(data.deliveryZones) && data.deliveryZones.length > 0) {
      mappedZones = data.deliveryZones.map((z) => ({
        id: z.id,
        name: z.name,
        region: z.region,
        fee: Math.round(z.fee_pkr),
        estimatedWindow: z.estimated_window ?? undefined,
        supportedProvinces: z.supported_provinces ?? undefined,
        priorityCities: z.priority_cities ?? undefined,
        isNationwideFallback: Boolean(z.is_nationwide_fallback),
      }));
      setServerDeliveryZones(mappedZones);
    }

    return {
      products: mergedProducts,
      deliveryZones: mappedZones,
    };
  } catch {
    return { products: ALL_PERFUMES, deliveryZones: null };
  }
}

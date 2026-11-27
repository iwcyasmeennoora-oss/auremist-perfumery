import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Info,
  Minus,
  Package,
  Plus,
  Search,
} from 'lucide-react';
import { formatPrice } from '../../data/fragrances';
import { AdminProductRecord } from '../../types/admin';

type StockFilter = 'all' | 'low_only' | 'out_of_stock';

interface AdminInventoryViewProps {
  products: AdminProductRecord[];
  lowStockThreshold: number;
  onAdjustStock: (productId: string, sku: string, nextStock: number) => void;
}

export function AdminInventoryView({
  products,
  lowStockThreshold,
  onAdjustStock,
}: AdminInventoryViewProps) {
  const [filter, setFilter] = useState<StockFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allVariantRows = useMemo(() => {
    return products.flatMap((product) =>
      product.variants.map((variant) => ({
        productId: product.id,
        productName: product.name,
        category: product.audienceCategory,
        family: product.fragranceFamily,
        size: variant.size,
        sku: variant.sku,
        price: variant.price,
        stockCount: variant.stockCount,
      })),
    );
  }, [products]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allVariantRows.filter((r) => {
      if (filter === 'low_only' && r.stockCount > lowStockThreshold) {
        return false;
      }
      if (filter === 'out_of_stock' && r.stockCount !== 0) {
        return false;
      }
      if (q) {
        return (
          r.productName.toLowerCase().includes(q) ||
          r.sku.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allVariantRows, filter, searchQuery, lowStockThreshold]);

  const lowCount = allVariantRows.filter(
    (r) => r.stockCount > 0 && r.stockCount <= lowStockThreshold,
  ).length;
  const outCount = allVariantRows.filter((r) => r.stockCount === 0).length;

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/55 flex items-start gap-3">
        <Info
          className="w-4 h-4 text-[#8C6526] shrink-0 mt-0.5"
          strokeWidth={1.8}
        />
        <p className="text-xs sm:text-sm text-[#26151D] leading-relaxed">
          <strong className="font-semibold text-[#351522]">
            Inventory &amp; Stock Control (Demo Mode):
          </strong>{' '}
          Adjust bottle variant stock levels below. Updates immediately reflect
          in the Overview Low-Stock Alerts and Products summary in memory.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5 text-[#351522] font-medium tabular-nums">
            <Package className="w-4 h-4 text-[#8C6526]" strokeWidth={1.6} />
            {allVariantRows.length} Total SKUs
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#8C6526] font-medium tabular-nums">
            <AlertTriangle className="w-4 h-4" strokeWidth={1.6} />
            {lowCount} Low Stock (≤ {lowStockThreshold}) · {outCount} Out of
            Stock
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search
              className="w-4 h-4 text-[#5C434E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              strokeWidth={1.6}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SKU or perfume..."
              aria-label="Search inventory SKUs"
              className="w-full sm:w-56 pl-9 pr-3 py-2 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/60 text-xs text-[#26151D] focus:outline-none focus:border-[#351522]"
            />
          </div>

          <div className="inline-flex items-center p-1 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/50 self-start sm:self-auto">
            {(
              [
                { id: 'all', label: 'All SKUs' },
                { id: 'low_only', label: 'Low & Empty' },
                { id: 'out_of_stock', label: 'Out of Stock' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFilter(opt.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  filter === opt.id
                    ? 'bg-[#351522] text-[#FFF5E9]'
                    : 'text-[#5C434E] hover:text-[#351522]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 overflow-hidden">
        {filteredRows.length === 0 ? (
          <div className="py-14 px-6 text-center space-y-3">
            <p className="font-serif text-2xl font-medium text-[#351522]">
              {filter === 'out_of_stock' && !searchQuery.trim()
                ? 'All fragrance variants are currently stocked'
                : 'No matching SKUs found'}
            </p>
            <p className="text-xs sm:text-sm text-[#5C434E] max-w-md mx-auto">
              {filter === 'out_of_stock' && !searchQuery.trim()
                ? 'Every bottle variant in the demo catalog currently has available inventory.'
                : 'Adjust your SKU search or stock filter to view inventory variants.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setFilter('all');
                setSearchQuery('');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-xs font-medium cursor-pointer"
            >
              Show All SKUs
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#D6AD72]/30 bg-[#F8F0E7] text-[11px] uppercase tracking-[0.12em] text-[#5C434E]">
                  <th className="py-3.5 px-4 font-semibold">SKU</th>
                  <th className="py-3.5 px-4 font-semibold">Perfume</th>
                  <th className="py-3.5 px-4 font-semibold">Size</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Price</th>
                  <th className="py-3.5 px-4 font-semibold text-center">
                    Adjust Quantity
                  </th>
                  <th className="py-3.5 px-4 font-semibold text-right">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">
                    Quick Restock
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6AD72]/20">
                {filteredRows.map((row) => {
                  const isOut = row.stockCount === 0;
                  const isLow =
                    row.stockCount > 0 && row.stockCount <= lowStockThreshold;

                  return (
                    <tr
                      key={row.sku}
                      className="hover:bg-[#F8F0E7]/65 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-xs text-[#5C434E] whitespace-nowrap">
                        {row.sku}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#351522] whitespace-nowrap">
                        {row.productName}
                      </td>
                      <td className="py-3 px-4 text-[#26151D] whitespace-nowrap">
                        {row.size}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums whitespace-nowrap">
                        {formatPrice(row.price)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center justify-center gap-1.5 w-full">
                          <button
                            type="button"
                            disabled={row.stockCount <= 0}
                            onClick={() =>
                              onAdjustStock(
                                row.productId,
                                row.sku,
                                Math.max(0, row.stockCount - 1),
                              )
                            }
                            aria-label={`Decrease stock for ${row.sku}`}
                            className="w-7 h-7 rounded border border-[#D6AD72]/60 bg-[#F8F0E7] flex items-center justify-center text-[#351522] disabled:opacity-40 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" strokeWidth={1.7} />
                          </button>
                          <input
                            type="number"
                            min={0}
                            aria-label={`Available stock for ${row.sku}`}
                            value={row.stockCount}
                            onChange={(e) => {
                              const parsed = Math.max(
                                0,
                                Math.floor(Number(e.target.value) || 0),
                              );
                              onAdjustStock(row.productId, row.sku, parsed);
                            }}
                            className="w-14 text-center py-1 rounded border border-[#D6AD72]/50 bg-[#F8F0E7] font-semibold tabular-nums text-[#351522] text-xs focus:outline-none focus:border-[#351522]"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              onAdjustStock(
                                row.productId,
                                row.sku,
                                row.stockCount + 1,
                              )
                            }
                            aria-label={`Increase stock for ${row.sku}`}
                            className="w-7 h-7 rounded border border-[#D6AD72]/60 bg-[#F8F0E7] flex items-center justify-center text-[#351522] cursor-pointer"
                          >
                            <Plus className="w-3 h-3" strokeWidth={1.7} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded border text-[11px] font-medium ${
                            isOut
                              ? 'text-[#7A1D38] border-[#7A1D38]/35 bg-[#FDF3F5]'
                              : isLow
                                ? 'text-[#8C6526] border-[#D6AD72] bg-[#F8F0E7]'
                                : 'text-[#1F4E37] border-[#1F4E37]/35 bg-[#F2F7F4]'
                          }`}
                        >
                          {isOut
                            ? 'Out of Stock'
                            : isLow
                              ? 'Low Stock'
                              : 'In Stock'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            onAdjustStock(
                              row.productId,
                              row.sku,
                              row.stockCount + 10,
                            )
                          }
                          className="px-2.5 py-1 rounded bg-[#F8F0E7] border border-[#D6AD72]/60 text-[11px] font-medium text-[#351522] hover:bg-[#351522] hover:text-[#FFF5E9] transition-colors cursor-pointer"
                        >
                          +10 Batch
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { AlertTriangle, Info, Package } from 'lucide-react';
import { LOW_STOCK_THRESHOLD } from '../../data/adminDemoData';
import { ALL_PERFUMES, formatPrice } from '../../data/fragrances';

type StockFilter = 'all' | 'low_only' | 'out_of_stock';

export function AdminInventoryView() {
  const [filter, setFilter] = useState<StockFilter>('all');

  const allVariantRows = useMemo(() => {
    return ALL_PERFUMES.flatMap((product) =>
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
  }, []);

  const filteredRows = useMemo(() => {
    if (filter === 'low_only') {
      return allVariantRows.filter((r) => r.stockCount <= LOW_STOCK_THRESHOLD);
    }
    if (filter === 'out_of_stock') {
      return allVariantRows.filter((r) => r.stockCount === 0);
    }
    return allVariantRows;
  }, [allVariantRows, filter]);

  const lowCount = allVariantRows.filter(
    (r) => r.stockCount > 0 && r.stockCount <= LOW_STOCK_THRESHOLD,
  ).length;
  const outCount = allVariantRows.filter((r) => r.stockCount === 0).length;

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/50 flex items-start gap-3">
        <Info
          className="w-4 h-4 text-[#8C6526] shrink-0 mt-0.5"
          strokeWidth={1.8}
        />
        <p className="text-xs sm:text-sm text-[#26151D] leading-relaxed">
          <strong className="font-semibold text-[#351522]">
            Catalog Stock Preview:
          </strong>{' '}
          Displaying sample SKU inventory levels from the AUREMIST fragrance
          catalog. Live stock deduction and warehouse updates activate when the
          database backend is connected.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5 text-[#351522] font-medium tabular-nums">
            <Package className="w-4 h-4 text-[#8C6526]" strokeWidth={1.6} />
            {allVariantRows.length} Total Bottle Variants
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#8C6526] font-medium tabular-nums">
            <AlertTriangle className="w-4 h-4" strokeWidth={1.6} />
            {lowCount} Low Stock (≤ {LOW_STOCK_THRESHOLD}) · {outCount} Out of
            Stock
          </span>
        </div>

        <div className="inline-flex items-center p-1 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/45 self-start sm:self-auto">
          {(
            [
              { id: 'all', label: 'All Variants' },
              { id: 'low_only', label: 'Low & Out of Stock' },
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

      <section className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#D6AD72]/30 bg-[#F8F0E7] text-[11px] uppercase tracking-[0.12em] text-[#5C434E]">
                <th className="py-3.5 px-4 font-semibold">SKU</th>
                <th className="py-3.5 px-4 font-semibold">Perfume</th>
                <th className="py-3.5 px-4 font-semibold">Bottle Size</th>
                <th className="py-3.5 px-4 font-semibold">Family / Category</th>
                <th className="py-3.5 px-4 font-semibold text-right">Price</th>
                <th className="py-3.5 px-4 font-semibold text-right">
                  Sample Stock
                </th>
                <th className="py-3.5 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6AD72]/20">
              {filteredRows.map((row) => {
                const isOut = row.stockCount === 0;
                const isLow =
                  row.stockCount > 0 && row.stockCount <= LOW_STOCK_THRESHOLD;

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
                    <td className="py-3 px-4 text-[#5C434E] whitespace-nowrap">
                      {row.family} · {row.category}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums whitespace-nowrap">
                      {formatPrice(row.price)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums whitespace-nowrap">
                      {row.stockCount}
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

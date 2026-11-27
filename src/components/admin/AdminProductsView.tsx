import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Edit3,
  Info,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from 'lucide-react';
import {
  ALL_PERFUMES,
  AUDIENCE_CATEGORIES,
  FRAGRANCE_FAMILIES,
  formatPrice,
} from '../../data/fragrances';
import { AdminCategoryRecord, AdminProductRecord } from '../../types/admin';
import {
  AudienceCategory,
  ConcentrationType,
  FragranceFamily,
} from '../../types/perfume';
import { LuxuryImage } from '../LuxuryImage';

interface AdminProductsViewProps {
  products: AdminProductRecord[];
  categories?: AdminCategoryRecord[];
  externalSearchQuery?: string;
  onSaveProduct: (product: AdminProductRecord, isNew: boolean) => void;
  onDeleteProduct: (productId: string) => void;
  onToggleProductStatus: (productId: string) => void;
}

const DEFAULT_COLLECTION_CATEGORIES: string[] = [
  'Woody & Oud',
  'Floral',
  'Amber & Spice',
  'Fresh Botanicals',
];

const CONCENTRATIONS: ConcentrationType[] = [
  'Extrait de Parfum',
  'Eau de Parfum',
  'Eau de Toilette',
];

const PRESET_BOTTLE_IMAGES = ALL_PERFUMES.map((p) => ({
  label: `${p.name} Flacon`,
  src: p.image,
}));

export function AdminProductsView({
  products,
  categories,
  externalSearchQuery,
  onSaveProduct,
  onDeleteProduct,
  onToggleProductStatus,
}: AdminProductsViewProps) {
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery ?? '');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>(
    'all',
  );
  const [editingProduct, setEditingProduct] = useState<AdminProductRecord | null>(
    null,
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (externalSearchQuery !== undefined && externalSearchQuery.trim()) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  const categoryOptions = useMemo(() => {
    if (!categories || categories.length === 0) {
      return DEFAULT_COLLECTION_CATEGORIES;
    }
    const merged = new Set<string>(categories.map((c) => c.name));
    for (const product of products) {
      merged.add(product.category);
    }
    return Array.from(merged);
  }, [categories, products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      if (
        categoryFilter !== 'all' &&
        product.category !== categoryFilter &&
        product.audienceCategory !== categoryFilter
      ) {
        return false;
      }
      if (statusFilter !== 'all' && product.status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      const matchesName = product.name.toLowerCase().includes(q);
      const matchesFamily = product.fragranceFamily.toLowerCase().includes(q);
      const matchesNotes =
        product.topNotes.toLowerCase().includes(q) ||
        product.heartNotes.toLowerCase().includes(q) ||
        product.baseNotes.toLowerCase().includes(q);
      const matchesSku = product.variants.some((v) =>
        v.sku.toLowerCase().includes(q),
      );
      return matchesName || matchesFamily || matchesNotes || matchesSku;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const openCreateModal = () => {
    const defaultImage = ALL_PERFUMES[0]?.image ?? '';
    const suffix = String(products.length + 1).padStart(2, '0');
    setIsCreatingNew(true);
    setFormError(null);
    setEditingProduct({
      id: `custom-fragrance-${Date.now()}`,
      name: '',
      subtitle: '',
      category: 'Woody & Oud',
      audienceCategory: 'Unisex',
      fragranceFamily: 'Oud',
      concentration: 'Eau de Parfum',
      image: defaultImage,
      inStock: true,
      status: 'active',
      topNotes: '',
      heartNotes: '',
      baseNotes: '',
      variants: [
        { size: '30ml', price: 3200, sku: `AUR-NEW-${suffix}-030`, stockCount: 10 },
        { size: '50ml', price: 4200, sku: `AUR-NEW-${suffix}-050`, stockCount: 8 },
        { size: '100ml', price: 5400, sku: `AUR-NEW-${suffix}-100`, stockCount: 12 },
      ],
    });
  };

  const openEditModal = (product: AdminProductRecord) => {
    setIsCreatingNew(false);
    setFormError(null);
    setEditingProduct({
      ...product,
      variants: product.variants.map((v) => ({ ...v })),
    });
  };

  const handleSubmitModal = (e: FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.name.trim() || !editingProduct.subtitle.trim()) {
      setFormError('Product name and subtitle notes are required.');
      return;
    }

    if (
      !editingProduct.topNotes.trim() ||
      !editingProduct.heartNotes.trim() ||
      !editingProduct.baseNotes.trim()
    ) {
      setFormError('Top, Heart, and Base fragrance notes are required.');
      return;
    }

    const hasInvalidPrice = editingProduct.variants.some(
      (v) => !Number.isFinite(v.price) || v.price <= 0 || !v.sku.trim(),
    );
    if (hasInvalidPrice) {
      setFormError('Every bottle variant requires a valid SKU and PKR price.');
      return;
    }

    const totalStock = editingProduct.variants.reduce(
      (sum, v) => sum + Math.max(0, v.stockCount),
      0,
    );

    onSaveProduct(
      {
        ...editingProduct,
        name: editingProduct.name.trim(),
        subtitle: editingProduct.subtitle.trim(),
        topNotes: editingProduct.topNotes.trim(),
        heartNotes: editingProduct.heartNotes.trim(),
        baseNotes: editingProduct.baseNotes.trim(),
        inStock: totalStock > 0,
      },
      isCreatingNew,
    );
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/55 flex items-start gap-3">
        <Info
          className="w-4 h-4 text-[#8C6526] shrink-0 mt-0.5"
          strokeWidth={1.8}
        />
        <p className="text-xs sm:text-sm text-[#26151D] leading-relaxed">
          <strong className="font-semibold text-[#351522]">
            Catalog Products (Demo Workspace):
          </strong>{' '}
          Add, edit, toggle Active/Draft status, manage fragrance pyramid notes,
          and delete products in this admin workspace without modifying the live
          customer storefront until backend catalog APIs are connected.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search
              className="w-4 h-4 text-[#5C434E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              strokeWidth={1.6}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, family, notes, or SKU..."
              aria-label="Search products"
              className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/60 text-xs sm:text-sm text-[#26151D] focus:outline-none focus:border-[#351522]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
            className="px-3.5 py-2.5 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/60 text-xs sm:text-sm text-[#26151D] focus:outline-none focus:border-[#351522]"
          >
            <option value="all">All Categories</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'all' | 'active' | 'draft')
            }
            aria-label="Filter by product status"
            className="px-3.5 py-2.5 rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/60 text-xs sm:text-sm text-[#26151D] focus:outline-none focus:border-[#351522]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="draft">Draft Only</option>
          </select>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-xs sm:text-sm font-medium hover:bg-[#240D16] transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[42px]"
        >
          <Plus className="w-4 h-4 text-[#D6AD72]" strokeWidth={1.8} />
          <span>Add Fragrance</span>
        </button>
      </div>

      {/* Products Table */}
      <section className="rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="py-14 px-6 text-center space-y-3">
            <p className="font-serif text-2xl font-medium text-[#351522]">
              No matching fragrances found
            </p>
            <p className="text-xs sm:text-sm text-[#5C434E] max-w-md mx-auto">
              Adjust your search keyword, SKU, status, or category filter to view
              catalog products.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-xs font-medium cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#D6AD72]/30 bg-[#F8F0E7] text-[11px] uppercase tracking-[0.12em] text-[#5C434E]">
                  <th className="py-3.5 px-4 font-semibold">Perfume</th>
                  <th className="py-3.5 px-4 font-semibold">Category &amp; Family</th>
                  <th className="py-3.5 px-4 font-semibold">Scent Pyramid</th>
                  <th className="py-3.5 px-4 font-semibold">
                    Bottle Variants &amp; Prices
                  </th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">
                    Total Stock
                  </th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6AD72]/20">
                {filteredProducts.map((product) => {
                  const totalUnits = product.variants.reduce(
                    (sum, v) => sum + v.stockCount,
                    0,
                  );
                  const isDeleting = confirmDeleteId === product.id;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-[#F8F0E7]/65 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div className="w-11 h-14 rounded-md overflow-hidden bg-[#F8F0E7] border border-[#D6AD72]/35 shrink-0">
                            <LuxuryImage
                              src={product.image}
                              alt={product.name}
                              fallbackTitle={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-serif text-lg font-medium text-[#351522] leading-snug truncate">
                              {product.name}
                            </p>
                            <p className="text-[11px] text-[#5C434E] truncate">
                              {product.concentration} · {product.subtitle}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="block text-[#26151D] font-medium">
                          {product.category}
                        </span>
                        <span className="block text-[11px] text-[#5C434E]">
                          {product.fragranceFamily} · {product.audienceCategory}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 min-w-[200px] max-w-[240px]">
                        <p className="text-[11px] text-[#26151D] truncate">
                          <strong>Top:</strong> {product.topNotes}
                        </p>
                        <p className="text-[11px] text-[#5C434E] truncate">
                          <strong>Heart:</strong> {product.heartNotes}
                        </p>
                        <p className="text-[11px] text-[#5C434E] truncate">
                          <strong>Base:</strong> {product.baseNotes}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs tabular-nums">
                          {product.variants.map((v) => (
                            <span key={v.sku} className="text-[#26151D]">
                              <strong>{v.size}:</strong> {formatPrice(v.price)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onToggleProductStatus(product.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] font-medium cursor-pointer ${
                            product.status === 'active'
                              ? 'bg-[#F2F7F4] border-[#1F4E37]/35 text-[#1F4E37]'
                              : 'bg-[#F8F0E7] border-[#D6AD72]/60 text-[#5C434E]'
                          }`}
                        >
                          {product.status === 'active' ? (
                            <>
                              <ToggleRight className="w-3.5 h-3.5" strokeWidth={1.7} />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-3.5 h-3.5" strokeWidth={1.7} />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded border text-[11px] font-medium ${
                            totalUnits === 0
                              ? 'text-[#7A1D38] border-[#7A1D38]/35 bg-[#FDF3F5]'
                              : 'text-[#351522] border-[#D6AD72]/60 bg-[#F8F0E7]'
                          }`}
                        >
                          {totalUnits} units
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isDeleting ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteProduct(product.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2.5 py-1 rounded bg-[#7A1D38] text-[#FFF5E9] text-[11px] font-medium cursor-pointer"
                            >
                              Confirm Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded border border-[#D6AD72]/60 text-[11px] text-[#351522] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(product)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#F8F0E7] border border-[#D6AD72]/55 text-xs font-medium text-[#351522] hover:bg-[#351522] hover:text-[#FFF5E9] transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" strokeWidth={1.6} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(product.id)}
                              aria-label={`Delete ${product.name}`}
                              className="p-1.5 rounded-md border border-[#D6AD72]/55 bg-[#F8F0E7] text-[#5C434E] hover:text-[#7A1D38] hover:border-[#7A1D38]/40 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.6} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Edit / Create Product Modal */}
      {editingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={isCreatingNew ? 'Add Fragrance' : 'Edit Fragrance'}
        >
          <div
            onClick={() => setEditingProduct(null)}
            className="fixed inset-0 bg-[#26151D]/55"
          />
          <form
            onSubmit={handleSubmitModal}
            className="relative z-10 w-full max-w-2xl rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/60 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#D6AD72]/30">
              <h2 className="font-serif text-2xl font-medium text-[#351522]">
                {isCreatingNew
                  ? 'Add New Fragrance (Demo)'
                  : `Edit ${editingProduct.name}`}
              </h2>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                aria-label="Close product dialog"
                className="p-1.5 text-[#5C434E] hover:text-[#351522] cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={1.6} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-[#FDF3F5] border border-[#7A1D38]/35 text-xs text-[#7A1D38] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.7} />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="admin-prod-name"
                  className="block text-xs font-medium text-[#351522] mb-1"
                >
                  Perfume Name
                </label>
                <input
                  id="admin-prod-name"
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  placeholder="e.g. Velvet Oud"
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-sm focus:outline-none focus:border-[#351522]"
                />
              </div>
              <div>
                <label
                  htmlFor="admin-prod-subtitle"
                  className="block text-xs font-medium text-[#351522] mb-1"
                >
                  Key Notes Subtitle
                </label>
                <input
                  id="admin-prod-subtitle"
                  type="text"
                  value={editingProduct.subtitle}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      subtitle: e.target.value,
                    })
                  }
                  placeholder="e.g. Smoked Oud & Damask Rose"
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-sm focus:outline-none focus:border-[#351522]"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-prod-category"
                  className="block text-xs font-medium text-[#351522] mb-1"
                >
                  Collection Category
                </label>
                <select
                  id="admin-prod-category"
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-sm focus:outline-none focus:border-[#351522]"
                >
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="admin-prod-family"
                  className="block text-xs font-medium text-[#351522] mb-1"
                >
                  Fragrance Family
                </label>
                <select
                  id="admin-prod-family"
                  value={editingProduct.fragranceFamily}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      fragranceFamily: e.target.value as FragranceFamily,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-sm focus:outline-none focus:border-[#351522]"
                >
                  {FRAGRANCE_FAMILIES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="admin-prod-audience"
                  className="block text-xs font-medium text-[#351522] mb-1"
                >
                  Audience Category
                </label>
                <select
                  id="admin-prod-audience"
                  value={editingProduct.audienceCategory}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      audienceCategory: e.target.value as AudienceCategory,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-sm focus:outline-none focus:border-[#351522]"
                >
                  {AUDIENCE_CATEGORIES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label
                    htmlFor="admin-prod-concentration"
                    className="block text-xs font-medium text-[#351522] mb-1"
                  >
                    Concentration
                  </label>
                  <select
                    id="admin-prod-concentration"
                    value={editingProduct.concentration}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        concentration: e.target.value as ConcentrationType,
                      })
                    }
                    className="w-full px-2.5 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs sm:text-sm focus:outline-none focus:border-[#351522]"
                  >
                    {CONCENTRATIONS.map((conc) => (
                      <option key={conc} value={conc}>
                        {conc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="admin-prod-status"
                    className="block text-xs font-medium text-[#351522] mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="admin-prod-status"
                    value={editingProduct.status}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        status: e.target.value as 'active' | 'draft',
                      })
                    }
                    className="w-full px-2.5 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs sm:text-sm focus:outline-none focus:border-[#351522]"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scent Pyramid Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#D6AD72]/25">
              <div>
                <label
                  htmlFor="admin-prod-top"
                  className="block text-xs font-medium text-[#351522] mb-1"
                >
                  Top Notes
                </label>
                <input
                  id="admin-prod-top"
                  type="text"
                  value={editingProduct.topNotes}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      topNotes: e.target.value,
                    })
                  }
                  placeholder="e.g. Pink Peppercorn, Bergamot"
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs focus:outline-none focus:border-[#351522]"
                />
              </div>
              <div>
                <label
                  htmlFor="admin-prod-heart"
                  className="block text-xs font-medium text-[#351522] mb-1"
                >
                  Heart Notes
                </label>
                <input
                  id="admin-prod-heart"
                  type="text"
                  value={editingProduct.heartNotes}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      heartNotes: e.target.value,
                    })
                  }
                  placeholder="e.g. Damask Rose, Incense"
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs focus:outline-none focus:border-[#351522]"
                />
              </div>
              <div>
                <label
                  htmlFor="admin-prod-base"
                  className="block text-xs font-medium text-[#351522] mb-1"
                >
                  Base Notes
                </label>
                <input
                  id="admin-prod-base"
                  type="text"
                  value={editingProduct.baseNotes}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      baseNotes: e.target.value,
                    })
                  }
                  placeholder="e.g. Aged Agarwood, Warm Amber"
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs focus:outline-none focus:border-[#351522]"
                />
              </div>
            </div>

            {/* Product Image */}
            <div className="pt-2 border-t border-[#D6AD72]/25 flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="w-14 h-16 rounded-md overflow-hidden bg-[#F8F0E7] border border-[#D6AD72]/45 shrink-0">
                <LuxuryImage
                  src={editingProduct.image}
                  alt={editingProduct.name || 'Perfume preview'}
                  fallbackTitle={editingProduct.name || 'AUREMIST'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 w-full">
                <label
                  htmlFor="admin-prod-image"
                  className="block text-xs font-medium text-[#351522] mb-1"
                >
                  Product Bottle Image
                </label>
                <select
                  id="admin-prod-image"
                  value={editingProduct.image}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      image: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-xs focus:outline-none focus:border-[#351522]"
                >
                  {PRESET_BOTTLE_IMAGES.map((img) => (
                    <option key={img.src} value={img.src}>
                      {img.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Variants */}
            <div className="space-y-2.5 pt-2 border-t border-[#D6AD72]/25">
              <p className="text-xs font-semibold text-[#351522]">
                Bottle Sizes, SKUs &amp; PKR Pricing
              </p>
              <div className="grid grid-cols-12 gap-2 text-[10px] uppercase tracking-[0.12em] text-[#5C434E] font-semibold">
                <span className="col-span-2">Size</span>
                <span className="col-span-4">SKU</span>
                <span className="col-span-3">Price (PKR)</span>
                <span className="col-span-3">Stock</span>
              </div>
              {editingProduct.variants.map((variant, idx) => (
                <div
                  key={variant.size}
                  className="grid grid-cols-12 gap-2 items-center text-xs"
                >
                  <span className="col-span-2 font-semibold text-[#351522]">
                    {variant.size}
                  </span>
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) => {
                      const next = [...editingProduct.variants];
                      next[idx] = { ...next[idx], sku: e.target.value };
                      setEditingProduct({ ...editingProduct, variants: next });
                    }}
                    aria-label={`${variant.size} SKU`}
                    className="col-span-4 px-2.5 py-1.5 rounded bg-[#F8F0E7] border border-[#D6AD72]/60 font-mono"
                  />
                  <input
                    type="number"
                    min={100}
                    step={50}
                    value={variant.price}
                    onChange={(e) => {
                      const next = [...editingProduct.variants];
                      next[idx] = {
                        ...next[idx],
                        price: Number(e.target.value) || 0,
                      };
                      setEditingProduct({ ...editingProduct, variants: next });
                    }}
                    aria-label={`${variant.size} PKR Price`}
                    className="col-span-3 px-2.5 py-1.5 rounded bg-[#F8F0E7] border border-[#D6AD72]/60 tabular-nums"
                  />
                  <input
                    type="number"
                    min={0}
                    value={variant.stockCount}
                    onChange={(e) => {
                      const next = [...editingProduct.variants];
                      next[idx] = {
                        ...next[idx],
                        stockCount: Math.max(0, Number(e.target.value) || 0),
                      };
                      setEditingProduct({ ...editingProduct, variants: next });
                    }}
                    aria-label={`${variant.size} Stock`}
                    className="col-span-3 px-2.5 py-1.5 rounded bg-[#F8F0E7] border border-[#D6AD72]/60 tabular-nums"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#D6AD72]/30">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 rounded-lg border border-[#D6AD72]/60 text-xs font-medium text-[#351522] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-xs font-medium cursor-pointer"
              >
                {isCreatingNew ? 'Save Fragrance' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

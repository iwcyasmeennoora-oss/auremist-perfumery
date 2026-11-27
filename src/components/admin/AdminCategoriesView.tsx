import { FormEvent, useState } from 'react';
import {
  Edit3,
  FolderTree,
  Info,
  Plus,
  Save,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react';
import { AdminCategoryRecord, AdminProductRecord } from '../../types/admin';

interface AdminCategoriesViewProps {
  categories: AdminCategoryRecord[];
  products: AdminProductRecord[];
  onAddCategory: (category: AdminCategoryRecord) => void;
  onUpdateCategory: (category: AdminCategoryRecord) => void;
  onDeleteCategory: (categoryId: string) => void;
  onToggleCategory: (categoryId: string) => void;
}

export function AdminCategoriesView({
  categories,
  products,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onToggleCategory,
}: AdminCategoriesViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setFormError(null);
  };

  const startEdit = (cat: AdminCategoryRecord) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description);
    setFormError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError('Please enter a category name.');
      return;
    }

    const duplicate = categories.some(
      (c) =>
        c.id !== editingId && c.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (duplicate) {
      setFormError('A category with this name already exists.');
      return;
    }

    const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingId) {
      const existing = categories.find((c) => c.id === editingId);
      if (existing) {
        onUpdateCategory({
          ...existing,
          name: trimmed,
          slug,
          description:
            description.trim() ||
            'Curated AUREMIST boutique fragrance collection.',
        });
      }
      resetForm();
      return;
    }

    onAddCategory({
      id: `cat-${Date.now()}`,
      name: trimmed,
      slug,
      description:
        description.trim() || 'Curated AUREMIST boutique fragrance collection.',
      isActive: true,
      displayOrder: categories.length + 1,
    });
    resetForm();
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
            Fragrance Categories (Demo Mode):
          </strong>{' '}
          Includes Men, Women, and Unisex audience groups alongside scent
          collections. Create, edit, toggle visibility, or delete categories in
          this frontend admin workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Category List */}
        <section className="lg:col-span-8 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 overflow-hidden">
          <div className="px-5 py-4 bg-[#F8F0E7] border-b border-[#D6AD72]/30 flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-[#8C6526]" strokeWidth={1.7} />
            <h2 className="font-serif text-2xl font-medium text-[#351522]">
              Categories ({categories.length})
            </h2>
          </div>

          {categories.length === 0 ? (
            <div className="py-12 px-6 text-center space-y-2">
              <p className="font-serif text-xl font-medium text-[#351522]">
                No categories configured
              </p>
              <p className="text-xs text-[#5C434E]">
                Use the form on the right to add a category.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#D6AD72]/25">
              {categories.map((cat) => {
                const productCount = products.filter(
                  (p) =>
                    p.category === cat.name || p.audienceCategory === cat.name,
                ).length;
                const isDeleting = confirmDeleteId === cat.id;

                return (
                  <div
                    key={cat.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="font-serif text-xl font-medium text-[#351522]">
                          {cat.name}
                        </h3>
                        <span className="text-xs text-[#5C434E] tabular-nums">
                          · {productCount}{' '}
                          {productCount === 1 ? 'fragrance' : 'fragrances'}
                        </span>
                      </div>
                      <p className="text-xs text-[#5C434E] leading-relaxed">
                        {cat.description}
                      </p>
                      <p className="text-[11px] font-mono text-[#8C6526]">
                        /{cat.slug}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-center">
                      <button
                        type="button"
                        onClick={() => onToggleCategory(cat.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                          cat.isActive
                            ? 'bg-[#F2F7F4] border-[#1F4E37]/35 text-[#1F4E37]'
                            : 'bg-[#F8F0E7] border-[#D6AD72]/60 text-[#5C434E]'
                        }`}
                      >
                        {cat.isActive ? (
                          <>
                            <ToggleRight className="w-4 h-4" strokeWidth={1.7} />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4" strokeWidth={1.7} />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        aria-label={`Edit category ${cat.name}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D6AD72]/60 bg-[#F8F0E7] text-xs font-medium text-[#351522] hover:border-[#351522] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" strokeWidth={1.6} />
                        <span>Edit</span>
                      </button>

                      {isDeleting ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteCategory(cat.id);
                              if (editingId === cat.id) resetForm();
                              setConfirmDeleteId(null);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#7A1D38] text-[#FFF5E9] text-[11px] font-medium cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1.5 rounded-lg border border-[#D6AD72]/60 text-[11px] text-[#351522] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(cat.id)}
                          aria-label={`Delete category ${cat.name}`}
                          className="p-1.5 rounded-lg border border-[#D6AD72]/55 bg-[#F8F0E7] text-[#5C434E] hover:text-[#7A1D38] hover:border-[#7A1D38]/40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.6} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Add / Edit Category Form */}
        <section className="lg:col-span-4 rounded-xl bg-[#FFF5E9] border border-[#D6AD72]/45 p-5 sm:p-6 space-y-4">
          <div className="pb-3 border-b border-[#D6AD72]/25">
            <h2 className="font-serif text-2xl font-medium text-[#351522]">
              {editingId ? 'Edit Category' : 'Add Category'}
            </h2>
            <p className="text-xs text-[#5C434E] mt-0.5">
              {editingId
                ? 'Update category details in the demo workspace.'
                : 'Create a new collection grouping for demo organization.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-cat-name"
                className="block text-xs font-medium text-[#351522] mb-1.5"
              >
                Category Name
              </label>
              <input
                id="admin-cat-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFormError(null);
                }}
                placeholder="e.g. Leather & Musk"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-sm text-[#26151D] focus:outline-none focus:border-[#351522]"
              />
            </div>

            <div>
              <label
                htmlFor="admin-cat-desc"
                className="block text-xs font-medium text-[#351522] mb-1.5"
              >
                Description
              </label>
              <textarea
                id="admin-cat-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short editorial description of scent notes..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/60 text-sm text-[#26151D] focus:outline-none focus:border-[#351522]"
              />
            </div>

            {formError && (
              <p className="text-xs text-[#7A1D38]">{formError}</p>
            )}

            <div className="flex items-center gap-2.5">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-3 rounded-lg border border-[#D6AD72]/60 text-xs font-medium text-[#351522] cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#351522] text-[#FFF5E9] border border-[#D6AD72] text-xs sm:text-sm font-medium hover:bg-[#240D16] transition-colors cursor-pointer"
              >
                {editingId ? (
                  <>
                    <Save className="w-4 h-4 text-[#D6AD72]" strokeWidth={1.8} />
                    <span>Save Category</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-[#D6AD72]" strokeWidth={1.8} />
                    <span>Create Category</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

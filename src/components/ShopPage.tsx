import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowUpDown,
  Check,
  ChevronRight,
  Heart,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  AUDIENCE_CATEGORIES,
  AVAILABILITY_OPTIONS,
  BOTTLE_SIZES,
  formatPrice,
  FRAGRANCE_FAMILIES,
} from '../data/fragrances';
import {
  fadeUpVariants,
  LUXURY_EASE,
  staggerContainerVariants,
  staggerItemVariants,
} from '../lib/motion';
import {
  AudienceCategory,
  AvailabilityFilter,
  BottleSize,
  FragranceFamily,
  PerfumeProduct,
  SortOption,
} from '../types/perfume';
import { LuxuryImage } from './LuxuryImage';

interface ShopPageProps {
  products: PerfumeProduct[];
  wishlistIds: string[];
  onNavigateHome: () => void;
  onViewDetails: (product: PerfumeProduct) => void;
  onAddToCart: (product: PerfumeProduct, size?: BottleSize) => void;
  onToggleWishlist: (product: PerfumeProduct) => void;
}

export function ShopPage({
  products,
  wishlistIds,
  onNavigateHome,
  onViewDetails,
  onAddToCart,
  onToggleWishlist,
}: ShopPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<AudienceCategory[]>([]);
  const [selectedFamilies, setSelectedFamilies] = useState<FragranceFamily[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<BottleSize[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<
    AvailabilityFilter[]
  >([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [priceNotice, setPriceNotice] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [tabletFiltersOpen, setTabletFiltersOpen] = useState(true);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // Mobile drawer staged filter state for Apply Filters / Clear All workflow
  const [draftCategories, setDraftCategories] = useState<AudienceCategory[]>([]);
  const [draftFamilies, setDraftFamilies] = useState<FragranceFamily[]>([]);
  const [draftSizes, setDraftSizes] = useState<BottleSize[]>([]);
  const [draftAvailability, setDraftAvailability] = useState<
    AvailabilityFilter[]
  >([]);
  const [draftMinPrice, setDraftMinPrice] = useState('');
  const [draftMaxPrice, setDraftMaxPrice] = useState('');
  const [draftPriceNotice, setDraftPriceNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileFiltersOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileFiltersOpen]);

  const toggleItem = <T,>(list: T[], value: T, setter: (next: T[]) => void) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
    } else {
      setter([...list, value]);
    }
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedFamilies.length +
    selectedSizes.length +
    selectedAvailability.length +
    (minPrice.trim() ? 1 : 0) +
    (maxPrice.trim() ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const sidebarFilterCount =
    selectedCategories.length +
    selectedFamilies.length +
    selectedSizes.length +
    selectedAvailability.length +
    (minPrice.trim() ? 1 : 0) +
    (maxPrice.trim() ? 1 : 0);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedFamilies([]);
    setSelectedSizes([]);
    setSelectedAvailability([]);
    setMinPrice('');
    setMaxPrice('');
    setPriceNotice(null);
  };

  const handleOpenMobileDrawer = () => {
    setDraftCategories(selectedCategories);
    setDraftFamilies(selectedFamilies);
    setDraftSizes(selectedSizes);
    setDraftAvailability(selectedAvailability);
    setDraftMinPrice(minPrice);
    setDraftMaxPrice(maxPrice);
    setDraftPriceNotice(null);
    setMobileFiltersOpen(true);
  };

  const handleApplyMobileFilters = () => {
    let finalMin = draftMinPrice;
    const finalMax = draftMaxPrice;
    if (
      finalMin.trim() !== '' &&
      finalMax.trim() !== '' &&
      Number(finalMin) > Number(finalMax)
    ) {
      finalMin = finalMax;
    }
    setSelectedCategories(draftCategories);
    setSelectedFamilies(draftFamilies);
    setSelectedSizes(draftSizes);
    setSelectedAvailability(draftAvailability);
    setMinPrice(finalMin);
    setMaxPrice(finalMax);
    setPriceNotice(null);
    setMobileFiltersOpen(false);
  };

  const handleClearMobileDraft = () => {
    setDraftCategories([]);
    setDraftFamilies([]);
    setDraftSizes([]);
    setDraftAvailability([]);
    setDraftMinPrice('');
    setDraftMaxPrice('');
    setDraftPriceNotice(null);
    handleClearFilters();
  };

  const handleMinPriceUpdate = (
    raw: string,
    currentMax: string,
    setMin: (v: string) => void,
    setNotice: (msg: string | null) => void,
  ) => {
    if (raw === '') {
      setMin('');
      setNotice(null);
      return;
    }
    const numeric = Math.max(0, Number(raw));
    if (Number.isNaN(numeric)) return;

    if (currentMax.trim() !== '' && numeric > Number(currentMax)) {
      const capped = String(Math.max(0, Number(currentMax)));
      setMin(capped);
      setNotice(`Minimum price cannot exceed Rs. ${Number(currentMax).toLocaleString('en-US')}.`);
      return;
    }
    setMin(String(numeric));
    setNotice(null);
  };

  const handleMaxPriceUpdate = (
    raw: string,
    currentMin: string,
    setMax: (v: string) => void,
    setNotice: (msg: string | null) => void,
  ) => {
    if (raw === '') {
      setMax('');
      setNotice(null);
      return;
    }
    const numeric = Math.max(0, Number(raw));
    if (Number.isNaN(numeric)) return;
    setMax(String(numeric));
    if (currentMin.trim() !== '' && numeric < Number(currentMin)) {
      setNotice(`Maximum price should be at least Rs. ${Number(currentMin).toLocaleString('en-US')}.`);
    } else {
      setNotice(null);
    }
  };

  const handleMaxPriceBlur = (
    currentMin: string,
    currentMax: string,
    setMin: (v: string) => void,
    setNotice: (msg: string | null) => void,
  ) => {
    if (
      currentMin.trim() !== '' &&
      currentMax.trim() !== '' &&
      Number(currentMax) < Number(currentMin)
    ) {
      setMin(currentMax);
      setNotice(null);
    }
  };

  const totalAvailableCount = useMemo(
    () => products.filter((p) => p.inStock).length,
    [products],
  );

  const draftPreviewCount = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const minVal = draftMinPrice.trim() !== '' ? Number(draftMinPrice) : null;
    const maxVal = draftMaxPrice.trim() !== '' ? Number(draftMaxPrice) : null;
    const effectiveMin =
      minVal !== null && maxVal !== null ? Math.min(minVal, maxVal) : minVal;

    return products.filter((product) => {
      if (q) {
        const matchesSearch =
          product.name.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q) ||
          product.concentration.toLowerCase().includes(q) ||
          product.fragranceFamily.toLowerCase().includes(q) ||
          product.audienceCategory.toLowerCase().includes(q) ||
          product.subtitle.toLowerCase().includes(q) ||
          product.notes.some((n) => n.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }
      if (
        draftCategories.length > 0 &&
        !draftCategories.includes(product.audienceCategory)
      ) {
        return false;
      }
      if (
        draftFamilies.length > 0 &&
        !draftFamilies.includes(product.fragranceFamily)
      ) {
        return false;
      }
      if (
        draftSizes.length > 0 &&
        !product.variants.some((v) => draftSizes.includes(v.size))
      ) {
        return false;
      }
      if (draftAvailability.length > 0) {
        const status: AvailabilityFilter = product.inStock
          ? 'In Stock'
          : 'Out of Stock';
        if (!draftAvailability.includes(status)) return false;
      }
      if (
        effectiveMin !== null &&
        !Number.isNaN(effectiveMin) &&
        product.price < effectiveMin
      ) {
        return false;
      }
      if (maxVal !== null && !Number.isNaN(maxVal) && product.price > maxVal) {
        return false;
      }
      return true;
    }).length;
  }, [
    products,
    searchQuery,
    draftCategories,
    draftFamilies,
    draftSizes,
    draftAvailability,
    draftMinPrice,
    draftMaxPrice,
  ]);

  const filteredAndSortedProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const minVal = minPrice.trim() !== '' ? Number(minPrice) : null;
    const maxVal = maxPrice.trim() !== '' ? Number(maxPrice) : null;
    const effectiveMin =
      minVal !== null && maxVal !== null ? Math.min(minVal, maxVal) : minVal;

    const filtered = products.filter((product) => {
      if (q) {
        const matchesSearch =
          product.name.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q) ||
          product.concentration.toLowerCase().includes(q) ||
          product.fragranceFamily.toLowerCase().includes(q) ||
          product.audienceCategory.toLowerCase().includes(q) ||
          product.subtitle.toLowerCase().includes(q) ||
          product.notes.some((n) => n.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(product.audienceCategory)
      ) {
        return false;
      }

      if (
        selectedFamilies.length > 0 &&
        !selectedFamilies.includes(product.fragranceFamily)
      ) {
        return false;
      }

      if (
        selectedSizes.length > 0 &&
        !product.variants.some((variant) => selectedSizes.includes(variant.size))
      ) {
        return false;
      }

      if (selectedAvailability.length > 0) {
        const status: AvailabilityFilter = product.inStock
          ? 'In Stock'
          : 'Out of Stock';
        if (!selectedAvailability.includes(status)) return false;
      }

      if (
        effectiveMin !== null &&
        !Number.isNaN(effectiveMin) &&
        product.price < effectiveMin
      ) {
        return false;
      }

      if (maxVal !== null && !Number.isNaN(maxVal) && product.price > maxVal) {
        return false;
      }

      return true;
    });

    const sorted = [...filtered];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => a.newestRank - b.newestRank);
        break;
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'featured':
      default:
        sorted.sort((a, b) => a.featuredRank - b.featuredRank);
        break;
    }

    return sorted;
  }, [
    products,
    searchQuery,
    selectedCategories,
    selectedFamilies,
    selectedSizes,
    selectedAvailability,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const handleCardAddToCart = (product: PerfumeProduct) => {
    if (!product.inStock) return;
    onAddToCart(product, product.defaultSize);
    setRecentlyAddedId(product.id);
    window.setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === product.id ? null : curr));
    }, 1500);
  };

  interface FilterControlValues {
    categories: AudienceCategory[];
    setCategories: (v: AudienceCategory[]) => void;
    families: FragranceFamily[];
    setFamilies: (v: FragranceFamily[]) => void;
    sizes: BottleSize[];
    setSizes: (v: BottleSize[]) => void;
    availability: AvailabilityFilter[];
    setAvailability: (v: AvailabilityFilter[]) => void;
    minVal: string;
    setMinVal: (v: string) => void;
    maxVal: string;
    setMaxVal: (v: string) => void;
    notice: string | null;
    setNotice: (msg: string | null) => void;
  }

  const renderCustomCheckbox = (checked: boolean) => (
    <span
      aria-hidden="true"
      className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors duration-150 ${
        checked
          ? 'bg-[#351522] border-[#351522] text-[#D6AD72]'
          : 'bg-[#FFF5E9] border-[#D6AD72]/65 group-hover/row:border-[#351522]'
      }`}
    >
      {checked && <Check className="w-3 h-3" strokeWidth={2.5} />}
    </span>
  );

  const renderFilterSections = (
    idPrefix: string,
    values: FilterControlValues,
    layout: 'vertical' | 'compact-grid' = 'vertical',
  ) => {
    const categorySection = (
      <div
        className={
          layout === 'vertical' ? 'pb-5 border-b border-[#D6AD72]/30' : ''
        }
      >
        <h3 className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#351522] mb-3.5">
          Category
        </h3>
        <div className="space-y-2.5">
          {AUDIENCE_CATEGORIES.map((cat) => {
            const checked = values.categories.includes(cat);
            const count = products.filter(
              (p) => p.audienceCategory === cat,
            ).length;
            return (
              <label
                key={cat}
                htmlFor={`${idPrefix}-cat-${cat}`}
                className={`group/row flex items-center justify-between gap-3 py-1 px-1.5 -mx-1.5 rounded-md text-sm transition-colors cursor-pointer select-none ${
                  checked
                    ? 'text-[#351522] font-medium bg-[#D6AD72]/15'
                    : 'text-[#26151D] hover:text-[#351522]'
                }`}
              >
                <span className="inline-flex items-center gap-2.5 min-w-0">
                  <input
                    id={`${idPrefix}-cat-${cat}`}
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      toggleItem(values.categories, cat, values.setCategories)
                    }
                    className="sr-only"
                  />
                  {renderCustomCheckbox(checked)}
                  <span className="truncate">{cat}</span>
                </span>
                <span className="text-xs text-[#5C434E] tabular-nums shrink-0">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );

    const familySection = (
      <div
        className={
          layout === 'vertical' ? 'pb-5 border-b border-[#D6AD72]/30' : ''
        }
      >
        <h3 className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#351522] mb-3.5">
          Fragrance Family
        </h3>
        <div
          className={
            layout === 'compact-grid'
              ? 'grid grid-cols-2 gap-x-4 gap-y-2'
              : 'space-y-2.5'
          }
        >
          {FRAGRANCE_FAMILIES.map((family) => {
            const checked = values.families.includes(family);
            const count = products.filter(
              (p) => p.fragranceFamily === family,
            ).length;
            return (
              <label
                key={family}
                htmlFor={`${idPrefix}-fam-${family}`}
                className={`group/row flex items-center justify-between gap-2.5 py-1 px-1.5 -mx-1.5 rounded-md text-sm transition-colors cursor-pointer select-none ${
                  checked
                    ? 'text-[#351522] font-medium bg-[#D6AD72]/15'
                    : 'text-[#26151D] hover:text-[#351522]'
                }`}
              >
                <span className="inline-flex items-center gap-2.5 min-w-0">
                  <input
                    id={`${idPrefix}-fam-${family}`}
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      toggleItem(values.families, family, values.setFamilies)
                    }
                    className="sr-only"
                  />
                  {renderCustomCheckbox(checked)}
                  <span className="truncate">{family}</span>
                </span>
                <span className="text-xs text-[#5C434E] tabular-nums shrink-0">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );

    const priceSection = (
      <div
        className={
          layout === 'vertical' ? 'pb-5 border-b border-[#D6AD72]/30' : ''
        }
      >
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <h3 className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#351522]">
            Price Range
          </h3>
          <span className="text-[11px] font-medium text-[#5C434E]">
            PKR / Rs.
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor={`${idPrefix}-min-price`}
              className="block text-[11px] font-medium text-[#5C434E] mb-1.5"
            >
              Min Price
            </label>
            <div className="flex items-center rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/55 focus-within:border-[#351522] focus-within:ring-2 focus-within:ring-[#D6AD72]/30 transition-colors overflow-hidden">
              <span className="pl-2.5 pr-1 text-[11px] font-semibold text-[#5C434E] select-none shrink-0">
                Rs.
              </span>
              <input
                id={`${idPrefix}-min-price`}
                type="number"
                min={0}
                max={
                  values.maxVal.trim() !== ''
                    ? Number(values.maxVal)
                    : undefined
                }
                step={100}
                inputMode="numeric"
                placeholder="2,500"
                value={values.minVal}
                onChange={(e) =>
                  handleMinPriceUpdate(
                    e.target.value,
                    values.maxVal,
                    values.setMinVal,
                    values.setNotice,
                  )
                }
                className="w-full min-w-0 py-2 pr-2.5 bg-transparent text-xs text-[#26151D] tabular-nums placeholder:text-[#5C434E]/50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor={`${idPrefix}-max-price`}
              className="block text-[11px] font-medium text-[#5C434E] mb-1.5"
            >
              Max Price
            </label>
            <div className="flex items-center rounded-lg bg-[#FFF5E9] border border-[#D6AD72]/55 focus-within:border-[#351522] focus-within:ring-2 focus-within:ring-[#D6AD72]/30 transition-colors overflow-hidden">
              <span className="pl-2.5 pr-1 text-[11px] font-semibold text-[#5C434E] select-none shrink-0">
                Rs.
              </span>
              <input
                id={`${idPrefix}-max-price`}
                type="number"
                min={
                  values.minVal.trim() !== ''
                    ? Number(values.minVal)
                    : 0
                }
                step={100}
                inputMode="numeric"
                placeholder="7,000"
                value={values.maxVal}
                onChange={(e) =>
                  handleMaxPriceUpdate(
                    e.target.value,
                    values.minVal,
                    values.setMaxVal,
                    values.setNotice,
                  )
                }
                onBlur={() =>
                  handleMaxPriceBlur(
                    values.minVal,
                    values.maxVal,
                    values.setMinVal,
                    values.setNotice,
                  )
                }
                className="w-full min-w-0 py-2 pr-2.5 bg-transparent text-xs text-[#26151D] tabular-nums placeholder:text-[#5C434E]/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {values.notice && (
          <p className="mt-2 text-[11px] text-[#351522] font-medium leading-snug">
            {values.notice}
          </p>
        )}
      </div>
    );

    const sizeSection = (
      <div
        className={
          layout === 'vertical' ? 'pb-5 border-b border-[#D6AD72]/30' : ''
        }
      >
        <h3 className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#351522] mb-3.5">
          Size
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {BOTTLE_SIZES.map((size) => {
            const active = values.sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                aria-pressed={active}
                onClick={() => toggleItem(values.sizes, size, values.setSizes)}
                className={`py-2 px-2.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap min-h-[38px] flex items-center justify-center gap-1 ${
                  active
                    ? 'bg-[#351522] text-[#F8F0E7] border-[#D6AD72] shadow-sm'
                    : 'bg-[#FFF5E9] text-[#351522] border-[#D6AD72]/50 hover:border-[#351522]'
                }`}
              >
                {active && (
                  <Check
                    className="w-3 h-3 text-[#D6AD72] shrink-0"
                    strokeWidth={2.2}
                  />
                )}
                <span>{size}</span>
              </button>
            );
          })}
        </div>
      </div>
    );

    const availabilitySection = (
      <div>
        <h3 className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#351522] mb-3.5">
          Availability
        </h3>
        <div className="space-y-2.5">
          {AVAILABILITY_OPTIONS.map((status) => {
            const checked = values.availability.includes(status);
            const count = products.filter((p) =>
              status === 'In Stock' ? p.inStock : !p.inStock,
            ).length;
            return (
              <label
                key={status}
                htmlFor={`${idPrefix}-avail-${status}`}
                className={`group/row flex items-center justify-between gap-3 py-1 px-1.5 -mx-1.5 rounded-md text-sm transition-colors cursor-pointer select-none ${
                  checked
                    ? 'text-[#351522] font-medium bg-[#D6AD72]/15'
                    : 'text-[#26151D] hover:text-[#351522]'
                }`}
              >
                <span className="inline-flex items-center gap-2.5 min-w-0">
                  <input
                    id={`${idPrefix}-avail-${status}`}
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      toggleItem(
                        values.availability,
                        status,
                        values.setAvailability,
                      )
                    }
                    className="sr-only"
                  />
                  {renderCustomCheckbox(checked)}
                  <span className="truncate">{status}</span>
                </span>
                <span className="text-xs text-[#5C434E] tabular-nums shrink-0">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );

    if (layout === 'compact-grid') {
      return (
        <div className="grid grid-cols-2 gap-6 pt-5">
          <div className="space-y-5 pr-5 border-r border-[#D6AD72]/25">
            {categorySection}
            {availabilitySection}
          </div>
          <div className="space-y-5">
            {familySection}
            {priceSection}
            {sizeSection}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {categorySection}
        {familySection}
        {priceSection}
        {sizeSection}
        {availabilitySection}
      </div>
    );
  };

  const liveFilterValues: FilterControlValues = {
    categories: selectedCategories,
    setCategories: setSelectedCategories,
    families: selectedFamilies,
    setFamilies: setSelectedFamilies,
    sizes: selectedSizes,
    setSizes: setSelectedSizes,
    availability: selectedAvailability,
    setAvailability: setSelectedAvailability,
    minVal: minPrice,
    setMinVal: setMinPrice,
    maxVal: maxPrice,
    setMaxVal: setMaxPrice,
    notice: priceNotice,
    setNotice: setPriceNotice,
  };

  const mobileDraftValues: FilterControlValues = {
    categories: draftCategories,
    setCategories: setDraftCategories,
    families: draftFamilies,
    setFamilies: setDraftFamilies,
    sizes: draftSizes,
    setSizes: setDraftSizes,
    availability: draftAvailability,
    setAvailability: setDraftAvailability,
    minVal: draftMinPrice,
    setMinVal: setDraftMinPrice,
    maxVal: draftMaxPrice,
    setMaxVal: setDraftMaxPrice,
    notice: draftPriceNotice,
    setNotice: setDraftPriceNotice,
  };

  return (
    <div className="bg-[#FFF5E9] text-[#26151D]">
      {/* Shop Page Header */}
      <section className="bg-[#F8EBDD]/65 border-b border-[#C69A50]/25 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="max-w-2xl"
          >
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs tracking-[0.14em] uppercase text-[#5C434E] mb-4"
            >
              <button
                type="button"
                onClick={onNavigateHome}
                className="hover:text-[#430F25] transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
              >
                Home
              </button>
              <ChevronRight
                className="w-3.5 h-3.5 text-[#C69A50]"
                strokeWidth={1.6}
                aria-hidden="true"
              />
              <span className="text-[#430F25] font-semibold">Shop</span>
            </nav>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[54px] font-medium text-[#430F25] leading-[1.08] tracking-tight mb-4">
              Discover Your Signature Scent
            </h1>

            <p className="text-sm sm:text-[15px] text-[#26151D]/80 leading-relaxed mb-5">
              Explore our curated collection of distinctive fragrances,
              thoughtfully selected for every personality and occasion.
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5C434E] tracking-wide">
              <span className="font-medium text-[#430F25] tabular-nums">
                {products.length} Signature Fragrances
              </span>
              <span className="text-[#C69A50]" aria-hidden="true">
                ·
              </span>
              <span className="tabular-nums">
                {totalAvailableCount} Available to Order
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Shop Workspace: Sidebar + Search/Sort Toolbar + Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
        {/* Top Dynamic Search & Sorting Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-8 border-b border-[#C69A50]/25">
          {/* Dynamic Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search
              className="w-4 h-4 text-[#C69A50] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              strokeWidth={1.6}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search perfumes by name, fragrance family, or category"
              placeholder="Search by name, fragrance family, or category..."
              className="w-full pl-10 pr-9 py-2.5 rounded-lg bg-[#F8EBDD]/70 border border-[#C69A50]/35 text-sm text-[#26151D] placeholder:text-[#5C434E]/75 focus:outline-none focus:border-[#430F25] focus:bg-[#FFF5E9] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#5C434E] hover:text-[#430F25] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.6} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3">
            {/* Mobile Filter Drawer Trigger */}
            <button
              type="button"
              onClick={handleOpenMobileDrawer}
              aria-expanded={mobileFiltersOpen}
              className="md:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/55 text-xs font-medium text-[#351522] hover:border-[#351522] transition-colors cursor-pointer min-h-[42px]"
            >
              <SlidersHorizontal
                className="w-4 h-4 text-[#D6AD72]"
                strokeWidth={1.6}
              />
              <span>Filters</span>
              {sidebarFilterCount > 0 && (
                <span className="ml-0.5 text-[11px] font-semibold text-[#351522] tabular-nums">
                  ({sidebarFilterCount})
                </span>
              )}
            </button>

            {/* Tablet Compact Filter Toggle */}
            <button
              type="button"
              onClick={() => setTabletFiltersOpen((prev) => !prev)}
              aria-expanded={tabletFiltersOpen}
              className="hidden md:inline-flex lg:hidden items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F8F0E7] border border-[#D6AD72]/55 text-xs font-medium text-[#351522] hover:border-[#351522] transition-colors cursor-pointer min-h-[42px]"
            >
              <SlidersHorizontal
                className="w-4 h-4 text-[#D6AD72]"
                strokeWidth={1.6}
              />
              <span>{tabletFiltersOpen ? 'Hide Filters' : 'Show Filters'}</span>
              {sidebarFilterCount > 0 && (
                <span className="text-[11px] font-semibold text-[#351522] tabular-nums">
                  ({sidebarFilterCount})
                </span>
              )}
            </button>

            <span className="text-xs text-[#5C434E] tabular-nums hidden sm:inline">
              Showing {filteredAndSortedProducts.length} of {products.length}
            </span>

            {/* Sorting Dropdown */}
            <div className="relative inline-flex items-center">
              <ArrowUpDown
                className="w-3.5 h-3.5 text-[#C69A50] absolute left-3 pointer-events-none"
                strokeWidth={1.6}
              />
              <label htmlFor="shop-sort-select" className="sr-only">
                Sort fragrances
              </label>
              <select
                id="shop-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="pl-8 pr-8 py-2.5 rounded-lg bg-[#F8EBDD]/70 border border-[#C69A50]/40 text-xs font-medium text-[#26151D] focus:outline-none focus:border-[#430F25] cursor-pointer min-h-[42px]"
              >
                <option value="featured">Sort: Featured</option>
                <option value="newest">Sort: Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tablet Compact Collapsible Filter Panel */}
        <AnimatePresence initial={false}>
          {tabletFiltersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: LUXURY_EASE }}
              className="hidden md:block lg:hidden overflow-hidden mb-8"
            >
              <div className="p-6 rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/45">
                <div className="flex items-center justify-between pb-4 border-b border-[#D6AD72]/35">
                  <h2 className="font-serif text-2xl font-medium text-[#351522]">
                    Filters
                  </h2>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    disabled={activeFilterCount === 0}
                    className="text-xs font-medium text-[#351522] hover:text-[#D6AD72] underline underline-offset-4 disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
                {renderFilterSections('tablet', liveFilterValues, 'compact-grid')}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Clean Collapsible Filter Drawer */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <div
              className="md:hidden fixed inset-0 z-50 flex justify-end"
              role="dialog"
              aria-modal="true"
              aria-label="Filter fragrances"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: LUXURY_EASE }}
                className="fixed inset-0 bg-[#26151D]/55 backdrop-blur-[2px]"
                onClick={() => setMobileFiltersOpen(false)}
              />

              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.3, ease: LUXURY_EASE }}
                className="relative z-10 w-full max-w-sm h-full bg-[#F8F0E7] text-[#26151D] border-l border-[#D6AD72]/50 shadow-2xl flex flex-col"
              >
                {/* Mobile Drawer Header */}
                <div className="px-6 py-5 border-b border-[#D6AD72]/35 flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-medium text-[#351522]">
                    Filters
                  </h2>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={handleClearMobileDraft}
                      className="text-xs font-medium text-[#351522] underline underline-offset-4 hover:text-[#D6AD72] transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(false)}
                      aria-label="Close filter drawer"
                      className="p-2 text-[#5C434E] hover:text-[#351522] transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                    >
                      <X className="w-5 h-5" strokeWidth={1.6} />
                    </button>
                  </div>
                </div>

                {/* Mobile Drawer Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {renderFilterSections('mobile', mobileDraftValues, 'vertical')}
                </div>

                {/* Mobile Drawer Sticky Footer Actions */}
                <div className="px-6 py-4 bg-[#F8F0E7] border-t border-[#D6AD72]/35 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleClearMobileDraft}
                    className="py-3 px-4 rounded-lg border border-[#D6AD72]/60 bg-[#FFF5E9] text-xs font-medium text-[#351522] hover:border-[#351522] transition-colors cursor-pointer min-h-[44px]"
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyMobileFilters}
                    className="py-3 px-4 rounded-lg bg-[#351522] text-[#F8F0E7] border border-[#D6AD72] text-xs font-medium tracking-wide hover:bg-[#26151D] transition-colors cursor-pointer min-h-[44px]"
                  >
                    Apply Filters ({draftPreviewCount})
                  </button>
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* Two-Column Layout: Desktop Filter Sidebar + Responsive Grid */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Desktop Filter Sidebar */}
          <aside
            aria-label="Product filters"
            className="hidden lg:block w-72 shrink-0 p-6 rounded-xl bg-[#F8F0E7] border border-[#D6AD72]/45 sticky top-24"
          >
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#D6AD72]/35">
              <h2 className="font-serif text-2xl font-medium text-[#351522]">
                Filters
              </h2>
              <button
                type="button"
                onClick={handleClearFilters}
                disabled={activeFilterCount === 0}
                className="text-xs font-medium text-[#351522] hover:text-[#D6AD72] underline underline-offset-4 disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>
            {renderFilterSections('desktop', liveFilterValues, 'vertical')}
          </aside>

          {/* Product Catalogue Grid */}
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-5 sm:hidden">
              <span className="text-xs text-[#5C434E] tabular-nums">
                Showing {filteredAndSortedProducts.length} of {products.length}{' '}
                fragrances
              </span>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-medium text-[#430F25] underline underline-offset-4 cursor-pointer"
                >
                  Clear filters
                </button>
              )}
            </div>

            {filteredAndSortedProducts.length === 0 ? (
              <div className="py-16 px-6 text-center rounded-xl bg-[#F8EBDD]/45 border border-[#C69A50]/30">
                <p className="font-serif text-3xl text-[#430F25] mb-2">
                  No fragrances match your selection
                </p>
                <p className="text-sm text-[#5C434E] max-w-md mx-auto mb-6">
                  Try widening your price range or clearing a few fragrance
                  family and size filters to explore the full collection.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#430F25] text-[#FFF5E9] border border-[#C69A50]/50 text-xs font-medium tracking-wide hover:bg-[#2B0817] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#C69A50]" strokeWidth={1.6} />
                  <span>Clear All Filters</span>
                </button>
              </div>
            ) : (
              <motion.div
                variants={staggerContainerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7"
              >
                <AnimatePresence mode="popLayout">
                  {filteredAndSortedProducts.map((product) => {
                    const isAdded = recentlyAddedId === product.id;
                    const isWishlisted = wishlistIds.includes(product.id);
                    const availableSizesText = product.variants
                      .map((v) => v.size)
                      .join(' · ');

                    return (
                      <motion.article
                        key={product.id}
                        layout
                        variants={staggerItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{
                          opacity: 0,
                          scale: 0.96,
                          transition: { duration: 0.2 },
                        }}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.3, ease: LUXURY_EASE }}
                        className="group flex flex-col justify-between rounded-xl bg-[#FFF5E9] border border-[#C69A50]/30 transition-shadow duration-300 hover:border-[#C69A50]/80 hover:shadow-[0_18px_38px_-18px_rgba(67,15,37,0.22)] overflow-hidden"
                      >
                        <div>
                          <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#F8EBDD]">
                            <button
                              type="button"
                              onClick={() => onViewDetails(product)}
                              className="block w-full h-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#430F25]"
                              aria-label={`View details for ${product.name}`}
                            >
                              <LuxuryImage
                                src={product.image}
                                alt={`${product.name} by AUREMIST Eau de Parfum`}
                                fallbackTitle={product.name}
                                className={`w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] ${
                                  !product.inStock ? 'opacity-80' : ''
                                }`}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() => onToggleWishlist(product)}
                              aria-pressed={isWishlisted}
                              aria-label={
                                isWishlisted
                                  ? `Remove ${product.name} from wishlist`
                                  : `Save ${product.name} to wishlist`
                              }
                              className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer shadow-sm ${
                                isWishlisted
                                  ? 'bg-[#430F25] text-[#C69A50] border-[#C69A50]'
                                  : 'bg-[#FFF5E9]/90 text-[#430F25] border-[#C69A50]/45 hover:bg-[#FFF5E9] hover:border-[#430F25]'
                              }`}
                            >
                              <Heart
                                className="w-4 h-4"
                                strokeWidth={1.7}
                                fill={isWishlisted ? 'currentColor' : 'none'}
                              />
                            </button>
                          </div>

                          <div className="p-5 pb-4">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="text-[11px] tracking-[0.16em] uppercase text-[#C69A50] font-semibold">
                                {product.fragranceFamily} · {product.audienceCategory}
                              </span>
                              <span
                                className={`text-[11px] font-medium ${
                                  product.inStock
                                    ? 'text-[#430F25]'
                                    : 'text-[#5C434E]/80'
                                }`}
                              >
                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => onViewDetails(product)}
                              className="text-left block w-full cursor-pointer focus-visible:outline-none focus-visible:underline mb-1.5"
                            >
                              <h2 className="font-serif text-2xl font-medium text-[#26151D] group-hover:text-[#430F25] transition-colors">
                                {product.name}
                              </h2>
                            </button>

                            <p className="text-xs text-[#5C434E] leading-relaxed line-clamp-2 mb-3">
                              {product.description}
                            </p>

                            <div className="flex items-baseline justify-between gap-2 text-xs">
                              <span className="text-[#5C434E]">
                                Sizes: {availableSizesText}
                              </span>
                              <div className="flex items-baseline gap-1.5 tabular-nums">
                                {product.originalPrice &&
                                  product.originalPrice > product.price && (
                                    <span className="text-xs text-[#5C434E] line-through">
                                      {formatPrice(product.originalPrice)}
                                    </span>
                                  )}
                                <span className="text-base font-semibold text-[#26151D]">
                                  {formatPrice(product.price)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="px-5 pb-5 pt-3.5 border-t border-[#C69A50]/20 grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => onViewDetails(product)}
                            className="inline-flex items-center justify-center px-3 py-2.5 rounded-lg text-xs font-medium tracking-wide bg-[#F8EBDD] text-[#430F25] border border-[#C69A50]/45 hover:border-[#430F25] hover:bg-[#FFF5E9] transition-colors cursor-pointer min-h-[40px]"
                          >
                            View Details
                          </button>

                          <motion.button
                            type="button"
                            disabled={!product.inStock}
                            whileTap={product.inStock ? { scale: 0.96 } : undefined}
                            onClick={() => handleCardAddToCart(product)}
                            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-colors duration-200 whitespace-nowrap min-h-[40px] border ${
                              !product.inStock
                                ? 'bg-[#F8EBDD]/60 text-[#5C434E]/75 border-[#C69A50]/25 cursor-not-allowed'
                                : isAdded
                                  ? 'bg-[#C69A50] text-[#26151D] border-[#C69A50] cursor-pointer'
                                  : 'bg-[#430F25] text-[#FFF5E9] border-[#C69A50]/45 hover:bg-[#2B0817] cursor-pointer'
                            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C69A50]`}
                          >
                            {!product.inStock ? (
                              <span>Out of Stock</span>
                            ) : isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" strokeWidth={2} />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus
                                  className="w-3.5 h-3.5 text-[#C69A50]"
                                  strokeWidth={1.75}
                                />
                                <span>Add to Cart</span>
                              </>
                            )}
                          </motion.button>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

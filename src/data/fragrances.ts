import {
  AudienceCategory,
  AvailabilityFilter,
  BottleSize,
  FaqItem,
  FragranceCategory,
  FragranceFamily,
  PerfumeProduct,
} from '../types/perfume';

export function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-US')}`;
}

export const HERO_IMAGE =
  '/src/assets/images/hero_auremist_burgundy_complete_1795445309603.jpg';
export const COLLECTION_BANNER_IMAGE =
  '/src/assets/images/collection_signature_banner_1795529089791.jpg';
export const ABOUT_ATELIER_IMAGE =
  '/src/assets/images/about_auremist_atelier_1795445716682.jpg';

const COFFRET_IMAGE = '/src/assets/images/gift_auremist_coffret_1795445717726.jpg';
const GALLERY_OUD_WOOD =
  '/src/assets/images/gallery_oud_wood_ingredients_1795531203732.jpg';
const GALLERY_FLORAL =
  '/src/assets/images/gallery_floral_botanical_stilllife_1795531204753.jpg';
const GALLERY_CITRUS =
  '/src/assets/images/gallery_citrus_botanicals_clean_1795531226306.jpg';
const GALLERY_ATOMIZER_AMBER =
  '/src/assets/images/gallery_amber_saffron_atomizer_1795531205169.jpg';

export const FRAGRANCE_CATEGORIES: FragranceCategory[] = [
  'All',
  'Woody & Oud',
  'Fresh Botanicals',
  'Floral',
  'Amber & Spice',
];

export const AUDIENCE_CATEGORIES: AudienceCategory[] = [
  'Men',
  'Women',
  'Unisex',
];

export const FRAGRANCE_FAMILIES: FragranceFamily[] = [
  'Woody',
  'Floral',
  'Fresh',
  'Oud',
  'Amber',
  'Citrus',
];

export const BOTTLE_SIZES: BottleSize[] = ['30ml', '50ml', '100ml'];

export const AVAILABILITY_OPTIONS: AvailabilityFilter[] = [
  'In Stock',
  'Out of Stock',
];

export const ALL_PERFUMES: PerfumeProduct[] = [
  {
    id: 'velvet-oud',
    slug: 'velvet-oud',
    name: 'Velvet Oud',
    subtitle: 'Smoked Oud & Damask Rose',
    category: 'Woody & Oud',
    audienceCategory: 'Unisex',
    fragranceFamily: 'Oud',
    concentration: 'Extrait de Parfum',
    concentrationPercent: '28% Aromatic Oils',
    label: 'Best Seller',
    notes: ['Smoked Oud', 'Damask Rose', 'Warm Amber'],
    pyramid: {
      top: 'Pink Peppercorn, Black Currant',
      heart: 'Damask Rose, Smoked Incense',
      base: 'Aged Agarwood, Warm Amber',
    },
    fragranceProfile: {
      longevity: '10+ hours',
      projection: 'Rich Evening Trail',
      season: 'Autumn & Winter',
      occasion: 'Evening, Formal & Festive',
      intendedAudience: 'Unisex',
    },
    price: 4900,
    originalPrice: 5400,
    defaultSize: '100ml',
    variants: [
      { size: '30ml', price: 2700, sku: 'AUR-VO-030', stockCount: 9 },
      {
        size: '50ml',
        price: 3600,
        originalPrice: 4000,
        sku: 'AUR-VO-050',
        stockCount: 6,
      },
      {
        size: '100ml',
        price: 4900,
        originalPrice: 5400,
        sku: 'AUR-VO-100',
        stockCount: 14,
      },
    ],
    inStock: true,
    featuredRank: 1,
    newestRank: 5,
    image: '/src/assets/images/auremist_velvet_oud_1795529090791.jpg',
    gallery: [
      {
        src: '/src/assets/images/auremist_velvet_oud_1795529090791.jpg',
        alt: 'Velvet Oud AUREMIST signature burgundy glass bottle',
        caption: '100ml Flacon',
      },
      {
        src: GALLERY_OUD_WOOD,
        alt: 'Aged agarwood oud chips, crimson damask rose petals, and black peppercorn',
        caption: 'Botanical Origins',
      },
      {
        src: GALLERY_ATOMIZER_AMBER,
        alt: 'Brushed champagne gold atomizer cap with golden amber resin',
        caption: 'Gold Atomizer Detail',
      },
      {
        src: COFFRET_IMAGE,
        alt: 'AUREMIST embossed gold presentation box with burgundy ribbon',
        caption: 'Signature Coffret',
      },
    ],
    description:
      'Velvety damask rose folded into resinous agarwood and dry golden amber.',
    fullDescription:
      'Composed in small batches around aged dark agarwood and hand-harvested crimson rose petals, Velvet Oud opens with a crisp spark of pink peppercorn before settling into warm smoked incense and ambered woods that linger gracefully through late evenings.',
  },
  {
    id: 'ivory-neroli',
    slug: 'ivory-neroli',
    name: 'Ivory Neroli',
    subtitle: 'Sunlit Blossom & White Tea',
    category: 'Fresh Botanicals',
    audienceCategory: 'Women',
    fragranceFamily: 'Fresh',
    concentration: 'Eau de Parfum',
    concentrationPercent: '20% Aromatic Oils',
    label: 'New',
    notes: ['Bitter Orange', 'White Tea', 'Cedarwood'],
    pyramid: {
      top: 'Calabrian Bergamot, Bitter Orange',
      heart: 'White Tea, Moroccan Neroli',
      base: 'Atlas Cedarwood, Ambrette Seed',
    },
    fragranceProfile: {
      longevity: '7–9 hours',
      projection: 'Airy & Moderate',
      season: 'Spring & Summer',
      occasion: 'Daytime, Brunch & Office',
      intendedAudience: 'Women',
    },
    price: 4500,
    defaultSize: '100ml',
    variants: [
      { size: '30ml', price: 2800, sku: 'AUR-IN-030', stockCount: 12 },
      { size: '50ml', price: 3400, sku: 'AUR-IN-050', stockCount: 8 },
      { size: '100ml', price: 4500, sku: 'AUR-IN-100', stockCount: 11 },
    ],
    inStock: true,
    featuredRank: 2,
    newestRank: 3,
    image: '/src/assets/images/perfume_ivory_neroli_clean_1795445716407.jpg',
    gallery: [
      {
        src: '/src/assets/images/perfume_ivory_neroli_clean_1795445716407.jpg',
        alt: 'Ivory Neroli AUREMIST flacon in studio daylight',
        caption: 'Signature Flacon',
      },
      {
        src: GALLERY_CITRUS,
        alt: 'White neroli blossoms, green white tea leaves, bergamot zest, and cedar shavings',
        caption: 'Botanical Notes',
      },
      {
        src: ABOUT_ATELIER_IMAGE,
        alt: 'AUREMIST atelier formulation table with glass pipette and raw extracts',
        caption: 'Atelier Craft',
      },
      {
        src: COFFRET_IMAGE,
        alt: 'AUREMIST embossed gold gift box and burgundy satin ribbon',
        caption: 'Signature Coffret',
      },
    ],
    description:
      'Morning dew over sun-warmed orange blossoms, white tea leaves, and pale cedar.',
    fullDescription:
      'Bright Calabrian bergamot and bitter orange blossom meet steeped silver white tea leaves in a serene, sunlit composition. Anchored by dry Atlas cedarwood and soft ambrette seed, Ivory Neroli brings effortless clarity from early morning through dusk.',
  },
  {
    id: 'nocturne-fig',
    slug: 'nocturne-fig',
    name: 'Nocturne Fig',
    subtitle: 'Black Fig & Velvet Iris',
    category: 'Floral',
    audienceCategory: 'Women',
    fragranceFamily: 'Floral',
    concentration: 'Eau de Parfum',
    concentrationPercent: '22% Aromatic Oils',
    label: 'Best Seller',
    notes: ['Black Fig', 'Violet Leaf', 'Sandalwood'],
    pyramid: {
      top: 'Crushed Fig Leaf, Black Plum',
      heart: 'Florentine Iris, Violet Petal',
      base: 'Mysore Sandalwood, Tonka Bean',
    },
    fragranceProfile: {
      longevity: '8–10 hours',
      projection: 'Moderate to Intimate',
      season: 'All Seasons',
      occasion: 'Artisanal Daily & Evening',
      intendedAudience: 'Women',
    },
    price: 4700,
    defaultSize: '100ml',
    variants: [
      { size: '30ml', price: 2900, sku: 'AUR-NF-030', stockCount: 5 },
      { size: '50ml', price: 3500, sku: 'AUR-NF-050', stockCount: 7 },
      { size: '100ml', price: 4700, sku: 'AUR-NF-100', stockCount: 10 },
    ],
    inStock: true,
    featuredRank: 3,
    newestRank: 6,
    image: '/src/assets/images/auremist_nocturne_fig_1795529092019.jpg',
    gallery: [
      {
        src: '/src/assets/images/auremist_nocturne_fig_1795529092019.jpg',
        alt: 'Nocturne Fig AUREMIST Eau de Parfum bottle',
        caption: 'Signature Flacon',
      },
      {
        src: GALLERY_FLORAL,
        alt: 'Crushed green fig leaves with dewy pink roses and white blooms',
        caption: 'Floral & Leaf Extract',
      },
      {
        src: ABOUT_ATELIER_IMAGE,
        alt: 'Perfumer worktable with botanical maceration apothecary bottles',
        caption: 'Small-Batch Blending',
      },
      {
        src: COFFRET_IMAGE,
        alt: 'AUREMIST luxury gift box presentation',
        caption: 'Signature Coffret',
      },
    ],
    description:
      'Mediterranean black fig balanced against powdery iris and creamy sandalwood.',
    fullDescription:
      'Green crushed fig leaves and ripe black plum open onto a velvety heart of Florentine iris and twilight violet. Resting on smooth Mysore sandalwood and subtly roasted tonka bean, Nocturne Fig captures quiet botanical depth with understated warmth.',
  },
  {
    id: 'saffron-dor',
    slug: 'saffron-dor',
    name: "Saffron d'Or",
    subtitle: 'Red Saffron & Cashmere Musk',
    category: 'Amber & Spice',
    audienceCategory: 'Unisex',
    fragranceFamily: 'Amber',
    concentration: 'Extrait de Parfum',
    concentrationPercent: '26% Aromatic Oils',
    label: 'New',
    notes: ['Red Saffron', 'Bergamot', 'Cashmere Musk'],
    pyramid: {
      top: 'Red Saffron, Golden Bergamot',
      heart: 'Honeyed Jasmine, Cardamom',
      base: 'Cashmere Musk, Smoked Vanilla',
    },
    fragranceProfile: {
      longevity: '9–11 hours',
      projection: 'Noticeable Warm Aura',
      season: 'Autumn, Winter & Evenings',
      occasion: 'Celebrations & Evening Wear',
      intendedAudience: 'Unisex',
    },
    price: 5200,
    originalPrice: 5800,
    defaultSize: '100ml',
    variants: [
      { size: '30ml', price: 3100, sku: 'AUR-SD-030', stockCount: 0 },
      {
        size: '50ml',
        price: 3900,
        originalPrice: 4300,
        sku: 'AUR-SD-050',
        stockCount: 4,
      },
      {
        size: '100ml',
        price: 5200,
        originalPrice: 5800,
        sku: 'AUR-SD-100',
        stockCount: 9,
      },
    ],
    inStock: true,
    featuredRank: 4,
    newestRank: 4,
    image: '/src/assets/images/auremist_saffron_dor_1795529092088.jpg',
    gallery: [
      {
        src: '/src/assets/images/auremist_saffron_dor_1795529092088.jpg',
        alt: "Saffron d'Or AUREMIST luxury flacon",
        caption: 'Signature Flacon',
      },
      {
        src: GALLERY_ATOMIZER_AMBER,
        alt: 'Crimson saffron threads and golden amber resin beside champagne gold cap',
        caption: 'Saffron & Resin Study',
      },
      {
        src: ABOUT_ATELIER_IMAGE,
        alt: 'Perfumer blending bench with amber maceration vessels',
        caption: 'Atelier Maceration',
      },
      {
        src: COFFRET_IMAGE,
        alt: 'AUREMIST gold and burgundy gift presentation box',
        caption: 'Signature Coffret',
      },
    ],
    description:
      'Luminous saffron threads steeped in cardamom and second-skin cashmere musk.',
    fullDescription:
      'Radiant crimson saffron threads and golden bergamot melt into honeyed jasmine blossoms and freshly crushed green cardamom. Finished with enveloping cashmere musk and smoked vanilla bean, Saffron d\'Or wraps the wearer in quiet ceremonial brilliance.',
  },
  {
    id: 'cedar-noir',
    slug: 'cedar-noir',
    name: 'Cedar Noir',
    subtitle: 'Atlas Cedar & Roasted Vetiver',
    category: 'Woody & Oud',
    audienceCategory: 'Men',
    fragranceFamily: 'Woody',
    concentration: 'Eau de Parfum',
    concentrationPercent: '22% Aromatic Oils',
    label: 'Signature',
    notes: ['Atlas Cedar', 'Haitian Vetiver', 'Black Pepper'],
    pyramid: {
      top: 'Crushed Black Pepper, Juniper Berry',
      heart: 'Atlas Cedarwood, Clary Sage',
      base: 'Roasted Vetiver, Dry Oakmoss',
    },
    fragranceProfile: {
      longevity: '8–10 hours',
      projection: 'Crisp & Tailored',
      season: 'All Seasons',
      occasion: 'Tailored Workwear & Evening',
      intendedAudience: 'Men',
    },
    price: 5400,
    defaultSize: '100ml',
    variants: [
      { size: '50ml', price: 4100, sku: 'AUR-CN-050', stockCount: 8 },
      { size: '100ml', price: 5400, sku: 'AUR-CN-100', stockCount: 12 },
    ],
    inStock: true,
    featuredRank: 5,
    newestRank: 2,
    image: '/src/assets/images/auremist_cedar_noir_1795529971722.jpg',
    gallery: [
      {
        src: '/src/assets/images/auremist_cedar_noir_1795529971722.jpg',
        alt: 'Cedar Noir AUREMIST Eau de Parfum bottle',
        caption: 'Signature Flacon',
      },
      {
        src: GALLERY_OUD_WOOD,
        alt: 'Dark aged woods and whole black peppercorns on cream travertine',
        caption: 'Wood & Spice Accords',
      },
      {
        src: ABOUT_ATELIER_IMAGE,
        alt: 'AUREMIST atelier table with pure cedar maceration apothecary jar',
        caption: 'Cèdre Pur Batch',
      },
      {
        src: COFFRET_IMAGE,
        alt: 'AUREMIST presentation coffret box',
        caption: 'Signature Coffret',
      },
    ],
    description:
      'Tailored dry cedarwood and earthy vetiver sharpened with cool black pepper.',
    fullDescription:
      'Architectural Atlas cedarwood meets aromatic clary sage and cool juniper berry, grounded by smoky Haitian vetiver and mineral dry oakmoss. Clean, disciplined, and unhurried, Cedar Noir leaves an unmistakable signature of modern tailoring.',
  },
  {
    id: 'rose-velours',
    slug: 'rose-velours',
    name: 'Rose Velours',
    subtitle: 'Centifolia Rose & White Peony',
    category: 'Floral',
    audienceCategory: 'Women',
    fragranceFamily: 'Floral',
    concentration: 'Eau de Parfum',
    concentrationPercent: '22% Aromatic Oils',
    label: 'New',
    notes: ['Centifolia Rose', 'Pink Peony', 'Satin Musk'],
    pyramid: {
      top: 'Lychee Mist, Dewy Pear',
      heart: 'Centifolia Rose, White Peony',
      base: 'Satin Musk, Blond Woods',
    },
    fragranceProfile: {
      longevity: '8–9 hours',
      projection: 'Soft Romantic Trail',
      season: 'Spring, Summer & Mild Autumn',
      occasion: 'Day-to-Evening & Weddings',
      intendedAudience: 'Women',
    },
    price: 5300,
    originalPrice: 5900,
    defaultSize: '100ml',
    variants: [
      { size: '30ml', price: 3200, sku: 'AUR-RV-030', stockCount: 7 },
      {
        size: '50ml',
        price: 4200,
        originalPrice: 4600,
        sku: 'AUR-RV-050',
        stockCount: 5,
      },
      {
        size: '100ml',
        price: 5300,
        originalPrice: 5900,
        sku: 'AUR-RV-100',
        stockCount: 8,
      },
    ],
    inStock: true,
    featuredRank: 6,
    newestRank: 1,
    image: '/src/assets/images/auremist_rose_velours_1795529973024.jpg',
    gallery: [
      {
        src: '/src/assets/images/auremist_rose_velours_1795529973024.jpg',
        alt: 'Rose Velours AUREMIST Eau de Parfum bottle',
        caption: 'Signature Flacon',
      },
      {
        src: GALLERY_FLORAL,
        alt: 'Fresh dewy pink centifolia roses and white peony blooms on ivory silk',
        caption: 'Centifolia Harvest',
      },
      {
        src: ABOUT_ATELIER_IMAGE,
        alt: 'Damask rose infusion bottles on cream stone table',
        caption: 'Rose de Damas Atelier',
      },
      {
        src: COFFRET_IMAGE,
        alt: 'AUREMIST luxury gift coffret',
        caption: 'Signature Coffret',
      },
    ],
    description:
      'Velvet-petalled centifolia rose lifted by crisp white peony and soft musk.',
    fullDescription:
      'Dew-touched pear and delicate lychee mist illuminate an abundant bouquet of hand-picked centifolia rose and translucent white peony. Settling into satin musk and pale blond woods, Rose Velours celebrates floral craftsmanship without excessive sweetness.',
  },
  {
    id: 'amalfi-citrus',
    slug: 'amalfi-citrus',
    name: 'Amalfi Citrus',
    subtitle: 'Blood Mandarin & Sea Salt',
    category: 'Fresh Botanicals',
    audienceCategory: 'Unisex',
    fragranceFamily: 'Citrus',
    concentration: 'Eau de Toilette',
    concentrationPercent: '15% Crisp Botanicals',
    label: 'New',
    notes: ['Amalfi Lemon', 'Blood Mandarin', 'Driftwood'],
    pyramid: {
      top: 'Amalfi Lemon Zest, Blood Mandarin',
      heart: 'Petitgrain, Coastal Rosemary',
      base: 'Salted Driftwood, White Musk',
    },
    fragranceProfile: {
      longevity: '5–7 hours',
      projection: 'Bright & Uplifting',
      season: 'Spring & Warm Summer',
      occasion: 'Daytime, Travel & Resort',
      intendedAudience: 'Unisex',
    },
    price: 4600,
    defaultSize: '100ml',
    variants: [
      { size: '30ml', price: 3100, sku: 'AUR-AC-030', stockCount: 15 },
      { size: '50ml', price: 3900, sku: 'AUR-AC-050', stockCount: 10 },
      { size: '100ml', price: 4600, sku: 'AUR-AC-100', stockCount: 9 },
    ],
    inStock: true,
    featuredRank: 7,
    newestRank: 7,
    image: '/src/assets/images/auremist_amalfi_citrus_1795529973186.jpg',
    gallery: [
      {
        src: '/src/assets/images/auremist_amalfi_citrus_1795529973186.jpg',
        alt: 'Amalfi Citrus AUREMIST perfume flacon',
        caption: 'Signature Flacon',
      },
      {
        src: GALLERY_CITRUS,
        alt: 'Fresh sliced blood mandarin, Calabrian bergamot zest curls, and white tea',
        caption: 'Coastal Citrus Oils',
      },
      {
        src: GALLERY_ATOMIZER_AMBER,
        alt: 'Precision brushed champagne gold atomizer detail',
        caption: 'Precision Atomizer',
      },
      {
        src: COFFRET_IMAGE,
        alt: 'AUREMIST signature presentation coffret',
        caption: 'Signature Coffret',
      },
    ],
    description:
      'Sun-drenched Amalfi citrus groves cooled by sea breeze and sun-bleached wood.',
    fullDescription:
      'Cold-pressed Amalfi lemon zest and sparkling blood mandarin unite with crisp petitgrain and wild coastal rosemary. Tempered by mineral salted driftwood and clean white musk, Amalfi Citrus evokes sunlit Mediterranean terraces in warm weather.',
  },
  {
    id: 'royal-agar',
    slug: 'royal-agar',
    name: 'Royal Agar',
    subtitle: 'Reserve Agarwood & Dark Leather',
    category: 'Woody & Oud',
    audienceCategory: 'Men',
    fragranceFamily: 'Oud',
    concentration: 'Extrait de Parfum',
    concentrationPercent: '30% Reserve Extrait',
    label: 'Best Seller',
    notes: ['Reserve Oud', 'Smoked Leather', 'Frankincense'],
    pyramid: {
      top: 'Nutmeg, Elemi Resin',
      heart: 'Somali Frankincense, Dark Leather',
      base: 'Reserve Agarwood, Patchouli Leaf',
    },
    fragranceProfile: {
      longevity: '12+ hours',
      projection: 'Commanding Evening Sillage',
      season: 'Winter & Cool Nights',
      occasion: 'Black Tie & Evening Reserve',
      intendedAudience: 'Men',
    },
    price: 6200,
    defaultSize: '100ml',
    variants: [
      { size: '50ml', price: 4800, sku: 'AUR-RA-050', stockCount: 0 },
      { size: '100ml', price: 6200, sku: 'AUR-RA-100', stockCount: 0 },
    ],
    inStock: false,
    featuredRank: 8,
    newestRank: 9,
    image: '/src/assets/images/auremist_royal_agar_1795529973932.jpg',
    gallery: [
      {
        src: '/src/assets/images/auremist_royal_agar_1795529973932.jpg',
        alt: 'Royal Agar AUREMIST Reserve Extrait flacon',
        caption: 'Reserve Flacon',
      },
      {
        src: GALLERY_OUD_WOOD,
        alt: 'Aged dark agarwood chips and raw resins on cream stone',
        caption: 'Reserve Agarwood',
      },
      {
        src: GALLERY_ATOMIZER_AMBER,
        alt: 'Brushed gold cap with amber resin tears and burgundy velvet',
        caption: 'Atelier Finishing',
      },
      {
        src: COFFRET_IMAGE,
        alt: 'AUREMIST embossed gift box',
        caption: 'Signature Coffret',
      },
    ],
    description:
      'Deep vintage agarwood wrapped in burnished leather and sacred resin.',
    fullDescription:
      'Our rarest reserve concentration pairs aged wild agarwood with Somali frankincense tears, warm nutmeg, and supple dark saddle leather. Grounded in earthy aged patchouli, Royal Agar delivers commanding nocturnal presence from first mist to dry-down.',
  },
  {
    id: 'amber-silk',
    slug: 'amber-silk',
    name: 'Amber Silk',
    subtitle: 'Golden Labdanum & Benzoin',
    category: 'Amber & Spice',
    audienceCategory: 'Women',
    fragranceFamily: 'Amber',
    concentration: 'Eau de Parfum',
    concentrationPercent: '22% Aromatic Oils',
    label: 'Signature',
    notes: ['Golden Amber', 'Benzoin Tears', 'Madagascar Vanilla'],
    pyramid: {
      top: 'Spiced Mandarin, Pink Pepper',
      heart: 'Spanish Labdanum, Heliotrope',
      base: 'Siam Benzoin, Madagascar Vanilla',
    },
    fragranceProfile: {
      longevity: '8–10 hours',
      projection: 'Warm Velvety Sillage',
      season: 'Autumn, Winter & Cool Evenings',
      occasion: 'Dinner, Intimate & Festive',
      intendedAudience: 'Women',
    },
    price: 4400,
    originalPrice: 4900,
    defaultSize: '50ml',
    variants: [
      { size: '30ml', price: 3400, sku: 'AUR-AS-030', stockCount: 6 },
      {
        size: '50ml',
        price: 4400,
        originalPrice: 4900,
        sku: 'AUR-AS-050',
        stockCount: 3,
      },
    ],
    inStock: true,
    featuredRank: 9,
    newestRank: 8,
    image: '/src/assets/images/auremist_amber_silk_1795529974407.jpg',
    gallery: [
      {
        src: '/src/assets/images/auremist_amber_silk_1795529974407.jpg',
        alt: 'Amber Silk AUREMIST Eau de Parfum bottle',
        caption: 'Signature Flacon',
      },
      {
        src: GALLERY_ATOMIZER_AMBER,
        alt: 'Golden benzoin and amber resin beside burgundy silk velvet',
        caption: 'Amber & Benzoin Resins',
      },
      {
        src: ABOUT_ATELIER_IMAGE,
        alt: 'Small-batch botanical atelier formulation',
        caption: 'Atelier Formulation',
      },
      {
        src: COFFRET_IMAGE,
        alt: 'AUREMIST presentation box with burgundy ribbon',
        caption: 'Signature Coffret',
      },
    ],
    description:
      'Luminous golden amber draped in warm benzoin resin and silken vanilla.',
    fullDescription:
      'Spiced mandarin zest and pink pepper softly introduce Spanish labdanum resin, powdery heliotrope, and molten Siam benzoin tears. Resting on smooth Madagascar vanilla pod, Amber Silk drapes over the skin like warm raw silk by candlelight.',
  },
];

export const FEATURED_PERFUMES: PerfumeProduct[] = ALL_PERFUMES.slice(0, 4);

export const SERVICE_HIGHLIGHTS = [
  { id: 'quality', title: 'Premium Quality', detail: '22% parfum oils' },
  { id: 'shipping', title: 'Free Shipping', detail: 'Across Pakistan' },
  { id: 'security', title: 'Secure Shopping', detail: 'Verified authentic' },
  { id: 'support', title: '24/7 Support', detail: 'Scent concierge' },
  { id: 'returns', title: 'Easy Returns', detail: '30-day guarantee' },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'longevity',
    question: 'How long does an Auremist Eau de Parfum last?',
    answer:
      'Crafted at a 22% aromatic oil concentration, each fragrance delivers 8 to 10 hours of lasting wear.',
  },
  {
    id: 'samples',
    question: 'Are discovery vials included with full bottles?',
    answer:
      'Every full bottle arrives with a matching 2 ml vial so you can test the scent before unsealing the box.',
  },
  {
    id: 'returns',
    question: 'What is your return policy?',
    answer:
      'Unopened, sealed bottles may be returned or exchanged within 30 days of delivery.',
  },
];

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MapPin, Star, Building, Navigation, List,
  Loader2, Home, Castle, BedDouble, DoorOpen,
  LayoutGrid, SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight,
  Bath, BadgeCheck, Heart, Check,
} from 'lucide-react';
import { stayService } from '@/services/stay.service';
import type { Stay } from '@/types/api.types';
import { Drawer } from 'vaul';
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { haptic } from '@/utils/haptics';

// ─── Types & constants ──────────────────────────────────────
type PropertyType = 'all' | 'apartment' | 'house' | 'villa' | 'condo' | 'room';
type SortOption   = 'default' | 'price_asc' | 'price_desc' | 'rating';

interface Filters {
  search:       string;
  propertyType: PropertyType;
  minPrice:     number;
  maxPrice:     number;
  minBedrooms:  number;
  minBathrooms: number;
  minRating:    number;
  sponsoredOnly: boolean;
  sort:         SortOption;
}

const DEFAULT_FILTERS: Filters = {
  search:       '',
  propertyType: 'all',
  minPrice:     0,
  maxPrice:     100000,
  minBedrooms:  0,
  minBathrooms: 0,
  minRating:    0,
  sponsoredOnly: false,
  sort:         'default',
};

const TYPE_OPTIONS: { type: PropertyType; label: string; icon: React.ElementType }[] = [
  { type: 'all',       label: 'All',       icon: LayoutGrid },
  { type: 'apartment', label: 'Apartment', icon: Building   },
  { type: 'house',     label: 'House',     icon: Home       },
  { type: 'villa',     label: 'Villa',     icon: Castle     },
  { type: 'condo',     label: 'Condo',     icon: BedDouble  },
  { type: 'room',      label: 'Room',      icon: DoorOpen   },
];

const PRICE_MAX = 100000;

// ─── Swipeable Card wrapper (mobile only) ───────────────
function SwipeCard({ children, propertyId, linkTo, onSave, onDismiss }: {
  children: React.ReactNode;
  propertyId: number;
  linkTo: string;
  onSave: () => void;
  onDismiss: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const opacity = useTransform(x, [-200, -80, 0, 80, 200], [0.4, 0.8, 1, 0.8, 0.4]);
  const saveScale = useTransform(x, [0, 100, 200], [0, 0.8, 1]);
  const dismissScale = useTransform(x, [-200, -100, 0], [1, 0.8, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSave();
    } else if (info.offset.x < -100) {
      onDismiss();
    }
  };

  return (
    <Link to={linkTo} className="group z-10 relative">
      {/* Swipe indicators */}
      <motion.div className="absolute inset-0 z-20 flex items-center justify-end pr-6 pointer-events-none" style={{ scale: saveScale }}>
        <div className="bg-emerald-500/90 text-white rounded-full p-3 shadow-lg backdrop-blur-sm">
          <Heart className="h-6 w-6 fill-white" />
        </div>
      </motion.div>
      <motion.div className="absolute inset-0 z-20 flex items-center justify-start pl-6 pointer-events-none" style={{ scale: dismissScale }}>
        <div className="bg-red-500/90 text-white rounded-full p-3 shadow-lg backdrop-blur-sm">
          <X className="h-6 w-6" />
        </div>
      </motion.div>
      <motion.div
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </Link>
  );
}

// ─── Component ──────────────────────────────────────────────
export default function ExplorePage() {
  const location = useLocation();
  const locationState = location.state as { search?: string } | null;

  const isMobile = useIsMobile();
  const [viewMode, setViewMode]     = useState<'map' | 'list'>('list');
  const [properties, setProperties] = useState<Stay[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [filters, setFilters]       = useState<Filters>(() => ({
    ...DEFAULT_FILTERS,
    search: locationState?.search ?? '',
  }));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());
  const [savedIds, setSavedIds]         = useState<Set<number>>(new Set());

  useEffect(() => {
    stayService.getAllStays()
      .then(setProperties)
      .catch(() => setError('Failed to load properties. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  // ─── Client-side filtering & sorting ────────────────────
  const filtered = useMemo(() => {
    let pool = [...properties];

    // Text search on title, city, state
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      pool = pool.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)  ||
        p.state.toLowerCase().includes(q)
      );
    }

    // Property type
    if (filters.propertyType !== 'all') {
      pool = pool.filter(p => p.property_type === filters.propertyType);
    }

    // Price range
    pool = pool.filter(p => {
      const price = Number(p.price);
      return price >= filters.minPrice && price <= filters.maxPrice;
    });

    // Bedrooms / bathrooms
    if (filters.minBedrooms  > 0) pool = pool.filter(p => p.bedrooms  >= filters.minBedrooms);
    if (filters.minBathrooms > 0) pool = pool.filter(p => p.bathrooms >= filters.minBathrooms);

    // Rating
    if (filters.minRating > 0) {
      pool = pool.filter(p => p.rating && Number(p.rating) >= filters.minRating);
    }

    // Featured only
    if (filters.sponsoredOnly) {
      pool = pool.filter(p => p.is_sponsored);
    }

    // Sort
    switch (filters.sort) {
      case 'price_asc':  pool.sort((a, b) => Number(a.price) - Number(b.price)); break;
      case 'price_desc': pool.sort((a, b) => Number(b.price) - Number(a.price)); break;
      case 'rating':     pool.sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0)); break;
      default:           pool.sort((a, b) => (b.is_sponsored ? 1 : 0) - (a.is_sponsored ? 1 : 0));
    }

    // Exclude swiped-away cards
    pool = pool.filter(p => !dismissedIds.has(p.id));

    return pool;
  }, [properties, filters, dismissedIds]);

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    haptic.light();
    setFilters(f => ({ ...f, [key]: value }));
  };

  const activeCount = [
    filters.propertyType !== 'all',
    filters.search.trim() !== '',
    filters.minPrice > 0,
    filters.maxPrice < PRICE_MAX,
    filters.minBedrooms > 0,
    filters.minBathrooms > 0,
    filters.minRating > 0,
    filters.sponsoredOnly,
    filters.sort !== 'default',
  ].filter(Boolean).length;

  // ─── Stepper helper ─────────────────────────────────────
  const Stepper = ({
    label, icon: Icon, value, onChange, max = 10
  }: { label: string; icon: React.ElementType; value: number; onChange: (v: number) => void; max?: number }) => (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Icon className="h-4 w-4" /> {label}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="h-7 w-7 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:border-[#09b4d6] hover:text-[#09b4d6] transition-colors disabled:opacity-30"
          disabled={value === 0}
        >–</button>
        <span className="w-5 text-center text-sm font-semibold text-gray-900 dark:text-white">
          {value === 0 ? 'Any' : `${value}+`}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="h-7 w-7 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:border-[#09b4d6] hover:text-[#09b4d6] transition-colors"
        >+</button>
      </div>
    </div>
  );

  // ─── Render ─────────────────────────────────────────────
  return (
    <div className="flex-1 w-full flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">

      {/* ── Filter Sidebar (Desktop only) ─────────────────── */}
      <aside
        className={`shrink-0 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col h-full overflow-y-auto transition-all duration-300
          ${sidebarOpen ? 'md:w-80 lg:w-96' : 'w-0 overflow-hidden border-r-0'}`}
      >
        <div className="p-5 flex flex-col gap-6 min-w-[300px]">

          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h2>
            {activeCount > 0 && (
              <button
                onClick={() => { haptic.medium(); setFilters(DEFAULT_FILTERS); }}
                className="text-xs text-[#09b4d6] font-semibold hover:underline flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Clear all ({activeCount})
              </button>
            )}
          </div>

          {/* Search */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              Search
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={e => set('search', e.target.value)}
                placeholder="City, state, or title..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-[#09b4d6] focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Property Type Pills */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
              Property Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TYPE_OPTIONS.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => set('propertyType', type)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all
                    ${filters.propertyType === type
                      ? 'border-[#09b4d6] bg-[#09b4d6]/10 text-[#09b4d6]'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
              Price / Night
            </label>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <span className="text-[10px] text-gray-400 block mb-1">Min</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
                  <input
                    type="number"
                    value={filters.minPrice}
                    min={0} max={filters.maxPrice - 1000}
                    onChange={e => set('minPrice', Math.max(0, Number(e.target.value)))}
                    className="w-full pl-6 pr-2 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 outline-none focus:ring-1 focus:ring-[#09b4d6]"
                  />
                </div>
              </div>
              <span className="text-gray-400 mt-4">—</span>
              <div className="flex-1">
                <span className="text-[10px] text-gray-400 block mb-1">Max</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    min={filters.minPrice + 1000}
                    onChange={e => set('maxPrice', Math.min(PRICE_MAX, Number(e.target.value)))}
                    className="w-full pl-6 pr-2 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 outline-none focus:ring-1 focus:ring-[#09b4d6]"
                  />
                </div>
              </div>
            </div>
            <input
              type="range"
              min={0} max={PRICE_MAX}
              value={filters.maxPrice}
              onChange={e => set('maxPrice', Number(e.target.value))}
              className="w-full accent-[#09b4d6]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>₹0</span><span>₹{PRICE_MAX.toLocaleString('en-IN')}+</span>
            </div>
          </div>

          {/* Rooms & Capacity */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
              Rooms &amp; Guests
            </label>
            <div className="space-y-4">
              <Stepper label="Bedrooms"  icon={BedDouble} value={filters.minBedrooms}  onChange={v => set('minBedrooms', v)} />
              <Stepper label="Bathrooms" icon={Bath}      value={filters.minBathrooms} onChange={v => set('minBathrooms', v)} />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
              Minimum Rating
            </label>
            <div className="flex gap-2">
              {[0, 3, 3.5, 4, 4.5].map(r => (
                <button
                  key={r}
                  onClick={() => set('minRating', r)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-all
                    ${filters.minRating === r
                      ? 'border-[#09b4d6] bg-[#09b4d6]/10 text-[#09b4d6]'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-400'
                    }`}
                >
                  {r === 0 ? 'Any' : `${r}★`}
                </button>
              ))}
            </div>
          </div>

          {/* Featured only */}
          <div className="flex items-center justify-between py-1">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              <BadgeCheck className="h-4 w-4 text-amber-500" />
              Featured only
            </label>
            <button
              onClick={() => set('sponsoredOnly', !filters.sponsoredOnly)}
              className={`relative w-10 h-5 rounded-full transition-colors ${filters.sponsoredOnly ? 'bg-[#09b4d6]' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${filters.sponsoredOnly ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          {/* Sort */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              Sort By
            </label>
            <div className="relative">
              <select
                value={filters.sort}
                onChange={e => set('sort', e.target.value as SortOption)}
                className="w-full py-2.5 pl-3 pr-8 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none focus:ring-1 focus:ring-[#09b4d6] appearance-none cursor-pointer"
              >
                <option value="default">Featured first</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

        </div>
      </aside>

      {/* ── Mobile Bottom Sheet (Vaul Drawer) ────────────── */}
      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 rounded-t-3xl max-h-[85vh] overflow-y-auto focus:outline-none">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-700 mt-3 mb-2" />
            <div className="p-5 flex flex-col gap-5 pb-8">

              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
                <div className="flex items-center gap-3">
                  {activeCount > 0 && (
                    <button
                      onClick={() => { haptic.medium(); setFilters(DEFAULT_FILTERS); }}
                      className="text-xs text-[#09b4d6] font-semibold hover:underline flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> Clear ({activeCount})
                    </button>
                  )}
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={e => set('search', e.target.value)}
                  placeholder="City, state, or title..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-[#09b4d6] focus:border-transparent outline-none"
                />
              </div>

              {/* Property Type */}
              <div className="grid grid-cols-3 gap-2">
                {TYPE_OPTIONS.map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => set('propertyType', type)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all
                      ${filters.propertyType === type
                        ? 'border-[#09b4d6] bg-[#09b4d6]/10 text-[#09b4d6]'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500'
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <span className="text-[10px] text-gray-400 block mb-1">Min ₹</span>
                  <input
                    type="number" value={filters.minPrice}
                    onChange={e => set('minPrice', Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 outline-none focus:ring-1 focus:ring-[#09b4d6]"
                  />
                </div>
                <span className="text-gray-400 mt-4">—</span>
                <div className="flex-1">
                  <span className="text-[10px] text-gray-400 block mb-1">Max ₹</span>
                  <input
                    type="number" value={filters.maxPrice}
                    onChange={e => set('maxPrice', Math.min(PRICE_MAX, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 outline-none focus:ring-1 focus:ring-[#09b4d6]"
                  />
                </div>
              </div>

              {/* Rooms */}
              <div className="space-y-3">
                <Stepper label="Bedrooms"  icon={BedDouble} value={filters.minBedrooms}  onChange={v => set('minBedrooms', v)} />
                <Stepper label="Bathrooms" icon={Bath}      value={filters.minBathrooms} onChange={v => set('minBathrooms', v)} />
              </div>

              {/* Rating */}
              <div className="flex gap-2">
                {[0, 3, 3.5, 4, 4.5].map(r => (
                  <button key={r} onClick={() => set('minRating', r)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-all
                      ${filters.minRating === r ? 'border-[#09b4d6] bg-[#09b4d6]/10 text-[#09b4d6]' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
                  >
                    {r === 0 ? 'Any' : `${r}★`}
                  </button>
                ))}
              </div>

              {/* Show results button */}
              <Button
                onClick={() => { haptic.medium(); setDrawerOpen(false); }}
                className="w-full h-12 bg-[#09b4d6] hover:bg-[#08a0bf] text-white font-bold rounded-xl text-base"
              >
                Show {filtered.length} properties
              </Button>

            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="flex-1 bg-gray-50/50 dark:bg-gray-950/50 flex flex-col h-full overflow-hidden relative">

        {/* Animated Mesh Gradient Background & Grid */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#09b4d6] rounded-full blur-[150px] opacity-20 animate-pulse mix-blend-multiply dark:mix-blend-screen"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500 rounded-full blur-[150px] opacity-15 animate-pulse mix-blend-multiply dark:mix-blend-screen" style={{ animationDelay: '3s' }}></div>
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:24px_24px] opacity-50"></div>
        </div>

        {/* Top bar */}
        <div className="px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 flex items-center gap-3 z-10 shrink-0">
          {/* Toggle sidebar (desktop) / Open drawer (mobile) */}
          <button
            onClick={() => {
              haptic.light();
              if (isMobile) { setDrawerOpen(true); }
              else { setSidebarOpen(o => !o); }
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-[#09b4d6] hover:text-[#09b4d6] transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <span className="bg-[#09b4d6] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {activeCount}
              </span>
            )}
          </button>

          <div className="flex-1 text-sm text-gray-500">
            {loading ? 'Loading...' : (
              <span>
                <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span>
                {filtered.length !== properties.length && <span> of {properties.length}</span>}
                {' '}properties
              </span>
            )}
          </div>

          {/* View toggle */}
          <div className="hidden md:flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <List className="w-4 h-4 mr-1.5" /> List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'map' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <MapPin className="w-4 h-4 mr-1.5" /> Map
            </button>
          </div>
        </div>

        {/* ── Horizontal scroll category pills ──────────── */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2.5 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-b border-gray-200/30 dark:border-gray-800/30 z-10 shrink-0">
          {TYPE_OPTIONS.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => { haptic.light(); set('propertyType', type); }}
              className={`flex items-center gap-1.5 flex-shrink-0 px-4 py-1.5 rounded-full border text-sm font-semibold whitespace-nowrap transition-all duration-200
                ${filters.propertyType === type
                  ? 'border-[#09b4d6] bg-[#09b4d6]/10 text-[#09b4d6] shadow-sm'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* View Area */}
        {viewMode === 'list' ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {loading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="rounded-3xl overflow-hidden bg-white/80 dark:bg-gray-900/80 border border-gray-200/60 dark:border-gray-800/60">
                    <Skeleton className="h-52 w-full" />
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-10" />
                      </div>
                      <Skeleton className="h-3 w-1/3" />
                      <div className="flex gap-3">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center h-64 text-red-500">{error}</div>
            )}
            {!loading && !error && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                <SlidersHorizontal className="w-10 h-10 opacity-30" />
                <p>No properties match your filters.</p>
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="text-sm text-[#09b4d6] hover:underline font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
            {!loading && !error && filtered.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((property) => {
                  const primaryImg = property.images?.find(i => i.is_primary) ?? property.images?.[0];
                  const isSaved = savedIds.has(property.id);

                  const cardContent = (
                    <Card className="overflow-hidden border border-gray-200/60 dark:border-gray-800/60 shadow-lg hover:shadow-2xl hover:shadow-[#09b4d6]/10 transition-all duration-500 rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl h-full flex flex-col group-hover:-translate-y-1">
                      <div className="relative h-52 group/card overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {property.images && property.images.length > 0 ? (
                          <>
                            <div 
                              className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
                              onClick={(e) => e.preventDefault()}
                            >
                              {property.images.map((img, idx) => (
                                <div key={idx} className="min-w-full h-full snap-start">
                                  <img 
                                    src={img.image_url} 
                                    alt={`${property.title} - ${idx + 1}`} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                </div>
                              ))}
                            </div>
                            {property.images.length > 1 && (
                              <>
                                <button 
                                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover/card:opacity-100 transition-opacity z-20"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.parentElement?.querySelector('.overflow-x-auto')?.scrollBy({ left: -200, behavior: 'smooth' });
                                  }}
                                >
                                  <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button 
                                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover/card:opacity-100 transition-opacity z-20"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.parentElement?.querySelector('.overflow-x-auto')?.scrollBy({ left: 200, behavior: 'smooth' });
                                  }}
                                >
                                  <ChevronRight className="h-5 w-5" />
                                </button>
                                <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full z-10">
                                  {property.images.length} photos
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                        )}
                        <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/90 backdrop-blur-md px-2 py-1 rounded text-xs font-bold shadow-md z-10">
                          ₹{Number(property.price).toLocaleString('en-IN')}/night
                        </div>
                        {property.is_sponsored && (
                          <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow z-10">
                            FEATURED
                          </div>
                        )}
                        {/* Save indicator (shows after swipe-right save) */}
                        {isSaved && (
                          <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow z-10 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Saved
                          </div>
                        )}
                        <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize z-10">
                          {property.property_type}
                        </div>
                      </div>
                      <CardContent className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-[#09b4d6] transition-colors">
                              {property.title}
                            </h3>
                            {property.rating && Number(property.rating) > 0 && (
                              <div className="flex items-center gap-0.5 text-xs font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded shrink-0 ml-2">
                                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                {Number(property.rating).toFixed(1)}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {property.city}, {property.state}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1"><Building className="h-3.5 w-3.5" /> {property.bedrooms} bed</span>
                            <span className="flex items-center gap-1">🛁 {property.bathrooms} bath</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );

                  // ─── Mobile: swipeable card ──────────────────
                  if (isMobile) {
                    return (
                      <SwipeCard
                        key={property.id}
                        propertyId={property.id}
                        linkTo={`/stays/${property.id}`}
                        onSave={() => { haptic.success(); setSavedIds(s => new Set(s).add(property.id)); }}
                        onDismiss={() => { haptic.medium(); setDismissedIds(s => new Set(s).add(property.id)); }}
                      >
                        {cardContent}
                      </SwipeCard>
                    );
                  }

                  // ─── Desktop: static card with hover ──────────
                  return (
                    <Link to={`/stays/${property.id}`} key={property.id} className="group z-10">
                      <motion.div
                        whileHover={{ y: -4, scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      >
                        {cardContent}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 relative bg-blue-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
            <div
              className="absolute inset-0 w-full h-full opacity-60 dark:opacity-40"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                filter: 'grayscale(0.3) contrast(1.2)'
              }}
            />
            {filtered.slice(0, 6).map((prop, idx) => (
              <div
                key={prop.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform cursor-pointer z-10"
                style={{ top: `${25 + idx * 10}%`, left: `${15 + idx * 13}%` }}
              >
                <Link to={`/stays/${prop.id}`}>
                  <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-1.5 rounded-full font-bold shadow-lg border-2 border-[#09b4d6] text-sm">
                    ₹{(Number(prop.price) / 1000).toFixed(1)}k
                  </div>
                  <div className="w-3 h-3 bg-[#09b4d6] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                </Link>
              </div>
            ))}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
              <Button size="lg" className="bg-gray-900 text-white hover:bg-black rounded-full shadow-2xl px-8 border-2 border-white/20 h-14">
                <Navigation className="mr-2 h-5 w-5 text-[#09b4d6]" /> Scan Near Me
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

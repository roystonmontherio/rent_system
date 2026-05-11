import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin, Building, Star, ChevronRight, CheckCircle2, Compass, User, CalendarDays, Users, Loader2, Home, Castle, BedDouble, LayoutGrid, DoorOpen } from 'lucide-react';
import { stayService } from '@/services/stay.service';
import type { Stay } from '@/types/api.types';
import { haptic } from '@/utils/haptics';

type PropertyType = 'all' | 'apartment' | 'house' | 'villa' | 'condo' | 'room';

const PROPERTY_TYPES: { type: PropertyType; label: string; icon: React.ElementType }[] = [
  { type: 'all',       label: 'All',       icon: LayoutGrid },
  { type: 'apartment', label: 'Apartment',  icon: Building   },
  { type: 'house',     label: 'House',      icon: Home       },
  { type: 'villa',     label: 'Villa',      icon: Castle     },
  { type: 'condo',     label: 'Condo',      icon: BedDouble  },
  { type: 'room',      label: 'Room',       icon: DoorOpen   },
];

export default function LandingPage() {
  const [allProperties, setAllProperties] = useState<Stay[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [activeType, setActiveType] = useState<PropertyType>('all');
  const [heroSearch, setHeroSearch] = useState('');
  const navigate = useNavigate();

  const handleHeroSearch = () => {
    navigate('/explore', { state: { search: heroSearch.trim() } });
  };

  useEffect(() => {
    stayService.getAllStays()
      .then(setAllProperties)
      .catch(() => setAllProperties([]))
      .finally(() => setLoadingFeatured(false));
  }, []);

  // Show sponsored first; if a type is selected filter by it; cap at 6
  const featured = useMemo(() => {
    let pool = [...allProperties].sort((a, b) => (b.is_sponsored ? 1 : 0) - (a.is_sponsored ? 1 : 0));
    if (activeType !== 'all') pool = pool.filter(p => p.property_type === activeType);
    return pool.slice(0, 6);
  }, [allProperties, activeType]);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-950">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#09b4d6] rounded-full blur-[120px] opacity-30 animate-pulse mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500 rounded-full blur-[120px] opacity-20 animate-pulse mix-blend-multiply dark:mix-blend-screen pointer-events-none" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] bg-amber-400 rounded-full blur-[120px] opacity-15 animate-pulse mix-blend-multiply dark:mix-blend-screen pointer-events-none" style={{ animationDelay: '4s' }}></div>
        
        {/* Faint Grid Overlay */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        {/* Floating Property Images (Parallax effect) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 lg:opacity-100">
          {/* Top Left */}
          <div className="absolute top-[5%] lg:top-[10%] left-[2%] lg:left-[8%] w-32 lg:w-56 h-40 lg:h-64 rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-2xl -rotate-6 opacity-90 transform transition-transform duration-700 hover:rotate-0 hover:scale-105 border-4 border-white/40 dark:border-gray-800/40 pointer-events-auto hidden sm:block">
            <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" alt="Villa" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80' }} />
          </div>
          {/* Top Right */}
          <div className="absolute top-[10%] lg:top-[15%] right-[2%] lg:right-[6%] w-40 lg:w-64 h-48 lg:h-72 rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-2xl rotate-6 opacity-90 transform transition-transform duration-700 hover:rotate-0 hover:scale-105 border-4 border-white/40 dark:border-gray-800/40 pointer-events-auto hidden sm:block">
            <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80" alt="Mansion" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=800&q=80' }} />
          </div>
          {/* Bottom Left */}
          <div className="absolute bottom-[20%] lg:bottom-[10%] left-[5%] lg:left-[12%] w-36 lg:w-64 h-28 lg:h-48 rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-2xl -rotate-3 opacity-90 transform transition-transform duration-700 hover:rotate-0 hover:scale-105 border-4 border-white/40 dark:border-gray-800/40 pointer-events-auto hidden md:block">
            <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80" alt="Apartment" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1502672260266-1c1c24240f38?auto=format&fit=crop&w=800&q=80' }} />
          </div>
          {/* Bottom Right */}
          <div className="absolute bottom-[15%] lg:bottom-[5%] right-[10%] lg:right-[15%] w-28 lg:w-48 h-36 lg:h-56 rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-2xl rotate-12 opacity-90 transform transition-transform duration-700 hover:rotate-0 hover:scale-105 border-4 border-white/40 dark:border-gray-800/40 pointer-events-auto hidden md:block">
            <img src="https://images.unsplash.com/photo-1600607687931-ce8105fb9017?auto=format&fit=crop&w=800&q=80" alt="Interior" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80' }} />
          </div>
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center mt-[-5vh]">
          <div className="p-4 sm:p-8 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 sm:mb-6">
              Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#09b4d6]">Stay</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 font-medium leading-relaxed px-2">
              Discover premium properties for rent, curated by top brokers and verified owners.
            </p>
            
            {/* Glassmorphic Search Bar */}
            <div className="w-full max-w-4xl mx-auto bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl border border-white/50 dark:border-gray-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-3xl overflow-hidden p-2 transition-all hover:bg-white/70 dark:hover:bg-gray-900/70">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 flex items-center px-4 h-14 border-b md:border-b-0 md:border-r border-gray-200/50 dark:border-gray-800/50">
                  <MapPin className="text-gray-500 dark:text-gray-400 h-5 w-5 mr-3 shrink-0" />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={e => setHeroSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleHeroSearch()}
                    placeholder="City, state, or property name..."
                    className="w-full bg-transparent border-0 focus:ring-0 outline-none font-medium text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>
                <div className="flex-1 flex items-center px-4 h-14 border-b md:border-b-0 md:border-r border-gray-200/50 dark:border-gray-800/50 group cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-xl md:rounded-none">
                  <CalendarDays className="text-gray-500 dark:text-gray-400 h-5 w-5 mr-3 shrink-0 group-hover:text-[#09b4d6] transition-colors" />
                  <div className="flex flex-col items-start w-full">
                    <span className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">Dates</span>
                    <span className="font-medium text-sm text-gray-900 dark:text-white">Add dates</span>
                  </div>
                </div>
                <div className="flex-1 flex items-center px-4 h-14 border-b md:border-b-0 md:border-r border-gray-200/50 dark:border-gray-800/50 group cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-xl md:rounded-none">
                  <Users className="text-gray-500 dark:text-gray-400 h-5 w-5 mr-3 shrink-0 group-hover:text-[#09b4d6] transition-colors" />
                  <div className="flex flex-col items-start w-full">
                    <span className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">Guests</span>
                    <span className="font-medium text-sm text-gray-900 dark:text-white">Add guests</span>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={() => { haptic.medium(); handleHeroSearch(); }}
                  className="w-full md:w-auto h-14 px-8 text-base font-bold bg-[#09b4d6] hover:bg-[#08a0bf] text-white rounded-2xl shadow-lg shadow-cyan-500/25"
                >
                  <Search className="mr-2 h-5 w-5" /> Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Property Type Filter Strip ──────────────────────── */}
      <section className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900 sticky top-[64px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-4 scrollbar-hide">
            {PROPERTY_TYPES.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => { haptic.light(); setActiveType(type); }}
                className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl min-w-[72px] transition-all duration-200 group shrink-0
                  ${ activeType === type
                    ? 'text-[#09b4d6] border-b-2 border-[#09b4d6]'
                    : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border-b-2 border-transparent'
                  }`}
              >
                <Icon className={`h-6 w-6 transition-colors ${ activeType === type ? 'text-[#09b4d6]' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300' }`} />
                <span className="text-xs font-semibold whitespace-nowrap">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured / Filtered Properties ──────────────────── */}
      <section id="featured" className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-3">
                {activeType === 'all' ? 'Featured Properties' : `${PROPERTY_TYPES.find(t => t.type === activeType)?.label}s`}
              </h2>
              <p className="text-muted-foreground max-w-2xl leading-relaxed">
                {activeType === 'all'
                  ? 'Hand-picked premium stays offering the best amenities and locations.'
                  : `Showing all ${PROPERTY_TYPES.find(t => t.type === activeType)?.label.toLowerCase()} listings.`}
              </p>
            </div>
            <Link to="/explore" className="hidden sm:flex items-center text-primary font-semibold hover:text-primary/80 transition-colors">
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                  <Skeleton className="h-64 w-full" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No featured properties yet.</p>
              <Link to="/explore" className="mt-4 inline-block">
                <Button variant="outline">Browse all properties</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((property) => {
                const primaryImg = property.images?.find(i => i.is_primary) ?? property.images?.[0];
                return (
                  <Link to={`/stays/${property.id}`} key={property.id} className="group">
                    <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl bg-white dark:bg-gray-900 h-full flex flex-col">
                      <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {primaryImg
                          ? <img src={primaryImg.image_url} alt={property.title} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80' }} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                        }
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">FEATURED</div>
                        <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1 font-bold text-gray-900 dark:text-white">
                          ₹{Number(property.price).toLocaleString('en-IN')}<span className="text-xs font-normal text-gray-500">/night</span>
                        </div>
                      </div>
                      <CardContent className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-sm text-gray-500 mb-2 font-medium">
                            <MapPin className="h-3.5 w-3.5" /> {property.city}, {property.state}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-[#09b4d6] transition-colors">{property.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mt-4 font-medium">
                            <div className="flex items-center gap-1.5"><Building className="h-4 w-4 text-[#09b4d6]" /><span className="capitalize">{property.property_type}</span></div>
                          </div>
                        </div>
                        {property.rating && (
                          <div className="flex items-center gap-1 text-amber-500 font-bold pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
                            <Star className="h-4 w-4 fill-amber-500" /> <span>{property.rating}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">One Platform. Three Experiences.</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400">Whether you're looking for a place to stay, managing properties, or brokering deals — we have a tailored experience for you.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: Compass, color: 'from-blue-500 to-indigo-600', title: 'Guests', desc: 'Discover the perfect property with spatial search, advanced filters, and direct communication.', perks: ['Spatial Search & Filtering', 'Direct Chat with Owners', 'Verified Listings'], link: '/register', label: 'Sign up as Guest', variant: 'outline' as const },
              { icon: Building, color: 'from-[#09b4d6] to-blue-500', title: 'Property Owners', desc: 'List your properties in our premium directory and connect with potential leads via our built-in chat.', perks: ['Bento-grid Dashboard', 'Property Visibility', 'Direct Lead Generation'], link: '/register', label: 'Start Listing', variant: 'default' as const },
              { icon: User, color: 'from-purple-500 to-pink-600', title: 'Brokers', desc: 'A professional portal to manage assigned listings and facilitate high-quality leads for owners.', perks: ['Professional Portal', 'Lead Facilitation', 'Property Management'], link: '/register', label: 'Join as Broker', variant: 'outline' as const },
            ].map(({ icon: Icon, color, title, desc, perks, link, label, variant }) => (
              <div key={title} className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800">
                <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{desc}</p>
                <ul className="space-y-3 mb-8">
                  {perks.map(p => (
                    <li key={p} className="flex items-center text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4 text-[#09b4d6] mr-2" /> {p}
                    </li>
                  ))}
                </ul>
                <Link to={link}>
                  <Button variant={variant} className={`w-full ${variant === 'default' ? 'bg-[#09b4d6] hover:bg-[#08a0bf] text-white' : ''}`}>{label}</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

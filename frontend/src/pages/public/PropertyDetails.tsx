import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MapPin, Star, Share, Heart, ChevronLeft, ChevronRight, Wifi, Tv,
  Coffee, Wind, Loader2, BedDouble, Bath,
  MessageCircle, Building2, User
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { stayService } from '@/services/stay.service';
import api from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import type { Stay } from '@/types/api.types';
import { haptic } from '@/utils/haptics';

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [property, setProperty]   = useState<Stay | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [startingChat, setStartingChat] = useState(false);
  const [liked, setLiked]         = useState(false);

  // ─── Parallax scroll transforms ─────────────────────────
  const { scrollY } = useScroll();
  const imgHeight  = useTransform(scrollY, [0, 250], [420, 80]);
  const imgOpacity = useTransform(scrollY, [0, 200], [1, 0.3]);
  const imgScale   = useTransform(scrollY, [0, 250], [1, 1.15]);

  useEffect(() => {
    if (!id) return;
    stayService.getStayById(Number(id))
      .then(setProperty)
      .catch(() => setError('Property not found or unavailable.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleContactPoster = async () => {
    if (!user) { navigate('/login'); return; }
    if (user.id === property?.listed_by_id) return;

    setStartingChat(true);
    try {
      await api.post('/chat/conversations', { stay_id: property?.id });
      if (user.role === 'owner') {
        navigate('/owner/inbox');
      } else if (user.role === 'broker') {
        navigate('/broker/inbox');
      } else {
        navigate('/explore');
      }
    } catch (err: any) {
      console.error('Failed to start conversation', err);
    } finally {
      setStartingChat(false);
    }
  };

  // ─── Skeleton Loading State ─────────────────────────────
  if (loading) return (
    <div className="bg-white dark:bg-gray-950 min-h-screen pb-24">
      {/* Sticky nav skeleton */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <div className="flex gap-3">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title skeleton */}
        <div className="mb-6 space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-2/3" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        {/* Hero image skeleton */}
        <Skeleton className="w-full h-[380px] sm:h-[480px] rounded-3xl mb-10" />
        {/* Content skeleton */}
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-8">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 space-y-2">
                  <Skeleton className="h-5 w-5 mx-auto" />
                  <Skeleton className="h-7 w-8 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
          <div className="w-full lg:w-[420px]">
            <Skeleton className="h-[360px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );

  if (error || !property) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-red-500 text-lg">{error || 'Property not found.'}</p>
      <Link to="/explore"><Button variant="outline"><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button></Link>
    </div>
  );

  const price = Number(property.price);

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen pb-24">
      {/* Sticky nav */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/explore" className="flex items-center text-sm font-medium text-gray-600 hover:text-[#09b4d6] transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Explore
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => haptic.light()}>
              <Share className="h-4 w-4 mr-2" /> Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { haptic.success(); setLiked(l => !l); }}
              className={liked ? 'text-red-500' : ''}
            >
              <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-red-500' : ''}`} /> {liked ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-500 px-2.5 py-1 rounded-full capitalize">
              {property.property_type}
            </span>
            {property.is_sponsored && (
              <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">⭐ Featured</span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">{property.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            {property.rating && Number(property.rating) > 0 && (
              <div className="flex items-center gap-1 font-bold text-gray-900 dark:text-white">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />{Number(property.rating).toFixed(1)}
              </div>
            )}
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-gray-400" />{property.city}, {property.state}
            </div>
          </div>
        </motion.div>

        {/* ── Parallax Hero image carousel ─────────────────── */}
        <motion.div
          style={{ height: imgHeight, opacity: imgOpacity }}
          className="sticky top-[73px] z-30 rounded-3xl overflow-hidden mb-10 bg-gray-100 dark:bg-gray-800"
        >
          {property.images && property.images.length > 0 ? (
            <>
              <motion.div 
                id="property-carousel"
                className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
                style={{ scale: imgScale }}
              >
                {property.images.map((img, idx) => (
                  <div key={idx} className="min-w-full h-full snap-start relative">
                    <img 
                      src={img.image_url} 
                      alt={`${property.title} - ${idx + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
                      {idx + 1} / {property.images.length}
                    </div>
                  </div>
                ))}
              </motion.div>

              {property.images.length > 1 && (
                <>
                  <button 
                    onClick={() => document.getElementById('property-carousel')?.scrollBy({ left: -400, behavior: 'smooth' })}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button 
                    onClick={() => document.getElementById('property-carousel')?.scrollBy({ left: 400, behavior: 'smooth' })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium italic">
              <Building2 className="h-12 w-12 opacity-20 mb-2 block mx-auto" />
              No images available
            </div>
          )}
        </motion.div>

        {/* Content split */}
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Left: details */}
          <motion.div
            className="flex-1 space-y-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-6 border-b border-gray-200 dark:border-gray-800 pb-8">
              <div className="grid grid-cols-3 gap-4 text-center w-full">
                {[
                  { icon: BedDouble, label: 'Bedrooms', value: property.bedrooms },
                  { icon: Bath,      label: 'Bathrooms', value: property.bathrooms },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
                    <Icon className="h-5 w-5 text-[#09b4d6] mx-auto mb-1" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
                    <div className="text-xs text-gray-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {property.description && (
              <div>
                <h3 className="text-xl font-bold mb-4">About this space</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{property.description}</p>
              </div>
            )}

            <div>
              <h3 className="text-xl font-bold mb-4">What this place offers</h3>
              {property.amenities && property.amenities.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {property.amenities.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 capitalize">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#09b4d6] shrink-0" />{a}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-gray-600 dark:text-gray-300 text-sm">
                  <div className="flex items-center gap-3"><Wifi className="h-5 w-5 text-gray-400" />Fast Wi-Fi</div>
                  <div className="flex items-center gap-3"><Tv className="h-5 w-5 text-gray-400" />Smart TV</div>
                  <div className="flex items-center gap-3"><Wind className="h-5 w-5 text-gray-400" />AC</div>
                  <div className="flex items-center gap-3"><Coffee className="h-5 w-5 text-gray-400" />Kitchen</div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: Contact Poster card */}
          <motion.div
            className="w-full lg:w-[420px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="sticky top-24 border-gray-200 dark:border-gray-800 shadow-xl rounded-2xl bg-white dark:bg-gray-950 p-6 flex flex-col items-center">
              
              <div className="w-20 h-20 rounded-full bg-[#09b4d6]/10 text-[#09b4d6] flex items-center justify-center font-bold text-2xl mb-4">
                {property.listed_by_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {property.listed_by_name}
              </h3>
              
              <div className="flex items-center text-gray-500 mb-6 gap-2 text-sm">
                {property.listed_by_role === 'broker' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                <span className="capitalize">{property.listed_by_role}</span>
              </div>

              <div className="w-full bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-6 border border-gray-100 dark:border-gray-800 text-center">
                <span className="text-sm text-gray-500 block mb-1">Listed Price</span>
                <span className="text-3xl font-extrabold text-[#09b4d6]">₹{price.toLocaleString('en-IN')}</span>
              </div>

              <Button
                onClick={() => { haptic.medium(); handleContactPoster(); }}
                disabled={startingChat || user?.id === property.listed_by_id}
                className="w-full bg-gradient-to-r from-[#09b4d6] to-blue-600 hover:from-[#08a0bf] hover:to-blue-700 text-white font-bold h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {startingChat ? (
                  <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Connecting...</>
                ) : user?.id === property.listed_by_id ? (
                  'This is your listing'
                ) : (
                  <><MessageCircle className="w-5 h-5 mr-2" /> Send Message</>
                )}
              </Button>

              {!user && (
                <p className="text-center text-xs text-gray-400 mt-4">
                  <Link to="/login" className="text-[#09b4d6] hover:underline font-semibold">Sign in</Link> to contact the poster
                </p>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

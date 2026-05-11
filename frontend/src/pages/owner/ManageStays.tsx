import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Plus, Trash2, Pencil, MapPin, BedDouble, Bath,
  Loader2, Building2, Search, SlidersHorizontal, LayoutGrid, List,
  Eye, EyeOff,
} from 'lucide-react';
import { stayService } from '@/services/stay.service';
import type { Stay } from '@/types/api.types';
import AddStayForm from '../../components/owner/AddStayForm';
import EditStayForm from '../../components/owner/EditStayForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ViewMode = 'list' | 'add' | 'edit';
type DisplayMode = 'grid' | 'table';

export default function ManageStays() {
  const [stays, setStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('grid');
  const [editingStay, setEditingStay] = useState<Stay | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchStays = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await stayService.getMyStays();
      setStays(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load properties.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await stayService.deleteStay(deleteConfirmId);
      setStays(stays.filter((s) => s.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete property.');
    }
  };

  const handleEdit = (stay: Stay) => {
    setEditingStay(stay);
    setViewMode('edit');
  };


  useEffect(() => { fetchStays(); }, []);

  const handleFormSuccess = () => {
    setViewMode('list');
    setEditingStay(null);
    fetchStays();
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingStay(null);
  };

  const filtered = stays.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase()) ||
    s.property_code.toLowerCase().includes(search.toLowerCase())
  );

  // ── Add Form ────────────────────────────────────────────
  if (viewMode === 'add') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Property</h1>
            <p className="text-muted-foreground mt-1">Fill in the details to list a new property.</p>
          </div>
          <Button variant="outline" onClick={handleCancel}>← Cancel</Button>
        </div>
        <AddStayForm onSuccess={handleFormSuccess} onCancel={handleCancel} />
      </div>
    );
  }

  // ── Edit Form ───────────────────────────────────────────
  if (viewMode === 'edit' && editingStay) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Property</h1>
            <p className="text-muted-foreground mt-1">
              Updating: <span className="font-semibold">{editingStay.title}</span>
            </p>
          </div>
          <Button variant="outline" onClick={handleCancel}>← Cancel</Button>
        </div>
        <EditStayForm stay={editingStay} onSuccess={handleFormSuccess} onCancel={handleCancel} />
      </div>
    );
  }

  // ── Properties List ─────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            My Properties
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {loading ? 'Loading…' : `${stays.length} listing${stays.length !== 1 ? 's' : ''} in your portfolio`}
          </p>
        </div>
        <Button
          onClick={() => setViewMode('add')}
          className="bg-[#09b4d6] hover:bg-[#08a0bf] text-white shadow-sm shadow-[#09b4d6]/30 h-10 px-5 font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Property
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, city, or code…"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-[#09b4d6] focus:border-transparent transition-all"
          />
        </div>

        {/* View toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg ml-auto">
          <button
            onClick={() => setDisplayMode('grid')}
            className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              displayMode === 'grid'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4 mr-1.5" /> Grid
          </button>
          <button
            onClick={() => setDisplayMode('table')}
            className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              displayMode === 'table'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <List className="w-4 h-4 mr-1.5" /> List
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm font-medium text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin mr-3" /> Loading your properties…
        </div>
      )}

      {/* Empty */}
      {!loading && stays.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Building2 className="h-9 w-9 text-gray-300 dark:text-gray-600" />
          </div>
          <div>
            <p className="font-bold text-gray-700 dark:text-gray-300 text-lg">No properties yet</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add Property" to list your first stay.</p>
          </div>
          <Button
            onClick={() => setViewMode('add')}
            className="bg-[#09b4d6] hover:bg-[#08a0bf] text-white mt-2"
          >
            <Plus className="h-4 w-4 mr-2" /> Add your first property
          </Button>
        </div>
      )}

      {/* No search results */}
      {!loading && stays.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <SlidersHorizontal className="h-8 w-8 opacity-30 mx-auto mb-3" />
          <p>No properties match "<span className="font-semibold">{search}</span>"</p>
          <button onClick={() => setSearch('')} className="mt-2 text-sm text-[#09b4d6] hover:underline">
            Clear search
          </button>
        </div>
      )}

      {/* ── GRID VIEW ──────────────────────────────────── */}
      {!loading && filtered.length > 0 && displayMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((stay) => {
            const primaryImg = stay.images?.find(i => i.is_primary) ?? stay.images?.[0];
            return (
              <div
                key={stay.id}
                className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  {primaryImg ? (
                    <img
                      src={primaryImg.image_url}
                      alt={stay.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-600">
                      <Building2 className="h-10 w-10 mb-1" />
                      <span className="text-xs">No image</span>
                    </div>
                  )}

                  {/* Status badge */}
                  <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow ${
                    stay.is_listed
                      ? 'bg-green-500 text-white'
                      : 'bg-yellow-400 text-yellow-900'
                  }`}>
                    {stay.is_listed ? '● Listed' : '○ Unlisted'}
                  </div>

                  {/* Sponsored badge */}
                  {stay.is_sponsored && (
                    <div className="absolute top-3 right-3 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                      ⭐ Featured
                    </div>
                  )}

                  {/* Hover actions overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    
                    <button
                      onClick={() => handleEdit(stay)}
                      title="Edit"
                      className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(stay.id)}
                      title="Delete"
                      className="h-9 w-9 rounded-full bg-red-500/80 backdrop-blur-sm border border-red-400/30 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Property code */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-gray-400 tracking-wider">{stay.property_code}</span>
                    <span className="text-[10px] font-semibold uppercase capitalize text-[#09b4d6] bg-[#09b4d6]/10 px-2 py-0.5 rounded-full">
                      {stay.property_type}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug line-clamp-1 mb-1">
                    {stay.title}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {stay.city}, {stay.state}
                  </div>

                  {/* Specs row */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5 text-[#09b4d6]" />{stay.bedrooms} bed</span>
                    <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5 text-[#09b4d6]" />{stay.bathrooms} bath</span>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                    {/* Broker chip */}
                    

                    {/* Price */}
                    <div className="text-right">
                      <span className="font-extrabold text-gray-900 dark:text-white text-base">
                        ₹{Number(stay.price).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-gray-400 ml-1">/night</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── LIST / TABLE VIEW ──────────────────────────── */}
      {!loading && filtered.length > 0 && displayMode === 'table' && (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm bg-white dark:bg-gray-900 overflow-x-auto">
          <div className="min-w-[800px]">
          {/* Table header */}
          <div className="grid grid-cols-[64px_1fr_160px_120px_100px_100px] gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <span>Photo</span>
            <span>Property</span>
            <span>Broker</span>
            <span>Status</span>
            <span className="text-right">Price</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {filtered.map((stay) => {
              const primaryImg = stay.images?.find(i => i.is_primary) ?? stay.images?.[0];
              return (
                <div
                  key={stay.id}
                  className="grid grid-cols-[64px_1fr_160px_120px_100px_100px] gap-4 px-5 py-4 items-center hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors"
                >
                  {/* Thumb */}
                  <div>
                    {primaryImg ? (
                      <img
                        src={primaryImg.image_url}
                        alt={stay.title}
                        className="h-12 w-14 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="h-12 w-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                        <Building2 className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{stay.title}</span>
                      {stay.is_sponsored && (
                        <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full shrink-0">FEATURED</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="font-mono text-gray-400">{stay.property_code}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{stay.city}</span>
                      <span>•</span>
                      <span className="capitalize">{stay.property_type}</span>
                    </div>
                  </div>

                  {/* Broker */}
                  <div>
                    
                  </div>

                  {/* Status */}
                  <div>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      stay.is_listed
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {stay.is_listed ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {stay.is_listed ? 'Listed' : 'Unlisted'}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                      ₹{Number(stay.price).toLocaleString('en-IN')}
                    </span>
                    <div className="text-[10px] text-gray-400">/night</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    
                    <button
                      onClick={() => handleEdit(stay)}
                      title="Edit"
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-[#09b4d6] hover:bg-[#09b4d6]/10 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(stay.id)}
                      title="Delete"
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(isOpen) => !isOpen && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useCallback } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2, UploadCloud, X } from 'lucide-react';
import { stayService } from '@/services/stay.service';
import type { Stay } from '@/types/api.types';

const editFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  description: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip_code: z.string().min(4, 'ZIP code is required'),
  property_type: z.enum(['apartment', 'house', 'villa', 'condo', 'room']),
  bedrooms: z.coerce.number().min(1),
  bathrooms: z.coerce.number().min(1),
  price: z.coerce.number().min(100),
});


interface EditStayFormProps {
  stay: Stay;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditStayForm({ stay, onSuccess, onCancel }: EditStayFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  // Track existing images from the DB (shown until replaced)
  const [existingImages, setExistingImages] = useState(stay.images || []);

  const form = useForm<any>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      title: stay.title,
      description: stay.description || '',
      address: stay.address,
      city: stay.city,
      state: stay.state,
      zip_code: stay.zip_code,
      property_type: stay.property_type,
      bedrooms: stay.bedrooms,
      bathrooms: stay.bathrooms,
      price: Number(stay.price),
    },
  });

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const combined = [...selectedFiles, ...files].slice(0, 10);
    setSelectedFiles(combined);
    const newPreviews = combined.map(f => URL.createObjectURL(f));
    setPreviews(prev => { prev.forEach(URL.revokeObjectURL); return newPreviews; });
    // Hide existing images once user picks new ones (they'll be replaced)
    setExistingImages([]);
    e.target.value = '';
  }, [selectedFiles]);

  const removeNewImage = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    const newFiles = selectedFiles.filter((_, i) => i !== idx);
    const newPreviews = previews.filter((_, i) => i !== idx);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    if (newFiles.length === 0) setExistingImages(stay.images || []);
  };

  async function onSubmit(data: any) {
    setIsSubmitting(true);
    setServerError(null);
    try {
      await stayService.updateStay(stay.id, data, selectedFiles);
      onSuccess?.();
    } catch (error: any) {
      setServerError(error.response?.data?.error || 'An error occurred while updating the property.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <FormField control={form.control as any} name="title" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Property Title</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control as any} name="description" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control as any} name="address" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Street Address</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control as any} name="city" render={({ field }) => (
              <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control as any} name="state" render={({ field }) => (
              <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control as any} name="zip_code" render={({ field }) => (
              <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control as any} name="property_type" render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="room">Private Room</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control as any} name="bedrooms" render={({ field }) => (
              <FormItem><FormLabel>Bedrooms</FormLabel><FormControl><Input type="number" min={1} {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control as any} name="bathrooms" render={({ field }) => (
              <FormItem><FormLabel>Bathrooms</FormLabel><FormControl><Input type="number" min={1} {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control as any} name="price" render={({ field }) => (
              <FormItem><FormLabel>Base Price (₹ per night)</FormLabel><FormControl><Input type="number" min={100} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>

          {/* ── Image Section ──────────────────────────────── */}
          <div className="space-y-3">
            <label className="text-sm font-medium leading-none">
              Property Photos{' '}
              <span className="text-muted-foreground text-xs">
                {selectedFiles.length === 0 ? '(upload new images to replace existing)' : '(new images will replace existing)'}
              </span>
            </label>

            {/* Existing images (shown when no new files selected) */}
            {existingImages.length > 0 && selectedFiles.length === 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {existingImages.map((img, idx) => (
                  <div key={img.id} className="relative rounded-lg overflow-hidden aspect-square border border-gray-200 dark:border-gray-700">
                    <img src={img.image_url} alt={`existing-${idx}`} className="w-full h-full object-cover" />
                    {img.is_primary && (
                      <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] font-bold bg-[#09b4d6] text-white py-0.5">
                        PRIMARY
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload zone */}
            <label
              htmlFor="edit-stay-images"
              className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <UploadCloud className="w-6 h-6 text-gray-400 mb-1" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click to upload new images
              </p>
              <input
                id="edit-stay-images"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {/* New previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-2">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden aspect-square border border-gray-200 dark:border-gray-700">
                    <img src={src} alt={`new-${idx}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] font-bold bg-[#09b4d6] text-white py-0.5">
                        PRIMARY
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeNewImage(idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {serverError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
              {serverError}
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className="bg-[#09b4d6] hover:bg-[#08a0bf] text-white min-w-[150px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

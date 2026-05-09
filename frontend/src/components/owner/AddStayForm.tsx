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
import { Loader2, UploadCloud, X, ImageIcon } from 'lucide-react';
import { stayService } from '@/services/stay.service';

const propertyFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  description: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip_code: z.string().min(4, 'ZIP code is required'),
  property_type: z.enum(['apartment', 'house', 'villa', 'condo', 'room']),
  bedrooms: z.coerce.number().min(1, 'At least 1 bedroom'),
  bathrooms: z.coerce.number().min(1, 'At least 1 bathroom'),
  price: z.coerce.number().min(100, 'Price must be at least ₹100'),
});


interface AddStayFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddStayForm({ onSuccess, onCancel }: AddStayFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const form = useForm<any>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: '', description: '', address: '', city: '', state: '',
      zip_code: '', property_type: 'apartment',
      bedrooms: 1, bathrooms: 1, price: 1000,
    },
  });

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const combined = [...selectedFiles, ...files].slice(0, 10);
    setSelectedFiles(combined);

    const newPreviews = combined.map(f => URL.createObjectURL(f));
    setPreviews(prev => { prev.forEach(URL.revokeObjectURL); return newPreviews; });
    e.target.value = '';
  }, [selectedFiles]);

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    setSelectedFiles(f => f.filter((_, i) => i !== idx));
    setPreviews(p => p.filter((_, i) => i !== idx));
  };

  async function onSubmit(data: any) {
    setIsSubmitting(true);
    setServerError(null);
    try {
      await stayService.createStay(data, selectedFiles);
      onSuccess?.();
    } catch (error: any) {
      setServerError(error.response?.data?.error || 'An error occurred while saving the property.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Title */}
            <FormField control={form.control as any} name="title" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Property Title</FormLabel>
                <FormControl><Input placeholder="e.g. Beautiful Sea-facing Villa" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Description */}
            <FormField control={form.control as any} name="description" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe the unique features of your property..." className="min-h-[100px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Address */}
            <FormField control={form.control as any} name="address" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Street Address</FormLabel>
                <FormControl><Input placeholder="123 Ocean Drive" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* City */}
            <FormField control={form.control as any} name="city" render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl><Input placeholder="Mumbai" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* State */}
            <FormField control={form.control as any} name="state" render={({ field }) => (
              <FormItem>
                <FormLabel>State / Province</FormLabel>
                <FormControl><Input placeholder="Maharashtra" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* ZIP */}
            <FormField control={form.control as any} name="zip_code" render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP / Postal Code</FormLabel>
                <FormControl><Input placeholder="400001" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Property Type */}
            <FormField control={form.control as any} name="property_type" render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a property type" /></SelectTrigger>
                  </FormControl>
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

            {/* Bedrooms */}
            <FormField control={form.control as any} name="bedrooms" render={({ field }) => (
              <FormItem>
                <FormLabel>Bedrooms</FormLabel>
                <FormControl><Input type="number" min={1} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Bathrooms */}
            <FormField control={form.control as any} name="bathrooms" render={({ field }) => (
              <FormItem>
                <FormLabel>Bathrooms</FormLabel>
                <FormControl><Input type="number" min={1} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Price */}
            <FormField control={form.control as any} name="price" render={({ field }) => (
              <FormItem>
                <FormLabel>Price (₹)</FormLabel>
                <FormControl><Input type="number" min={100} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* ── Image Upload ─────────────────────────────── */}
          <div className="space-y-3">
            <label className="text-sm font-medium leading-none">
              Property Photos <span className="text-muted-foreground">(max 10)</span>
            </label>

            {/* Drop zone */}
            <label
              htmlFor="stay-images"
              className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click to upload images <span className="text-xs">(JPG, PNG, WebP — max 5 MB each)</span>
              </p>
              <input
                id="stay-images"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-2">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden aspect-square border border-gray-200 dark:border-gray-700">
                    <img src={src} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] font-bold bg-[#09b4d6] text-white py-0.5">
                        PRIMARY
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {previews.length < 10 && (
                  <label
                    htmlFor="stay-images"
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                  </label>
                )}
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
                'Create Listing'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

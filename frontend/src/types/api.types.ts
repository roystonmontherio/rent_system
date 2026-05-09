// ─── User ───────────────────────────────────────────────
export interface User {
  id: number;
  account_no: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: 'public_user' | 'owner' | 'broker';
}

// ─── Stay / Property ───────────────────────────────────
export interface StayImage {
  id: number;
  image_url: string;
  is_primary: boolean;
}

export interface Stay {
  id: number;
  property_code: string;
  listed_by_id: number;
  listed_by_name: string | null;         
  listed_by_role: 'owner' | 'broker';
  title: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: 'apartment' | 'house' | 'villa' | 'condo' | 'room';
  bedrooms: number;
  bathrooms: number;
  amenities: string[] | null;
  price: number;
  currency: string;
  is_sponsored: boolean;
  is_listed: boolean;
  rating: number | null;
  images: StayImage[];          // from stay_images JOIN
  distance?: number;            // returned by search endpoint
  deleted_at?: string | null;
}

export interface CreateStayPayload {
  title: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: 'apartment' | 'house' | 'villa' | 'condo' | 'room';
  bedrooms: number;
  bathrooms: number;
  amenities?: string[];
  price: number;
  currency?: string;
  lat?: number;
  lng?: number;
}

export interface UpdateStayPayload {
  title?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  property_type?: 'apartment' | 'house' | 'villa' | 'condo' | 'room';
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  price?: number;
  currency?: string;
}

export interface OwnerMetrics {
  totalProperties: number;
  activeBookings: number;
  totalRevenue: number;
}

// ─── Chat ───────────────────────────────────────────────
export interface Conversation {
  id: number;
  property_title: string;
  guest_first_name: string;
  guest_last_name: string;
  host_first_name: string;
  host_last_name: string;
  initiator_id: number;
  recipient_id: number;
  stay_id: number;
}

export interface Message {
  id: number;
  sender_id: number;
  message_text: string;
  is_read: boolean;
  created_at: string;
  first_name: string;
  last_name: string;
}

// ─── Generic API envelope ───────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  error?: string;
  [key: string]: T | boolean | string | undefined;
}

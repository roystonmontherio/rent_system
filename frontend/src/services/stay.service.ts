import api from './api';
import type { Stay, UpdateStayPayload, OwnerMetrics } from '@/types/api.types';

export const stayService = {
  /** Public — list all listed properties (no location required) */
  async getAllStays(): Promise<Stay[]> {
    const res = await api.get<{ success: boolean; properties: Stay[] }>('/stays');
    return res.data.properties;
  },

  /** Public — search properties near a coordinate (PostGIS) */
  async searchNearby(lat: number, lng: number, radius: number) {
    const res = await api.get<{ success: boolean; properties: Stay[] }>(
      '/stays/search',
      { params: { lat, lng, radius } }
    );
    return res.data.properties;
  },

  /** Protected — get the current user's own stays (owner or broker) */
  async getMyStays() {
    const res = await api.get<{ success: boolean; stays: Stay[] }>('/stays/mine');
    return res.data.stays;
  },

  /** Public — get a single stay by ID */
  async getStayById(id: number) {
    const res = await api.get<{ success: boolean; stay: Stay }>(`/stays/${id}`);
    return res.data.stay;
  },

  /** Protected — dashboard metrics for owner/broker */
  async getMetrics() {
    const res = await api.get<{ success: boolean; metrics: OwnerMetrics }>('/stays/metrics');
    return res.data.metrics;
  },

  /**
   * Protected (owner/broker) — create a new stay with optional images.
   * Sends multipart/form-data so files can be included.
   */
  async createStay(data: Record<string, any>, images: File[] = []) {
    const formData = new FormData();

    // Append all text/number fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    // Append image files under the key 'images'
    images.forEach((file) => formData.append('images', file));

    const res = await api.post<{ success: boolean; stay: Stay }>('/stays', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.stay;
  },

  /**
   * Protected (owner) — update an existing stay with optional new images.
   * If images are provided, they replace all previous images.
   */
  async updateStay(id: number, data: UpdateStayPayload, images: File[] = []) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    images.forEach((file) => formData.append('images', file));

    const res = await api.put<{ success: boolean; stay: Stay }>(`/stays/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.stay;
  },

  /** Protected (owner) — soft-delete a stay */
  async deleteStay(id: number) {
    const res = await api.delete<{ success: boolean; message: string }>(`/stays/${id}`);
    return res.data;
  },
};

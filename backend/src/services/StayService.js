const StayModel = require('../models/Stay.model');
const StayImageModel = require('../models/StayImage.model');
const pool = require('../config/db');
const { generateNextReference } = require('../utils/generateReference');

const StayService = {
  async createStay(userId, role, data, imageUrls = []) {
    const listed_by_id = userId; // Owner or Broker is the lister

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const property_code = await generateNextReference('STY', client);
      const stayData = { ...data, property_code, listed_by_id };
      const newStay = await StayModel.createStay(stayData, client);

      // Insert images if provided
      if (imageUrls.length > 0) {
        await StayImageModel.insertImages(newStay.id, imageUrls, client);
      }

      await client.query('COMMIT');
      return newStay;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async updateStay(stayId, userId, data, imageUrls = []) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const updatedStay = await StayModel.updateStay(stayId, userId, data);
      if (!updatedStay) {
        throw new Error('Stay not found or you do not have permission to edit it.');
      }

      // Replace images only if new ones were uploaded
      if (imageUrls.length > 0) {
        await StayImageModel.deleteByStayId(stayId, client);
        await StayImageModel.insertImages(stayId, imageUrls, client);
      }

      await client.query('COMMIT');
      return updatedStay;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async searchNearby(lat, lng, radius) {
    if (!lat || !lng || !radius) {
      throw new Error('Latitude, longitude, and radius are required for search.');
    }
    return await StayModel.searchNearby(lat, lng, radius);
  },

  async getAllStays() {
    return await StayModel.findAll();
  },

  async deleteStay(stayId, userId) {
    const deletedStay = await StayModel.softDelete(stayId, userId);
    if (!deletedStay) {
      throw new Error('Stay not found or you do not have permission to delete it.');
    }
    return deletedStay;
  },

  async getMyStays(userId, role) {
    if (role === 'owner' || role === 'broker') {
      return await StayModel.findByLister(userId);
    }
    throw new Error('Unauthorized role for listing stays.');
  },

  async getStayById(id) {
    const stay = await StayModel.findById(id);
    if (!stay) {
      throw new Error('Stay not found.');
    }
    return stay;
  },

  async getMetrics(userId, role) {
    if (role === 'owner' || role === 'broker') {
      return await StayModel.getListerMetrics(userId);
    }
    throw new Error('Unauthorized role for viewing metrics.');
  }
};

module.exports = StayService;

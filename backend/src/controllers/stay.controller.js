const StayService = require('../services/StayService');
const path = require('path');

// Build public-facing URLs from multer file objects
const buildImageUrls = (files, req) => {
  if (!files || files.length === 0) return [];
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return files.map(f => `${baseUrl}/uploads/stays/${f.filename}`);
};

const StayController = {
  async createStay(req, res, next) {
    try {
      // multer puts text fields in req.body, files in req.files
      const imageUrls = buildImageUrls(req.files, req);
      const stay = await StayService.createStay(req.user.id, req.user.role, req.body, imageUrls);
      res.status(201).json({ success: true, stay });
    } catch (error) {
      next(error);
    }
  },

  async updateStay(req, res, next) {
    try {
      const stayId = req.params.id;
      const imageUrls = buildImageUrls(req.files, req);
      const stay = await StayService.updateStay(stayId, req.user.id, req.body, imageUrls);
      res.status(200).json({ success: true, stay });
    } catch (error) {
      if (error.message.includes('not found or you do not have permission')) {
        return res.status(403).json({ error: error.message });
      }
      next(error);
    }
  },

  async getAllStays(req, res, next) {
    try {
      const properties = await StayService.getAllStays();
      res.status(200).json({ success: true, properties });
    } catch (error) {
      next(error);
    }
  },

  async searchNearby(req, res, next) {
    try {
      const { lat, lng, radius } = req.query;
      const properties = await StayService.searchNearby(
        parseFloat(lat), 
        parseFloat(lng), 
        parseFloat(radius)
      );
      res.status(200).json({ success: true, properties });
    } catch (error) {
      if (error.message.includes('are required')) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  },

  async deleteStay(req, res, next) {
    try {
      const stayId = req.params.id;
      await StayService.deleteStay(stayId, req.user.id);
      res.status(200).json({ success: true, message: 'Stay deleted successfully' });
    } catch (error) {
      if (error.message.includes('not found or you do not have permission')) {
        return res.status(403).json({ error: error.message });
      }
      next(error);
    }
  },

  async getMyStays(req, res, next) {
    try {
      const stays = await StayService.getMyStays(req.user.id, req.user.role);
      res.status(200).json({ success: true, stays });
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      next(error);
    }
  },

  async getStayById(req, res, next) {
    try {
      const stay = await StayService.getStayById(req.params.id);
      res.status(200).json({ success: true, stay });
    } catch (error) {
      if (error.message === 'Stay not found.') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  },

  async getMetrics(req, res, next) {
    try {
      const metrics = await StayService.getMetrics(req.user.id, req.user.role);
      res.status(200).json({ success: true, metrics });
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      next(error);
    }
  }
};

module.exports = StayController;

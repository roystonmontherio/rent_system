const pool = require('../config/db');

const StayImageModel = {
  /**
   * Bulk-insert image URLs for a stay.
   * The first image is automatically marked as primary.
   */
  async insertImages(stayId, imageUrls, client = pool) {
    if (!imageUrls || imageUrls.length === 0) return [];

    const values = imageUrls.map((url, idx) => `($1, '${url}', ${idx === 0})`).join(', ');
    const query = `
      INSERT INTO stay_images (stay_id, image_url, is_primary)
      VALUES ${values}
      RETURNING *;
    `;
    const { rows } = await client.query(query, [stayId]);
    return rows;
  },

  /**
   * Fetch all images for a given stay, primary first.
   */
  async findByStayId(stayId) {
    const query = `
      SELECT id, stay_id, image_url, is_primary, uploaded_at
      FROM stay_images
      WHERE stay_id = $1
      ORDER BY is_primary DESC, uploaded_at ASC;
    `;
    const { rows } = await pool.query(query, [stayId]);
    return rows;
  },

  /**
   * Delete all images for a stay (used before replacing on edit).
   */
  async deleteByStayId(stayId, client = pool) {
    await client.query('DELETE FROM stay_images WHERE stay_id = $1', [stayId]);
  },
};

module.exports = StayImageModel;

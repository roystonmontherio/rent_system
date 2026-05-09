const pool = require('../config/db');

const StayModel = {
  async createStay(stayData, client = pool) {
    const { 
      property_code, listed_by_id, title, description, address, city, state, 
      zip_code, lat, lng, property_type, bedrooms, bathrooms, 
      amenities, price, currency 
    } = stayData;

    const query = `
      INSERT INTO stays (
        property_code, listed_by_id, title, description, address, city, state, 
        zip_code, location, property_type, bedrooms, bathrooms, 
        amenities, price, currency
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, ST_SetSRID(ST_MakePoint($9, $10), 4326), 
        $11, $12, $13, $14, $15, $16
      )
      RETURNING id, property_code, title, city, price;
    `;
    const values = [
      property_code, listed_by_id, title, description, address, city, state,
      zip_code, lng ?? null, lat ?? null, property_type, bedrooms, bathrooms,
      amenities, price, currency || 'INR'
    ];

    const { rows } = await client.query(query, values);
    return rows[0];
  },

  async updateStay(stayId, userId, data) {
    const {
      title, description, address, city, state, zip_code,
      property_type, bedrooms, bathrooms,
      amenities, price, currency
    } = data;

    const query = `
      UPDATE stays SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        address = COALESCE($3, address),
        city = COALESCE($4, city),
        state = COALESCE($5, state),
        zip_code = COALESCE($6, zip_code),
        property_type = COALESCE($7, property_type),
        bedrooms = COALESCE($8, bedrooms),
        bathrooms = COALESCE($9, bathrooms),
        amenities = COALESCE($10, amenities),
        price = COALESCE($11, price),
        currency = COALESCE($12, currency),
        updated_at = NOW()
      WHERE id = $13 AND listed_by_id = $14 AND deleted_at IS NULL
      RETURNING id, property_code, title, description, address, city, state, zip_code,
                property_type, bedrooms, bathrooms, amenities,
                price, currency, is_listed, is_sponsored, rating;
    `;
    const values = [
      title, description, address, city, state, zip_code,
      property_type, bedrooms, bathrooms,
      amenities, price, currency,
      stayId, userId
    ];

    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  },

  async searchNearby(lat, lng, radiusMeters) {
    const query = `
      SELECT 
        s.id, s.property_code, s.title, s.description, s.address, s.city, s.state,
        s.property_type, s.bedrooms, s.bathrooms,
        s.price, s.currency, s.is_sponsored, s.rating,
        ST_Distance(s.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)) AS distance,
        COALESCE(
          json_agg(json_build_object('id', si.id, 'image_url', si.image_url, 'is_primary', si.is_primary))
          FILTER (WHERE si.id IS NOT NULL), '[]'
        ) AS images
      FROM stays s
      LEFT JOIN stay_images si ON si.stay_id = s.id
      WHERE ST_DWithin(s.location, ST_SetSRID(ST_MakePoint($1, $2), 4326), $3)
        AND s.is_listed = TRUE
        AND s.deleted_at IS NULL
      GROUP BY s.id
      ORDER BY s.is_sponsored DESC, distance ASC;
    `;
    const { rows } = await pool.query(query, [lng, lat, radiusMeters]);
    return rows;
  },

  async findAll() {
    const query = `
      SELECT s.id, s.property_code, s.title, s.description, s.address,
             s.city, s.state, s.zip_code, s.property_type, s.bedrooms,
             s.bathrooms, s.amenities, s.price,
             s.currency, s.is_sponsored, s.is_listed, s.rating, s.listed_by_id,
             u.role AS listed_by_role,
             TRIM(u.first_name || ' ' || u.last_name) AS listed_by_name,
             COALESCE(
               json_agg(json_build_object('id', si.id, 'image_url', si.image_url, 'is_primary', si.is_primary))
               FILTER (WHERE si.id IS NOT NULL), '[]'
             ) AS images
      FROM stays s
      LEFT JOIN users u ON u.id = s.listed_by_id AND u.deleted_at IS NULL
      LEFT JOIN stay_images si ON si.stay_id = s.id
      WHERE s.deleted_at IS NULL
      GROUP BY s.id, u.id, u.first_name, u.last_name, u.role
      ORDER BY s.is_sponsored DESC, s.created_at DESC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  async softDelete(id, userId) {
    const query = `
      UPDATE stays 
      SET deleted_at = NOW() 
      WHERE id = $1 AND listed_by_id = $2 AND deleted_at IS NULL
      RETURNING id;
    `;
    const { rows } = await pool.query(query, [id, userId]);
    return rows[0];
  },

  async findByLister(listerId) {
    const query = `
      SELECT s.id, s.property_code, s.title, s.description, s.address, s.city, s.state, s.zip_code,
             s.property_type, s.bedrooms, s.bathrooms, s.amenities,
             s.price, s.currency, s.is_sponsored, s.is_listed, s.rating,
             s.listed_by_id,
             u.role AS listed_by_role,
             TRIM(u.first_name || ' ' || u.last_name) AS listed_by_name,
             COALESCE(
               json_agg(json_build_object('id', si.id, 'image_url', si.image_url, 'is_primary', si.is_primary))
               FILTER (WHERE si.id IS NOT NULL), '[]'
             ) AS images
      FROM stays s
      LEFT JOIN users u ON u.id = s.listed_by_id AND u.deleted_at IS NULL
      LEFT JOIN stay_images si ON si.stay_id = s.id
      WHERE s.listed_by_id = $1 AND s.deleted_at IS NULL
      GROUP BY s.id, u.id, u.first_name, u.last_name, u.role
      ORDER BY s.created_at DESC;
    `;
    const { rows } = await pool.query(query, [listerId]);
    return rows;
  },

  async findById(id) {
    const query = `
      SELECT s.id, s.property_code, s.listed_by_id, s.title, s.description,
             s.address, s.city, s.state, s.zip_code,
             s.property_type, s.bedrooms, s.bathrooms, s.amenities,
             s.price, s.currency, s.is_sponsored, s.is_listed, s.rating,
             u.role AS listed_by_role,
             TRIM(u.first_name || ' ' || u.last_name) AS listed_by_name,
             u.account_no AS listed_by_account_no,
             COALESCE(
               json_agg(json_build_object('id', si.id, 'image_url', si.image_url, 'is_primary', si.is_primary))
               FILTER (WHERE si.id IS NOT NULL), '[]'
             ) AS images
      FROM stays s
      LEFT JOIN users u ON u.id = s.listed_by_id AND u.deleted_at IS NULL
      LEFT JOIN stay_images si ON si.stay_id = s.id
      WHERE s.id = $1 AND s.deleted_at IS NULL
      GROUP BY s.id, u.id, u.first_name, u.last_name, u.role, u.account_no;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  async getListerMetrics(listerId) {
    const propsQuery = `SELECT COUNT(*)::int as total FROM stays WHERE listed_by_id = $1 AND deleted_at IS NULL`;
    const [props] = await Promise.all([
      pool.query(propsQuery, [listerId]),
    ]);

    return {
      totalProperties: props.rows[0].total,
      activeLeads: 0, 
      totalRevenue: 0, 
    };
  }
};

module.exports = StayModel;

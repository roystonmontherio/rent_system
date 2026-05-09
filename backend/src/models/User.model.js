const pool = require('../config/db');

const UserModel = {
  async createUser(userData, client = pool) {
    console.log("UserModel.createUser");
    console.log(userData);

    const { account_no, email, password_hash, first_name, last_name, phone, role } = userData;
    const query = `
      INSERT INTO users (account_no, email, password_hash, first_name, last_name, phone, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, account_no, email, first_name, last_name, role;
    `;
    const values = [account_no, email, password_hash, first_name, last_name, phone, role];
    const { rows } = await client.query(query, values);
    return rows[0];
  },

  async createOwnerProfile(userId, business_name, client = pool) {
    const query = `
      INSERT INTO owner_profiles (user_id, business_name)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const { rows } = await client.query(query, [userId, business_name]);
    return rows[0];
  },

  async createBrokerProfile(userId, agency_name, client = pool) {
    const query = `
      INSERT INTO broker_profiles (user_id, agency_name)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const { rows } = await client.query(query, [userId, agency_name]);
    return rows[0];
  },

  async findByEmail(email) {
    const query = `SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL`;
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  },

  async findById(id) {
    const query = `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
};

module.exports = UserModel;

const pool = require('../config/db');

/**
 * Generates the next custom sequence reference.
 * @param {string} categoryCode The category code (e.g., 'USR', 'STY', 'BKG')
 * @param {object} client Optional pg client for transaction support
 * @returns {Promise<string>} The formatted reference (e.g., 'U00001')
 */
async function generateNextReference(categoryCode, client = pool) {
  const query = `
    UPDATE numset 
    SET num = num + 1 
    WHERE cat = $1 
    RETURNING prx, num - 1 AS used_num, padding;
  `;
  const { rows } = await client.query(query, [categoryCode]);
  
  if (rows.length === 0) {
    throw new Error(`Category code ${categoryCode} not found in numset.`);
  }

  const { prx, used_num, padding } = rows[0];
  const paddedNum = String(used_num).padStart(padding, '0');
  return `${prx}${paddedNum}`;
}

module.exports = { generateNextReference };

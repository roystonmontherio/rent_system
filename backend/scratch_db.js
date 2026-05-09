const pool = require('./src/config/db');

async function test() {
  try {
    const { rows } = await pool.query('SELECT email, role FROM users LIMIT 5');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
test();

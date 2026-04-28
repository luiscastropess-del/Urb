const { Client } = require('pg');
const str = process.env.DATABASE_URL;
const url = str.includes('requirepostgresql') ? str.replace('requirepostgresql', 'require\npostgresql').split('\n')[0] : str;
const client = new Client({ connectionString: url });
client.connect().then(async () => {
  try {
    await client.query('ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS "last_updated" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;');
    console.log("Added column last_updated");
  } catch(e) {
    console.error(e);
  } finally {
    client.end();
  }
});

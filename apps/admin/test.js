const { Client } = require('pg');
const str = process.env.DATABASE_URL;
const url = str.includes('requirepostgresql') ? str.replace('requirepostgresql', 'require\npostgresql').split('\n')[0] : str;
const client = new Client({ connectionString: url });
client.connect().then(async () => {
  try {
    const res1 = await client.query('SELECT osm_id FROM "Place" WHERE osm_id IS NOT NULL');
    console.log("Place duplicates count before:", res1.rows.length);
    await client.query('UPDATE "Place" SET osm_id = NULL');
    console.log("Cleared osm_id in Place");

    // Fix Subscription guideId uniqueness
    // Let's just delete subscriptions if they duplicate guideId, or set guideId to random
    const res2 = await client.query(`
      DELETE FROM "Subscription" a USING "Subscription" b
      WHERE a.id < b.id AND a."guideId" = b."guideId"
    `);
    console.log("Cleared duplicate Subscriptions", res2.rowCount);

  } catch(e) {
    console.error(e);
  } finally {
    client.end();
  }
});

const { Client } = require('pg');
const str = process.env.DATABASE_URL;
const url = str.includes('requirepostgresql') ? str.replace('requirepostgresql', 'require\npostgresql').split('\n')[0] : str;
const client = new Client({ connectionString: url });
client.connect().then(() => {
  return client.query('SELECT column_name FROM information_schema.columns WHERE table_name = $1', ['Place']);
}).then(res => {
  console.log("Columns:", res.rows.map(r => r.column_name).join(', '));
  client.end();
}).catch(e => {
  console.error(e);
});

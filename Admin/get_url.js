const { Client } = require('pg');
const str = process.env.DATABASE_URL;
const url = str.includes('requirepostgresql') ? str.replace('requirepostgresql', 'require\npostgresql').split('\n')[0] : str;
// Export fixed url so we can run prisma with it
console.log(url);

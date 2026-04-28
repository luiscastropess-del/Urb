const { execSync } = require('child_process');
const str = process.env.DATABASE_URL;
const url = str.includes('requirepostgresql') ? str.replace('requirepostgresql', 'require\npostgresql').split('\n')[0] : str;
console.log("Running prisma with actual URL...");
execSync('npx prisma db push --accept-data-loss', {
  env: { ...process.env, DATABASE_URL: url },
  stdio: 'inherit'
});
console.log("Running generate...");
execSync('npx prisma generate', {
  env: { ...process.env, DATABASE_URL: url },
  stdio: 'inherit'
});

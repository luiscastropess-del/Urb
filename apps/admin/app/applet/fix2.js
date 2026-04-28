const { execSync } = require('child_process');
const str = process.env.DATABASE_URL;
if (!str) {
  console.error('DATABASE_URL is missing');
  process.exit(1);
}
// Fix mangled URL if necessary
const url = str.includes('requirepostgresql') ? str.replace('requirepostgresql', 'require\npostgresql').split('\n')[0] : str;

console.log('Using database URL (redacted):', url.substring(0, 40) + '...');

async function run() {
  try {
    console.log('Syncing database...');
    execSync('npx prisma db push --accept-data-loss', {
      env: { ...process.env, DATABASE_URL: url },
      stdio: 'inherit',
      cwd: '../..' // run in /
    });
    console.log('Generating client...');
    execSync('npx prisma generate', {
      env: { ...process.env, DATABASE_URL: url },
      stdio: 'inherit',
      cwd: '../..'
    });
    console.log('Done!');
  } catch (e) {
    console.error('Process failed:', e.message);
    process.exit(1);
  }
}

run();

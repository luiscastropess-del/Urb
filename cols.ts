import { db } from './lib/prisma';
db.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'GuideProfile';`.then(res => console.log(res)).catch(console.error);

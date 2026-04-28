import { execSync } from "child_process";
import fs from "fs";
const sql = execSync("npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script").toString();
fs.mkdirSync("prisma/migrations/0_init", { recursive: true });
fs.writeFileSync("prisma/migrations/0_init/migration.sql", sql);
console.log("Migration created successfully.");

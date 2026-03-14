/**
 * Database migration runner.
 *
 * Usage:
 *   tsx src/db/migrate.ts           — run initial migration (database-schema.sql)
 *   tsx src/db/migrate.ts --force   — drop all and recreate
 *
 * In production, use `db:push` (drizzle-kit push) or apply the SQL manually.
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const sql = postgres(dbUrl, { max: 1 });
  const force = process.argv.includes("--force");

  try {
    // Read the SSoT DDL
    const ddlPath = resolve(__dirname, "../../../../docs/architecture/database-schema.sql");
    const ddl = await readFile(ddlPath, "utf-8");

    if (force) {
      console.log("⚠️  --force: Dropping all tables...");
      // Drop all custom types and tables
      await sql.unsafe(`
        DROP SCHEMA public CASCADE;
        CREATE SCHEMA public;
        GRANT ALL ON SCHEMA public TO PUBLIC;
      `);
      console.log("✅ Schema reset");
    }

    console.log("📦 Running initial migration...");
    await sql.unsafe(ddl);
    console.log("✅ Migration complete — all tables created");

    // Verify table count
    const result = await sql`
      SELECT count(*) as cnt
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;
    console.log(`📊 Tables in database: ${result[0].cnt}`);
  } catch (err) {
    if (err instanceof Error && err.message.includes("already exists")) {
      console.log("ℹ️  Tables already exist. Use --force to recreate.");
    } else {
      console.error("❌ Migration failed:", err);
      process.exit(1);
    }
  } finally {
    await sql.end();
  }
}

migrate();

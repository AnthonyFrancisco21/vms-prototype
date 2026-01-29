import { Client } from "pg";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    await client.connect();
    console.log("Connected to database");

    // Read the SQL file
    const sql = fs.readFileSync("fix-schema.sql", "utf8");

    // Split into individual statements and execute
    const statements = sql.split(";").filter((stmt) => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        console.log("Executing:", statement.trim().substring(0, 50) + "...");
        await client.query(statement);
      }
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.end();
  }
}

runMigration();

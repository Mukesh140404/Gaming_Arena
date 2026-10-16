import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
// Adjust this import path and table name to match your project
import { users } from "./schema/users";

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";

  if (!databaseUrl || !adminEmail || !adminPassword) {
    throw new Error(
      "DATABASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD must be set"
    );
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existing.length > 0) {
      console.log(`Admin already exists: ${adminEmail}`);
      return;
    }

    // Use the same number of salt rounds as your sign-up flow
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await db.insert(users).values({
      name: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    console.log(`Admin created: ${adminEmail}`);
  } finally {
    await pool.end();
  }
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
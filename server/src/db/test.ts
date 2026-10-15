import { db } from "./index";

async function testDb() {
  try {
    const result = await db.execute("SELECT NOW()");
    console.log("Database connected:", result);
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

testDb();

import { eq } from "drizzle-orm";
import { db } from "../server/db";
import { tournaments } from "../shared/schema";

async function run() {
  const year = 2026;

  await db.update(tournaments).set({ isActive: false, updatedAt: new Date() }).where(eq(tournaments.year, 2025));

  const existing = await db.select().from(tournaments).where(eq(tournaments.year, year)).limit(1);

  if (existing.length) {
    await db
      .update(tournaments)
      .set({
        name: "The Gambler 2026",
        isActive: true,
        courses: ["Deerhurst Golf Course", "Deerhurst Golf Course", "Muskoka Bay Golf Club"],
        location: "Muskoka, Ontario",
        startDate: new Date("2026-08-28T00:00:00-04:00"),
        endDate: new Date("2026-08-30T23:59:59-04:00"),
        updatedAt: new Date(),
      })
      .where(eq(tournaments.year, year));
  } else {
    await db.insert(tournaments).values({
      year,
      name: "The Gambler 2026",
      isActive: true,
      courses: ["Deerhurst Golf Course", "Deerhurst Golf Course", "Muskoka Bay Golf Club"],
      location: "Muskoka, Ontario",
      startDate: new Date("2026-08-28T00:00:00-04:00"),
      endDate: new Date("2026-08-30T23:59:59-04:00"),
      champions: [],
    });
  }

  console.log("2026 tournament is active and 2025 is deactivated.");
}

run()
  .catch((error) => {
    console.error("Failed to setup 2026 tournament:", error);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });

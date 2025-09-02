import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db/conn";
import { streaks, studyDays } from "@/db/schema";

// --- helpers ---
// Format a Date into "YYYY-MM-DD" in a specific timezone
function toLocalDateString(date: Date, timeZone: string): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(date); // en-CA = "YYYY-MM-DD"
}

// Given two "YYYY-MM-DD" strings, is b exactly the day before a?
function isYesterday(a: string, b: string): boolean {
  const d = new Date(a + "T00:00:00Z"); // treat as UTC midnight
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10) === b;
}

type Source = "quiz" | "flashcards";

export async function recordStudyEvent(opts: {
  userId: string;
  source: Source;
  occurredAtUtc?: Date; // default now()
}) {
  const occurredAt = opts.occurredAtUtc ?? new Date();

  await db.transaction(async (tx) => {
    // 1) Ensure streaks row exists and get tz
    let s = await tx.query.streaks.findFirst({
      where: eq(streaks.userId, opts.userId),
      columns: { userId: true, tz: true, current: true, longest: true, lastActiveDate: true },
    });

    if (!s) {
      await tx.insert(streaks).values({ userId: opts.userId, tz: "UTC" });
      s = { userId: opts.userId, tz: "UTC", current: 0, longest: 0, lastActiveDate: null };
    }

    const userTz = s.tz || "UTC";
    const localDate = toLocalDateString(occurredAt, userTz);

    // 2) Try to create the daily row (enforces once-per-day)
    const inserted = await tx
      .insert(studyDays)
      .values({
        id: crypto.randomUUID(),
        userId: opts.userId,
        activityDate: localDate as unknown as any,
        firstEventAt: occurredAt,
        source: opts.source,
      })
      .onConflictDoNothing()
      .returning({ id: studyDays.id });

    const isNewDay = inserted.length > 0;

    if (!isNewDay) {
      // merge sources if needed
      await tx.execute(sql`
        UPDATE study_days
        SET source = CASE
          WHEN source = 'quiz' AND ${opts.source} = 'flashcards' THEN 'both'
          WHEN source = 'flashcards' AND ${opts.source} = 'quiz' THEN 'both'
          ELSE source
        END,
        first_event_at = LEAST(first_event_at, ${occurredAt}::timestamptz)
        WHERE user_id = ${opts.userId}::uuid
          AND activity_date = ${localDate}::date;
      `);
    }

    // 3) If brand new study day, adjust streak counters
    if (isNewDay) {
      let nextCurrent = 1;

      if (s.lastActiveDate) {
        const lastDate = s.lastActiveDate.toString();
        if (isYesterday(localDate, lastDate)) {
          nextCurrent = (s.current ?? 0) + 1;
        } else if (localDate === lastDate) {
          nextCurrent = s.current ?? 1; // should not happen with isNewDay
        } else {
          nextCurrent = 1; // gap => reset
        }
      }

      const nextLongest = Math.max(s.longest ?? 0, nextCurrent);

      await tx
        .update(streaks)
        .set({
          current: nextCurrent,
          longest: nextLongest,
          lastActiveDate: localDate as unknown as any,
          updatedAt: new Date(),
        })
        .where(eq(streaks.userId, opts.userId));
    }
  });
}

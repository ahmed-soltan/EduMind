import { db } from "@/db/conn";
import { streaks, studyDays, tenantMembers, tenants } from "@/db/schema";
import { getUserSession } from "@/utils/get-user-session";
import { hasPermission } from "@/utils/has-permission";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { extractSubdomain } from "@/utils/extract-subdomain";
import { getTenantMember } from "@/actions/get-tenant-member";

/**
 * Format a Date into 'YYYY-MM-DD' for a given IANA timezone using Intl.
 */
function formatDateInTZ(date: Date, timeZone: string): string {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // en-CA produces YYYY-MM-DD, but to be absolutely safe use formatToParts:
  const parts = dtf.formatToParts(date);
  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  return `${year}-${month}-${day}`;
}

/**
 * Parse 'YYYY-MM-DD' into a UTC Date at midnight (UTC).
 * This makes day-difference math safe and timezone-agnostic.
 */
function dateStringToUTCDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Subtract one calendar day from a 'YYYY-MM-DD' date string.
 * Returns the previous day's 'YYYY-MM-DD' string (in the same tz context).
 */
function prevDateString(dateStr: string): string {
  const dt = dateStringToUTCDate(dateStr);
  const prev = new Date(dt.getTime() - 24 * 60 * 60 * 1000);
  // Note: caller will interpret this prev date in the same timezone when needed.
  // We return an ISO y-m-d for prev in UTC midnight; if you want tz formatting
  // you should pass prev to formatDateInTZ(prev, tz).
  // Here we return YYYY-MM-DD in UTC sense (caller will use formatDateInTZ with tz).
  const y = prev.getUTCFullYear();
  const m = String(prev.getUTCMonth() + 1).padStart(2, "0");
  const d = String(prev.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const GET = async (req: NextRequest) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subdomain = extractSubdomain(req);

  const [tenant] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.subdomain, subdomain!));

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  let tenantMember;
  try {
    tenantMember = await getTenantMember(session.user.id, tenant.id);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Not a member of tenant" },
      { status: 403 }
    );
  }

  if (!tenantMember) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) load streak row (if any) and studyDays
  let currentStreak = await db.query.streaks.findFirst({
    where: eq(streaks.tenantMemberId, tenantMember.id),
  });

  // If no streak row exists, create a default one
  if (!currentStreak) {
    const id = crypto.randomUUID();
    const now = new Date();
    await db.insert(streaks).values({
      id,
      tenantId: tenantMember.tenantId,
      tenantMemberId: tenantMember.id,
      current: 0,
      longest: 0,
      tz: "UTC", // default timezone; adjust if you store tenant-level tz elsewhere
      createdAt: now,
      updatedAt: now,
    });
    currentStreak = await db.query.streaks.findFirst({
      where: eq(streaks.id, id),
    });
  }

  // Load study days (ordered ascending by date)
  const days = await db
    .select()
    .from(studyDays)
    .where(eq(studyDays.tenantMemberId, tenantMember.id))
    .orderBy(studyDays.activityDate);

  const tz = currentStreak?.tz || "UTC";

  // Build a set of YYYY-MM-DD strings in the streak timezone
  const activityDateSet = new Set<string>();
  for (const d of days) {
    if (!d.activityDate) continue;
    // Convert timestamp to date string in tz
    const dateStr = formatDateInTZ(new Date(d.activityDate), tz);
    // Ignore future dates relative to now in tz
    const todayInTz = formatDateInTZ(new Date(), tz);
    if (dateStr > todayInTz) continue;
    activityDateSet.add(dateStr);
  }

  const todayStr = formatDateInTZ(new Date(), tz);

  // lastActiveDate: the latest date in the set, or null
  const lastActiveDateStr =
    activityDateSet.size > 0 ? Array.from(activityDateSet).sort().pop()! : null;

  // Helper: count consecutive days ending at a given dateStr (YYYY-MM-DD)
  function countConsecutiveEndingAt(startDateStr: string): number {
    let count = 0;
    let cursor = dateStringToUTCDate(startDateStr); // UTC midnight for start
    while (true) {
      const cursorDateStrInTz = formatDateInTZ(cursor, tz);
      if (!activityDateSet.has(cursorDateStrInTz)) break;
      count++;
      cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
    }
    return count;
  }

  // Compute current streak:
  let computedCurrent = 0;
  if (!lastActiveDateStr) {
    computedCurrent = 0;
  } else {
    // diff between last active and today (in days)
    const lastDt = dateStringToUTCDate(lastActiveDateStr);
    const todayDt = dateStringToUTCDate(todayStr);
    const diffDays = Math.round(
      (todayDt.getTime() - lastDt.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (diffDays === 0) {
      // last activity is today -> count ending today
      computedCurrent = countConsecutiveEndingAt(todayStr);
    } else if (diffDays === 1) {
      // last activity is yesterday -> count ending yesterday
      computedCurrent = countConsecutiveEndingAt(lastActiveDateStr);
    } else {
      // last activity older than yesterday -> streak is broken
      computedCurrent = 0;
    }
  }

  // Compute longest streak by scanning all activity dates (deduped)
  let computedLongest = currentStreak?.longest ?? 0;
  if (activityDateSet.size > 0) {
    const sortedDates = Array.from(activityDateSet).sort(); // lexicographic works for YYYY-MM-DD
    let maxRun = 0;
    let run = 0;
    let prevDateStr: string | null = null;

    for (const dateStr of sortedDates) {
      if (!prevDateStr) {
        run = 1;
      } else {
        // compute diff in days between prevDateStr and dateStr
        const prevDt = dateStringToUTCDate(prevDateStr);
        const curDt = dateStringToUTCDate(dateStr);
        const diffDays = Math.round(
          (curDt.getTime() - prevDt.getTime()) / (24 * 60 * 60 * 1000)
        );
        if (diffDays === 0) {
          // duplicate same day (shouldn't happen because set), ignore
        } else if (diffDays === 1) {
          run++;
        } else {
          if (run > maxRun) maxRun = run;
          run = 1;
        }
      }
      prevDateStr = dateStr;
    }
    if (run > maxRun) maxRun = run;
    computedLongest = Math.max(computedLongest, maxRun);
  }

  // 4) Update DB only if necessary
  const updates: Record<string, any> = {};
  if ((currentStreak?.current ?? 0) !== computedCurrent)
    updates.current = computedCurrent;
  if ((currentStreak?.longest ?? 0) !== computedLongest)
    updates.longest = computedLongest;

  const currentLastActive = currentStreak?.lastActiveDate
    ? formatDateInTZ(new Date(currentStreak.lastActiveDate), tz)
    : null;
  if (currentLastActive !== lastActiveDateStr) {
    updates.lastActiveDate = lastActiveDateStr
      ? dateStringToUTCDate(lastActiveDateStr)
      : null;
  }

  if (Object.keys(updates).length > 0) {
    updates.updatedAt = new Date();
    await db
      .update(streaks)
      .set(updates)
      .where(eq(streaks.tenantMemberId, tenantMember.id));
    currentStreak = await db.query.streaks.findFirst({
      where: eq(streaks.tenantMemberId, tenantMember.id),
    });
  }

  return NextResponse.json({
    streak: currentStreak ?? null,
    studyDays: days,
    computed: {
      computedCurrent,
      computedLongest,
      lastActiveDate: lastActiveDateStr,
      timezone: tz,
      activityCount: activityDateSet.size,
    },
  });
};

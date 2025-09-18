import { db, redis } from "@/db/conn";
import { tenantMembers, users } from "@/db/schema";
import { TenantMemberContext } from "@/db/types";
import { and, eq } from "drizzle-orm";

function ctxCacheKey(userId: string, tenantId: string) {
  return `ctx:tenantMember:${userId}:${tenantId}`;
}

/**
 * Helper: try to load tenantMember context from redis.
 * If not present, load minimal tenantMember + user from DB and cache a context.
 *
 * Behavior:
 * - If tenantIdArg is provided, use it.
 * - If tenantIdArg is not provided and user has multiple memberships, we pick the first one (you can change to require explicit tenantId).
 */
export async function getTenantMember(
  userId: string,
  tenantIdArg: string
): Promise<{
  id: string;
  tenantId: string;
  username: string;
  roleId: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}> {
  // If tenantIdArg provided, try cache first
  if (tenantIdArg) {
    const cacheKey = ctxCacheKey(userId, tenantIdArg);
    const cached = await redis.get<TenantMemberContext | null>(cacheKey);
    if (cached) {
      const username = `${cached.firstName ?? ""} ${
        cached.lastName ?? ""
      }`.trim();
      return {
        id: cached.id,
        tenantId: cached.tenantId,
        roleId: cached.roleId,
        username,
        firstName: cached.firstName,
        lastName: cached.lastName,
        email: cached.email,
      };
    }
  }

  // If no tenantIdArg or cache miss, fetch memberships
  const [tenantMember] = await db
    .select({
      id: tenantMembers.id,
      tenantId: tenantMembers.tenantId,
      roleId: tenantMembers.roleId,
      isActive: tenantMembers.isActive,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    })
    .from(tenantMembers)
    .leftJoin(users, eq(users.id, tenantMembers.userId))
    .where(
      and(
        eq(tenantMembers.userId, userId),
        eq(tenantMembers.tenantId, tenantIdArg)
      )
    );

  // Build simple cached context (we won't hydrate permissions here; keep it minimal)
  const username = `${tenantMember.firstName ?? ""} ${
    tenantMember.lastName ?? ""
  }`.trim();

  // Optionally we could build a full TenantMemberContext (permissions etc.) here.
  // For now we store minimal context to avoid repeated DB user lookups.
  const cacheKey = ctxCacheKey(userId, tenantMember.tenantId);

  // Prepare a small context object compatible with TenantMemberContext partial
  const partialCtx: Partial<TenantMemberContext> = {
    id: tenantMember.id,
    tenantId: tenantMember.tenantId,
    roleId: tenantMember.roleId!,
    isActive: !!tenantMember.isActive,
    firstName: tenantMember.firstName ?? null,
    lastName: tenantMember.lastName ?? null,
    email: tenantMember.email ?? null,
    permissions: [], // leave empty; permissions are resolved where needed
  };

  // Cache for a short time so subsequent requests hit Redis
  try {
    await redis.set(cacheKey, partialCtx, { ex: 60 * 60 });
  } catch {
    throw new Error("NOT_A_MEMBER")
  }

  return {
    id: tenantMember.id,
    tenantId: tenantMember.tenantId,
    roleId: tenantMember.roleId!,
    username,
    firstName: tenantMember.firstName ?? null,
    lastName: tenantMember.lastName ?? null,
    email: tenantMember.email ?? null,
  };
}

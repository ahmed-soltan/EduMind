import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/utils/get-user-session";
import { hasPermission } from "@/utils/has-permission";
import { getTenantMember } from "@/actions/get-tenant-member";
import { extractSubdomain } from "@/utils/extract-subdomain";
import { getTenantBySubdomain } from "@/actions/get-tenant-by-subdomain";
import { db, redis } from "@/db/conn";
import { permissions } from "@/db/schema";

export const GET = async (req: NextRequest) => {
  const session = await getUserSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subdomain = extractSubdomain(req);

  if (!subdomain) {
    return NextResponse.json({ error: "Subdomain not found" }, { status: 400 });
  }

  const tenant = await getTenantBySubdomain(subdomain);

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  try {
    const currentMember = await getTenantMember(session.user.id, tenant.id);

    // Check permission to manage settings
    const allowed = await hasPermission(currentMember.roleId, "tenant:manage");
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let permission = await redis.get("permissions");
    if (!permission) {
      permission = await db.select().from(permissions);
    }
    
    return NextResponse.json({
      permissions: permission,
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

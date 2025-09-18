import { getTenantBySubdomain } from "@/actions/get-tenant-by-subdomain";
import { getTenantMember } from "@/actions/get-tenant-member";
import { db } from "@/db/conn";
import { tenantMembers } from "@/db/schema";
import { extractSubdomain } from "@/utils/extract-subdomain";
import { getUserSession } from "@/utils/get-user-session";
import { hasPermission } from "@/utils/has-permission";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    return NextResponse.json({ hasPermission: false });
  }

  const searchParams = new URL(req.url).searchParams;
  const permission = searchParams.get("permission");

  if (!permission) {
    return NextResponse.json(
      { error: "Permission is required" },
      { status: 400 }
    );
  }

  const subdomain = extractSubdomain(req);

  if (!subdomain) {
    return NextResponse.json({ error: "Subdomain not found" }, { status: 400 });
  }

  const tenant = await getTenantBySubdomain(subdomain);

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

  // check permission (use DB-backed check)
  const allowed = await hasPermission(tenantMember.roleId!, permission);

  return NextResponse.json({ hasPermission: !!allowed });
};

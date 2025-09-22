import { NextRequest, NextResponse } from "next/server";

import { getUserSession } from "@/utils/get-user-session";
import { canCreateFeature } from "@/utils/can-create-feature";
import { extractSubdomain } from "@/utils/extract-subdomain";
import { getTenantBySubdomain } from "@/actions/get-tenant-by-subdomain";

export async function GET(req: NextRequest) {
  const session = await getUserSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ canCreate: false }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const feature = searchParams.get("feature");

  if (!feature) {
    return NextResponse.json({ error: "Missing feature" }, { status: 400 });
  }

  const subdomain = extractSubdomain(req);

  if (!subdomain) {
    return NextResponse.json({ error: "Subdomain not found" }, { status: 400 });
  }

  const tenant = await getTenantBySubdomain(subdomain);

  if (!tenant) {
    return NextResponse.json({ error: "tenant Not Found" }, { status: 404 });
  }

  const canCreate = await canCreateFeature(tenant.id, feature);
  return NextResponse.json(canCreate);
}

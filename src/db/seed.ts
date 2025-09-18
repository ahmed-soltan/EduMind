import crypto from "crypto";
import { db } from "@/db/conn";
import { permissions, rolePermission } from "@/db/schema";

async function seedPermissions() {
  console.log("🌱 Seeding permissions...");

  const ownerRoleId = "b38c61b2-0142-4266-bb1d-20f4d26d83b6";
  const adminRoleId = "1f6ffe63-bec8-4ce2-bd95-a7729480ce5f";
  const memberRoleId = "b846fe13-e214-492a-823c-1ff32d2c523e";

  // Fixed set of permissions
  const permissionList = [
    { name: "quiz:create", description: "Create quizzes" },
    { name: "deck:create", description: "Create decks" },
    { name: "flashcard:create", description: "Create flashcards" },
    { name: "document:upload", description: "Upload documents" },
    { name: "streak:view", description: "View and use streaks" },
    { name: "statistics:view", description: "View usage statistics" },
    { name: "activity:view_all", description: "View all members' activities" },
    { name: "members:manage", description: "Invite, remove, and manage members" },
    { name: "tenant:manage", description: "Manage tenant settings" },
    { name: "tenant:delete", description: "Delete tenant" },
  ];

  // Insert permissions
  const inserted = await db
    .insert(permissions)
    .values(
      permissionList.map((perm) => ({
        id: crypto.randomUUID(),
        name: perm.name,
        description: perm.description,
        createdAt: new Date(),
      }))
    )
    .returning();

  const permMap = Object.fromEntries(inserted.map((p) => [p.name, p.id]));

  // Assign permissions to roles
  const rolePerms: { roleId: string; permissionId: string }[] = [];

  // Member (basic)
  ["quiz:create", "deck:create", "flashcard:create", "document:upload", "streak:view"].forEach(
    (name) => {
      rolePerms.push({ roleId: memberRoleId, permissionId: permMap[name] });
    }
  );

  // Admin (everything except tenant delete)
  [
    "quiz:create",
    "deck:create",
    "flashcard:create",
    "document:upload",
    "streak:view",
    "statistics:view",
    "activity:view_all",
    "members:manage",
    "tenant:manage",
  ].forEach((name) => {
    rolePerms.push({ roleId: adminRoleId, permissionId: permMap[name] });
  });

  // Owner (all)
  Object.keys(permMap).forEach((name) => {
    rolePerms.push({ roleId: ownerRoleId, permissionId: permMap[name] });
  });

  await db.insert(rolePermission).values(
    rolePerms.map((rp) => ({
      id: crypto.randomUUID(),
      roleId: rp.roleId,
      permissionId: rp.permissionId,
      createdAt: new Date(),
    }))
  );

  console.log("✅ Permissions seeded successfully!");
}

seedPermissions().catch((err) => {
  console.error("❌ Error seeding permissions:", err);
  process.exit(1);
});

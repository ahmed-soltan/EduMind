import { getUserById } from "@/actions/get-user-by-id";
import { getUserSession } from "@/utils/get-user-session";
import { redirect } from "next/navigation";

export const WelcomeSection = async () => {
  const session = await getUserSession();

  if (!session.isAuthenticated) {
    redirect("/auth/login");
  }

  const user = await getUserById(session.user.id);
  return (
    <div className="p-6 ">
      <h1 className="text-3xl font-medium inline">
        Welcome back, <span className="font-bold">{user?.firstName}</span>👋
      </h1>
      <p className="text-neutral-500">
        Ready to continue your learning journey?
      </p>
    </div>
  );
};

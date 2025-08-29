import { getUserSession } from "@/utils/get-user-session";

export const WelcomeSection = async () => {
  const session = await getUserSession(); // NextResponse
  const user = session.user;

  return (
    <div className="p-6 ">
      <h1 className="text-3xl font-medium flex items-center gap-1">
        Welcome back, <span className="font-bold">{user.firstName}</span>👋
      </h1>
      <p className="text-neutral-500">
        Ready to continue your learning journey?
      </p>
    </div>
  );
};

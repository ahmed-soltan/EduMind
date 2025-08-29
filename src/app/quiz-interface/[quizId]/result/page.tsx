import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import QuizResult from "./quiz-result";

import { getUserSession } from "@/utils/get-user-session";
import { getUserSubdomain } from "@/actions/get-user-subdomain";

const QuizResultPage = async ({ params }: { params: Promise<{ quizId: string }> }) => {
  const { quizId } = await params;

  const cookieStore = await cookies();

  const [session, subdomain, response] = await Promise.all([
    getUserSession(),
    getUserSubdomain(),
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/quizzes/${quizId}/quiz-attempts`,
      {
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "force-cache"
      }
    ),
  ]);

  if (!session.isAuthenticated || !subdomain) {
    redirect(`/auth/login?callback=/quiz-interface/${quizId}`);
  }

  const { attempt } = await response.json();

  return <QuizResult quizAttempt={attempt} subdomain={subdomain} />;
};

export default QuizResultPage;

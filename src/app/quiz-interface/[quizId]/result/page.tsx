import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import QuizResult from "./quiz-result";

import { getUserSession } from "@/utils/get-user-session";

const QuizResultPage = async ({ params }: { params: Promise<{ quizId: string }> }) => {
  const { quizId } = await params;

  const cookieStore = await cookies();

  const [session, response] = await Promise.all([
    getUserSession(),
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/${quizId}/quiz-attempts`,
      {
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "force-cache"
      }
    ),
  ]);

  if (!session.isAuthenticated) {
    redirect(`/auth/login`);
  }

  const { attempt } = await response.json();

  return <QuizResult quizAttempt={attempt}/>;
};

export default QuizResultPage;

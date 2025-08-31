import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { QuizContextProvider } from "@/features/quiz-interface/components/quiz-context-provider";

const QuizInterface = dynamic(() =>
  import("@/features/quiz-interface/components/quiz-interface").then(
    (mod) => mod.QuizInterface
  )
);

import { getUserSession } from "@/utils/get-user-session";
import { getUserSubdomain } from "@/actions/get-user-subdomain";
import { QuizInterfaceHeader } from "@/features/quiz-interface/components/quiz-interface-header";
import { Suspense } from "react";

const QuizInterfacePage = async ({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) => {
  const session = await getUserSession();
  const { quizId } = await params;

  if (!session.isAuthenticated) {
    redirect(`/auth/login?callback=/quiz-interface/${quizId}`);
  }
  const cookieStore = await cookies();

  const [quiz, quizAttempt] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/${quizId}`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
    cache: "force-cache" 
    }).then((res) => res.json()),
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/${quizId}/quiz-attempts`,
      {
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "force-cache"
      }
    ).then((res) => res.json()),
  ]);

  const subdomain = await getUserSubdomain();

  if (!quiz || !quiz.quiz) {
    redirect(`/${subdomain}/dashboard`);
  }

  return (
    <QuizContextProvider quizId={quiz.quiz.id}>
      <div className="w-full h-full">
        <Suspense fallback={<div>Loading...</div>}>
          <QuizInterfaceHeader quiz={quiz} attempt={quizAttempt} />
        </Suspense>
        <div className="w-full max-w-[1000px] mx-auto h-full py-10">
          <Suspense fallback={<div>Loading...</div>}>
            <QuizInterface
              quiz={quiz}
              attempt={quizAttempt}
              subdomain={subdomain}
            />
          </Suspense>
        </div>
      </div>
    </QuizContextProvider>
  );
};

export default QuizInterfacePage;

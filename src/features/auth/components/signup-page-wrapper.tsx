"use client";

import dynamic from "next/dynamic";

const SignupForm = dynamic(
  () =>
    import("@/features/auth/components/signup-form").then(
      (mod) => mod.SignupForm
    ),
  { ssr: false }
);

export const SignupPageWrapper = () => {
  return <SignupForm />;
};

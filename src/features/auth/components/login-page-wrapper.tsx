"use client";

import dynamic from "next/dynamic";

const LoginForm = dynamic(
  () =>
    import("@/features/auth/components/login-form").then(
      (mod) => mod.LoginForm
    ),
  { ssr: false }
);

export const LoginPageWrapper = () => {
  return <LoginForm />;
};

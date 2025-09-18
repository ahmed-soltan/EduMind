"use client";

import { UserButton } from "@/components/user-button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { protocol } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface GetStartedButtonProps {
  children: React.ReactNode;
  [key: string]: any;
}

export const GetStartedButton = ({
  children,
  ...props
}: GetStartedButtonProps) => {
  const pathname = usePathname();
  const { data } = useCurrentUser();
  const [href, setHref] = useState(`/auth/signup?callback=${pathname}`);

  useEffect(() => {
    if (!data) return;
    setHref("/pricing");
  }, [data, pathname]);

  return (
    <UserButton href={href} {...props}>
      {children}
    </UserButton>
  );
};

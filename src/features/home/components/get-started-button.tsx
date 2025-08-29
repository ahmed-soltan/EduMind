"use client";

import { UserButton } from "@/components/user-button";
import { useCurrentUser } from "@/hooks/use-current-user";
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

    if (data.hasOnboarded) {
      // Path-based subdomain routing
      setHref(`/${data.subdomain}/dashboard`);
    } else {
      setHref("/onboarding");
    }
  }, [data, pathname]);

  return (
    <UserButton href={href} {...props}>
      {children}
    </UserButton>
  );
};

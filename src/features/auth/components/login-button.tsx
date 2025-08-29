import { UserButton } from "@/components/user-button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { usePathname } from "next/navigation";

export const LoginButton = ({...props}) => {
  const { data } = useCurrentUser();
  const pathname = usePathname();

  if (data) return;
  return <UserButton href={`/auth/login?callback=${pathname}`} {...props}>Login</UserButton>;
};

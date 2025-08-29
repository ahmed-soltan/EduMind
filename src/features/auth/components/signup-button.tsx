import { UserButton } from "@/components/user-button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { usePathname } from "next/navigation";

export const SignupButton = ({...props}) => {
  const { data } = useCurrentUser();
  const pathname = usePathname();

  if (data) return;
  return <UserButton href={`/auth/signup?callback=${pathname}`} {...props}>Sign Up</UserButton>;
};

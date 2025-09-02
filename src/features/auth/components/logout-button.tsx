import { UserButton } from "@/components/user-button";
import { useCurrentUser } from "@/hooks/use-current-user";

import { useLogout } from "../api/use-logout";

export const LogoutButton = ({ ...props }) => {
  const { data} = useCurrentUser();
  const { mutate: logout } = useLogout();

  if (!data) return null;
  return (
    <UserButton onClick={()=>logout()} {...props} href={"/"}>
      Logout
    </UserButton>
  );
};

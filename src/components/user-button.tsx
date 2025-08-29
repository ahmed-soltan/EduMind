// UserButton.tsx
import { Button } from "./ui/button";
import Link from "next/link";

interface UserButtonProps {
  href?: string;
  children: React.ReactNode;
  [key: string]: any;
}

export const UserButton = ({ href, children, ...props }: UserButtonProps) => {
  return (
    <Button {...props}>
      {href ? <Link href={href}>{children}</Link> : children}
    </Button>
  );
};

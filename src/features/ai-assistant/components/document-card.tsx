import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Document } from "@/db/types";
import { cn } from "@/lib/utils";
import {
  Ellipsis,
  SquareArrowOutUpRight,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DocumentCardProps {
  document: Document;
}

export const DocumentCard = ({ document }: DocumentCardProps) => {
  const pathname = usePathname();
  const currentDocument = pathname.split("/").slice(-1).join("/");
  const redirectUrl = pathname.split("/").slice(0, 4).join("/");
  return (
    <div
      key={document.id}
      className={cn(
        "rounded-lg hover:bg-accent px-3 pt-1 min-h-12 space-y-2 flex items-center justify-between",
        currentDocument === document.id && "bg-accent"
      )}
    >
      <Link href={`${redirectUrl}/${document.id}`}>{document.title}</Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size={"icon"}
            variant={"ghost"}
            className="hover:bg-neutral-900 cursor-pointer rounded-lg z-20"
          >
            <Ellipsis className="size-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="flex flex-col gap-2 max-w-[200px] border-0"
          side="right"
          align="start"
        >
          <Button variant={"outline"} size={"sm"}>
            <SquareArrowOutUpRight className="size-3" />
            Open
          </Button>
          <Button variant={"destructive"} size={"sm"}>
            <Trash2 className="size-3" />
            Delete
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

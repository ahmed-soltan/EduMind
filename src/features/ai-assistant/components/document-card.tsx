import { ConfirmModal } from "@/components/confirm-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Document } from "@/db/types";
import { cn, protocol, rootDomain } from "@/lib/utils";
import { Ellipsis, SquareArrowOutUpRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useDeleteDocument } from "../api/use-delete-document";

interface DocumentCardProps {
  document: Document;
}

export const DocumentCard = ({ document }: DocumentCardProps) => {
  const pathname = usePathname();
  const currentDocument = pathname.split("/").slice(-1).join("/");


  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const { mutateAsync, isPending } = useDeleteDocument();
  const router = useRouter();

  return (
    <>
      <ConfirmModal
        open={openConfirmModal}
        setOpen={setOpenConfirmModal}
        title="Are you sure you want to delete this document?"
        message="This action will remove all of your messages with ai assistant"
        callbackFn={async () => {
          await mutateAsync(document.id);
          router.back();
        }}
        isPending={isPending}
        variant={"destructive"}
      />
      <Link
        href={`/dashboard/ai-assistant/${document.id}`}
        key={document.id}
        className={cn(
          "rounded-lg hover:bg-accent px-3 pt-1 min-h-12 space-y-2 flex items-center justify-between",
          currentDocument === document.id && "bg-accent"
        )}
      >
        <h1 className="truncate">{document.title}</h1>
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
            <Button
              variant={"destructive"}
              size={"sm"}
              onClick={() => setOpenConfirmModal(true)}
            >
              <Trash2 className="size-3" />
              Delete
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>
      </Link>
    </>
  );
};

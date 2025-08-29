import Link from "next/link";
import { useState } from "react";
import { Edit2, Eye, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/confirm-modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { DeckData } from "@/db/types";
import { useDeleteDeck } from "../api/use-delete-deck";
import { IconCards } from "@tabler/icons-react";
import { useUpdateDeckModal } from "../hooks/use-update-deck-modal";

interface DeckCardProps {
  deck: DeckData;
}

export const DeckCard = ({ deck }: DeckCardProps) => {
  const [open, setOpen] = useState(false);
  const { open: openUpdateModal } = useUpdateDeckModal();
  const { mutate, isPending } = useDeleteDeck();

  return (
    <>
      <ConfirmModal
        title="Are you sure you want to delete this deck?"
        message="This action cannot be undone."
        callbackFn={() => mutate(deck.id)}
        open={open}
        setOpen={setOpen}
        variant="destructive"
      />
      <Card
        key={deck.id}
        className="bg-card border-border shadow-soft hover:shadow-elegant transition-all duration-300 group cursor-select"
      >
        <CardHeader>
          <CardTitle className="text-foreground font-heading text-2xl flex items-center justify-between">
            {deck.title}
            <span className="text-muted-foreground text-sm font-medium">
              {new Date(deck.createdAt).toLocaleDateString()}
            </span>
          </CardTitle>
          <CardDescription className="flex items-center gap-1">
            <IconCards className="size-5" /> {Number(deck.flashcardsCount)}{" "}
            Flash Cards
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">
            {deck.description}
          </p>
        </CardContent>

        <CardFooter className="pt-0 mt-auto flex items-center gap-2">
          <Button
            asChild
            variant={"outline"}
            className="flex-1"
            disabled={isPending}
          >
            <Link href={`decks/${deck.id}/flash-cards`}>
              <Eye className="w-4 h-4 mr-2" />
              View Flash Cards
            </Link>
          </Button>
          <Button
            size={"icon"}
            type="button"
            onClick={() => openUpdateModal(deck.id)}
            disabled={isPending}
          >
            <Edit2 className="size-5" />
          </Button>
          <Button
            size={"icon"}
            type="button"
            className="bg-red-500/60 hover:bg-red-500/70"
            onClick={() => setOpen(true)}
            disabled={isPending}
          >
            <Trash2 className="size-5" />
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

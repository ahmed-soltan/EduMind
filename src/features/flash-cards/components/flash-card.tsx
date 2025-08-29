import { memo, useState } from "react";
import { Edit, Pencil, Sparkles, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmModal } from "@/components/confirm-modal";

import { useDeleteFlashCard } from "../api/use-delete-flash-card";
import { useUpdateFlashCardModal } from "../hooks/use-update-flash-card-modal";

import { FlashCard as FlashCardT } from "@/db/types";

interface FlashCardProps {
  card: FlashCardT;
}

export const FlashCard = memo(({ card }: FlashCardProps) => {
  const { open } = useUpdateFlashCardModal();
  const { mutateAsync, isPending } = useDeleteFlashCard();
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const toggleCardFlip = (cardId: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const isFlipped = flippedCards.has(card.id);

  return (
    <>
      <ConfirmModal
        open={openConfirmModal}
        setOpen={setOpenConfirmModal}
        callbackFn={async () => await mutateAsync(card.id)}
        message="Are you sure you want to delete this flashcard?"
        title="Delete Flashcard"
        isPending={isPending}
        variant={"destructive"}
      />
      <Card
        key={card.id}
        className="group relative h-48 cursor-pointer transition-all duration-300 hover:shadow-lg z-10 border-neutral-500"
        onClick={() => toggleCardFlip(card.id)}
      >
        <CardContent className="p-0 h-full">
          <div className="relative h-full overflow-hidden rounded-lg">
            {/* Front Side */}
            <div
              className={`absolute inset-0 p-6 flex flex-col justify-between transition-transform duration-500 ${
                isFlipped ? "rotate-y-180" : "rotate-y-0"
              }`}
              style={{
                backfaceVisibility: "hidden",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              <div className="flex-1 flex items-center justify-center">
                <Badge
                  className="absolute top-0 left-2"
                  variant={
                    card.source === "assistant" ? "default" : "secondary"
                  }
                >
                  {card.source === "assistant" ? (
                    <Sparkles className="size-3" />
                  ) : (
                    <Pencil className="size-5" />
                  )}
                  {card.source}
                </Badge>
                <p className="text-lg font-medium text-foreground line-clamp-4 text-center">
                  {card.front}
                </p>
              </div>
            </div>

            {/* Back Side */}
            <div
              className={`absolute inset-0 p-6 flex flex-col justify-between bg-primary/5 transition-transform duration-500 ${
                isFlipped ? "rotate-y-0" : "rotate-y-180"
              }`}
              style={{
                backfaceVisibility: "hidden",
                transform: isFlipped ? "rotateY(0deg)" : "rotateY(180deg)",
              }}
            >
              <div className="flex-1 flex items-center justify-center">
                <p className="text-lg text-foreground line-clamp-4 text-center">
                  {card.back}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-0 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 z-50">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
                onClick={() => open(card.id)}
              >
                <Edit className="w-3 h-3 text-muted-foreground" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
                onClick={() => setOpenConfirmModal(true)}
              >
                <Trash2 className="w-3 h-3 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
});

import { cookies } from "next/headers";
import { BookOpen } from "lucide-react";

import { Hint } from "@/components/hint";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlashCardActionButtons } from "./flash-card-actions-button";

interface FlashCardsHeaderProps {
  deckId: string;
}

export const FlashCardsHeader = async ({ deckId }: FlashCardsHeaderProps) => {
  const cookieStore = await cookies();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/decks/${deckId}`,
    {
      headers: {
        Cookie: cookieStore.toString(),
      },
    }
  );
  const data = await res.json();

  return (
    <header className="p-5 flex items-center justify-between gap-5 flex-wrap bg-card rounded-lg">
      <div className="flex flex-col gap-2 w-full max-w-[650px]">
        <h1 className="text-2xl font-bold">{data.title}</h1>
        <p className="text-md text-muted-foreground">{data.description}</p>
        <Badge variant={"secondary"} className="mt-2">
          {data.flashcardsCount} Flash Cards
        </Badge>
      </div>
      <div className="flex flex-wrap gap-3">
        <FlashCardActionButtons />
        <Hint
          label={
            Number(data.flashcardsCount) === 0
              ? "Add Flash Cards First"
              : "Enter Study Mode"
          }
          align="center"
          side="top"
        >
          <Button
            variant="success"
            className="gap-2"
            disabled={false} // ← don't disable
          >
            <BookOpen className="w-4 h-4" />
            Enter Study Mode
          </Button>
        </Hint>
      </div>
    </header>
  );
};

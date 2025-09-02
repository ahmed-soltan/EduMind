import { FlashCardsList } from "@/features/flash-cards/components/flash-cards-list";
import { FlashCardsFilter } from "@/features/flash-cards/components/flash-cards-filter";
import { FlashCardsHeader } from "@/features/flash-cards/components/flash-cards-header";

const FlashCardsPage = async ({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) => {
  const { deckId } = await params;

  return (
    <div className="flex flex-col gap-5 p-5">
      <FlashCardsHeader deckId={deckId} />
      <FlashCardsFilter />
      <FlashCardsList deckId={deckId} />
    </div>
  );
};

export default FlashCardsPage;

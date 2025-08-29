import { useParams } from "next/navigation";

export const useDeckId = () => {
  const params = useParams();
  return params.deckId as string;
};

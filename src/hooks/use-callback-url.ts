import { useSearchParams } from "next/navigation";

export const useCallbackUrl = () => {
  const searchParams = useSearchParams();
  return searchParams.get("callback") || "/";
};

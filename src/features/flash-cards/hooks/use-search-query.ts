import { useQueryState, parseAsString } from "nuqs";

export const useFilters = () => {
  const [query, setQuery] = useQueryState("query", parseAsString.withDefault(""));
  const [sort, setSort] = useQueryState("sort", parseAsString.withDefault("asc"));
  const [source, setSource] = useQueryState("source", parseAsString.withDefault("all"));

  return {
    filters: { query, sort, source },
    setFilters: { setQuery, setSort, setSource },
  };
};
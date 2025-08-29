"use client";

import { Search, SortAsc } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilters } from "../hooks/use-search-query";

export const FlashCardsFilter = () => {
  const { filters, setFilters } = useFilters();

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilters.setQuery(value);
  };

  const handleSortChange = (value: string) => {
    setFilters.setSort(value);
  };

  const handleSourceChange = (value: string) => {
    setFilters.setSource(value);
  };

  return (
    <div className="flex flex-wrap md:flex-nowrap gap-3 bg-card p-5 rounded-lg relative">
      <Input
        type="text"
        placeholder="Search flash cards..."
        className="pl-10 py-4"
        onChange={handleSearch}
        value={filters.query ?? ""}
      />
      <Button className="absolute top-5 left-6" size={"icon"} variant={"ghost"}>
        <Search className="size-4" />
      </Button>
        <Select value={filters.sort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full md:w-[130px] py-4">
            <SortAsc className="size-4" />
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Newest</SelectItem>
            <SelectItem value="desc">Oldest</SelectItem>
          </SelectContent>
        </Select>
      <div className="flex items-center gap-2">
        <Button
          variant={filters.source === "all" ? "default" : "outline"}
          onClick={() => handleSourceChange("all")}
        >
          All
        </Button>
        <Button
          variant={filters.source === "assistant" ? "default" : "outline"}
          onClick={() => handleSourceChange("assistant")}
        >
          AI Generated
        </Button>
        <Button
          variant={filters.source === "manual" ? "default" : "outline"}
          onClick={() => handleSourceChange("manual")}
        >
          Manual
        </Button>
      </div>
    </div>
  );
};

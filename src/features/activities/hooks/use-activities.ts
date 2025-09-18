import { useMemo, useState } from "react";
import { useGetActivities } from "../api/use-get-activities";

export const useActivities = () => {
  const { data: activities, isLoading } = useGetActivities();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const activityTypes = useMemo(() => {
    if (!activities) return [];
    const types = Array.from(new Set(activities.map((a) => a.activityType)));
    return types;
  }, [activities]);

  // Date filter logic
  function isDateMatch(date: Date, filter: string) {
    const d = new Date(date);
    const now = new Date();
    if (filter === "all") return true;
    if (filter === "today") {
      return d.toDateString() === now.toDateString();
    }
    if (filter === "yesterday") {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return d.toDateString() === yesterday.toDateString();
    }
    if (filter === "thisMonth") {
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }
    if (filter === "lastMonth") {
      const lastMonth = new Date(now);
      lastMonth.setMonth(now.getMonth() - 1);
      return (
        d.getMonth() === lastMonth.getMonth() &&
        d.getFullYear() === lastMonth.getFullYear()
      );
    }
    return true;
  }

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (!activities) return [];
    return activities.filter((a) => {
      const typeMatch = typeFilter === "all" || a.activityType === typeFilter;
      const dateMatch = isDateMatch(a.activityDate, dateFilter);
      return typeMatch && dateMatch;
    });
  }, [activities, typeFilter, dateFilter]);

  return {
    filteredActivities,
    isLoading,
    activityTypes,
    typeFilter,
    setTypeFilter,
    dateFilter,
    setDateFilter,
  };
};

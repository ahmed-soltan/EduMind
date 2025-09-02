"use client";

import { Calendar } from "lucide-react";
import { useState, useMemo } from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useGetActivities } from "../api/use-get-activities";

export const ActivitiesList = () => {
  const { data: activities, isLoading } = useGetActivities();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Get all unique activity types
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

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Activities</CardTitle>
          <CardAction>
            {/* Filters Section */}
            <div className="flex flex-wrap gap-4 mb-6 items-center">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  Activity Type
                </span>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {activityTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Date</span>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                    <SelectItem value="lastMonth">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTypeFilter("all");
                  setDateFilter("all");
                }}
              >
                Reset Filters
              </Button> */}
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          {/* Activities List */}
          <div className="flex flex-col items-start w-full gap-3">
            {filteredActivities && filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <div className="flex flex-wrap gap-3 items-start justify-between w-full border-neutral-500 border rounded-lg p-4">
                  <div className="flex flex-col items-start gap-1">
                    <h1 className="text-md font-semibold">
                      {activity.activityTitle}
                    </h1>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {activity.activityDescription}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-4" />
                    {new Date(activity.activityDate).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center w-full py-4">
                <p className="text-sm text-muted-foreground">
                  No recent activities found.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

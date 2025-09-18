"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";
import { useGetRecentActivities } from "../api/use-get-recent-activities";

export const ActivitiesSection = () => {
  const { data: activities, isLoading } = useGetRecentActivities();

  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs w-full h-full">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-40 mb-2" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-start w-full gap-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-wrap gap-3 items-start justify-between w-full border-neutral-500 border rounded-lg p-4"
                >
                  <div className="flex flex-col items-start gap-1 w-full max-w-[550px]">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if(!activities){
    return null
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs w-full h-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start w-full gap-3">
            {activities && activities.length > 0 ? (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex flex-wrap gap-3 items-start justify-between w-full border-neutral-500 border rounded-lg p-4"
                >
                  <div className="flex flex-col items-start gap-1 w-full max-w-[550px]">
                    <h1 className="text-md font-semibold line-clamp-1">
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
        <CardFooter>
          <Button asChild variant={"default"} className="w-full">
            <Link href={"/dashboard/activities"}>View All Activities</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

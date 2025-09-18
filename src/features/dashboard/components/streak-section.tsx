"use client"

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, Calendar, TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useGetStreakData } from '../api/use-get-streak-data';

export const StreakTracker= () => {
  const { data: streakData , isLoading} = useGetStreakData();

  if(isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-32 mb-2" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-6 w-10" />
              </div>
              <Skeleton className="h-4 w-40 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-32 mb-2" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-6 w-10" />
              </div>
              <Skeleton className="h-4 w-32 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-32 mb-2" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-24" />
              </div>
              <Skeleton className="h-4 w-40 mt-2" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  const today = new Date().toISOString().split('T')[0];
  const hasStudiedToday = streakData.studyDays.some((day:any) => day.activityDate === today);
  

  const getMotivationalMessage = () => {
    if (streakData.computed.computedCurrent === 0) return "Start your streak today! 💪";
    if (streakData.computed.computedCurrent < 3) return "Building momentum! 🚀";
    if (streakData.computed.computedCurrent < 7) return "Great progress! Keep it up! ⭐";
    if (streakData.computed.computedCurrent < 15) return "You're on fire! 🔥";
    return "Incredible dedication! 🏆";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="h-5 w-5 text-orange-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-primary animate-fade-in">
                {streakData.computed.computedCurrent}
              </span>
              <span className="text-muted-foreground">days</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {getMotivationalMessage()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Longest Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-muted-foreground">
                {streakData.computed.computedLongest}
              </span>
              <span className="text-muted-foreground">days</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Personal best
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge 
                variant={hasStudiedToday ? "default" : "secondary"}
                className={hasStudiedToday ? "bg-emerald-500 border-emerald-800 text-success-foreground" : ""}
              >
                {hasStudiedToday ? "Completed" : "Pending"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {hasStudiedToday ? "Great job today!" : "Complete today's activity"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
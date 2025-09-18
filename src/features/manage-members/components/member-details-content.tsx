"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Mail,
  User,
  Settings,
  Shield,
  UserCheck,
  UserX,
  Edit3,
  Save,
  X,
  XIcon,
  Brain,
  BookOpen,
  Zap,
  Target,
  Trophy,
  Clock,
  TrendingUp,
  Flame,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

import { useGetMemberDetails } from "../api/use-get-member-details";

interface MemberDetailsContentProps {
  memberId: string;
}

export const MemberDetailsContent = ({
  memberId,
}: MemberDetailsContentProps) => {
  const router = useRouter();

  const { data: memberData, isLoading: isLoadingMember } =
    useGetMemberDetails(memberId);

  const member = memberData?.member;
  const isLoading = isLoadingMember;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <UserX className="h-16 w-16 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Member not found</h3>
          <p className="text-sm text-muted-foreground">
            The member you're looking for doesn't exist or you don't have
            permission to view them.
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-10 w-10 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {member.firstName} {member.lastName}
            </h1>
            <p className="text-muted-foreground">
              Member details and management
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Member Information Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Member Information
              </CardTitle>
              <CardDescription>
                Basic information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {member.firstName?.[0]?.toUpperCase()}
                    {member.lastName?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2 flex-1">
                  <div>
                    <Label className="text-sm font-medium">Full Name</Label>
                    <p className="text-sm text-muted-foreground">
                      {member.firstName} {member.lastName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email Address</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Account Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Account Created</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(member.createdAt), "PPP")}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Joined Team</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(member.joinedAt), "PPP")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Statistics */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Activity Overview
              </CardTitle>
              <CardDescription>
                Member's learning activity and engagement statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {memberData?.quizzes.count || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Quizzes Created
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {memberData?.attempts.count || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Quiz Attempts</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {memberData?.flashcards.count || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Flashcards</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <BookOpen className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {memberData?.decks.count || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Decks</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Flame className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {memberData?.streak.currentStreak || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Current Streak
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Longest: {memberData?.streak.longestStreak || 0} days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Streak Details */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                Study Streak
              </CardTitle>
              <CardDescription>
                Member's daily study consistency and streak history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border">
                  <Flame className="h-12 w-12 text-red-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-red-600">
                    {memberData?.streak.currentStreak || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Current Streak
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">days</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border">
                  <Trophy className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-orange-600">
                    {memberData?.streak.longestStreak || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Longest Streak
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    personal best
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border">
                  <Calendar className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-green-600">
                    {memberData?.streak.recentStudyDays?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Recent Activity
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    last 30 days
                  </p>
                </div>
              </div>

              {memberData?.streak.lastActivityDate && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Last Activity:{" "}
                    <span className="font-medium">
                      {format(
                        new Date(memberData.streak.lastActivityDate),
                        "MMMM dd, yyyy"
                      )}
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest learning activities and creations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recent Quizzes */}
              {memberData?.quizzes.recent &&
                memberData.quizzes.recent.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Recent Quizzes Created
                    </Label>
                    <div className="space-y-2">
                      {memberData.quizzes.recent.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">{quiz.title}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(quiz.createdAt), "MMM dd")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Recent Quiz Attempts */}
              {memberData?.attempts.recent &&
                memberData.attempts.recent.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Recent Quiz Attempts
                    </Label>
                    <div className="space-y-2">
                      {memberData.attempts.recent.map((attempt) => (
                        <div
                          key={attempt.id}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Quiz Attempt</span>
                            <Badge variant="outline" className="text-xs">
                              Score: {attempt.score}%
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(attempt.attemptedAt), "MMM dd")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Recent Decks */}
              {memberData?.decks.recent &&
                memberData.decks.recent.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Recent Decks Created
                    </Label>
                    <div className="space-y-2">
                      {memberData.decks.recent.map((deck) => (
                        <div
                          key={deck.id}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-orange-600" />
                            <span className="text-sm">{deck.title}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(deck.createdAt), "MMM dd")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Recent Flashcards */}
              {memberData?.flashcards.recent &&
                memberData.flashcards.recent.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Recent Flashcards Created
                    </Label>
                    <div className="space-y-2">
                      {memberData.flashcards.recent.map((flashcard) => (
                        <div
                          key={flashcard.id}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-purple-600" />
                            <span className="text-sm truncate max-w-48">
                              {flashcard.front}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(flashcard.createdAt), "MMM dd")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* No Activity */}
              {!memberData?.quizzes.recent?.length &&
                !memberData?.attempts.recent?.length &&
                !memberData?.decks.recent?.length &&
                !memberData?.flashcards.recent?.length && (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No recent activity
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Role and Permissions Card */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Role & Access
              </CardTitle>
              <CardDescription>Member role and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Role</Label>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Shield className="h-3 w-3" />
                    {member?.roleName || "Unknown Role"}
                  </Badge>
                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Account Status</Label>

                <div className="flex items-center gap-2">
                  {member.isActive ? (
                    <Badge
                      variant="default"
                      className="flex items-center gap-1"
                    >
                      <UserCheck className="h-3 w-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="destructive"
                      className="flex items-center gap-1"
                    >
                      <UserX className="h-3 w-3" />
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Permissions */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Permissions</Label>
                <div className="space-y-1 flex flex-wrap items-center gap-1">
                  {member.permissions && member.permissions.length > 0 ? (
                    member.permissions.map((permission: string) => (
                      <Badge
                        key={permission}
                        className="flex items-center gap-2 text-xs text-neutral-300"
                        variant="outline"
                      >
                        <Shield className="size-3" />
                        <span>{permission.split(":").reverse().join(" ")}</span>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No specific permissions
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

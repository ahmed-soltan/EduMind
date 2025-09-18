"use client";

import { useQuery } from "@tanstack/react-query";

interface MemberDetails {
  id: string;
  userId: string;
  tenantId: string;
  roleId: string;
  isActive: boolean;
  joinedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  roleName: string;
  permissions: string[];
}

interface MemberDetailsResponse {
  member: MemberDetails;
  quizzes: {
    count: number;
    recent: Array<{
      id: string;
      title: string;
      createdAt: string;
    }>;
  };
  attempts: {
    count: number;
    recent: Array<{
      id: string;
      quizId: string;
      score: number;
      attemptedAt: string;
    }>;
  };
  flashcards: {
    count: number;
    recent: Array<{
      id: string;
      front: string;
      back: string;
      createdAt: string;
    }>;
  };
  decks: {
    count: number;
    recent: Array<{
      id: string;
      title: string;
      createdAt: string;
    }>;
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string | null;
    recentStudyDays: Array<{
      id: string;
      tenantId: string;
      activityDate: string;
      firstEventAt: string;
      tenantMemberId: string | null;
      source: string;
    }>;
  };
}

export const useGetMemberDetails = (memberId: string) => {
  return useQuery<MemberDetailsResponse>({
    queryKey: ["member-details", memberId],
    queryFn: async () => {
      const response = await fetch(`/api/members/${memberId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch member details");
      }
      
      return response.json();
    },
    enabled: !!memberId,
  });
};
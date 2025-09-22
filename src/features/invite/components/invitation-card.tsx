"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { APP_DOMAIN, protocol } from "@/lib/utils";
import apiClient from "@/lib/api";

interface InvitationData {
  token: string;
  email: string;
  tenantName: string;
  role: string;
  inviterName: string;
  userExists: boolean;
  isValid: boolean;
  isExpired: boolean;
  subdomain: string;
}

export const InvitationCard = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  const token = searchParams.get("token");
  const tenant = searchParams.get("tenant");

  useEffect(() => {
    if (!token || !tenant) {
      setLoading(false);
      return;
    }

    // Validate invitation token
    validateInvitation();
  }, [token, tenant]);

  const validateInvitation = async () => {
    try {
      const response = await apiClient(
        `/api/invitations/validate?token=${token}&tenant=${tenant}`
      );
      const data = await response.data
      if (response.status === 200) {
        setInvitation(data);
      } else {
        toast.error(data.error || "Invalid invitation");
      }
    } catch (error) {
      console.error("Error validating invitation:", error);
      toast.error("Failed to validate invitation");
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!invitation || !token) return;

    setAccepting(true);
    try {
      const response = await apiClient("/api/invitations/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify({ token, subdomain: tenant }),
      });

      const data = await response.data;

      if (response.status === 200) {
        toast.success("Invitation accepted successfully!");
        router.push(
          `${protocol}://${invitation.subdomain}.${APP_DOMAIN}/dashboard`
        );
      } else {
        toast.error(data.error || "Failed to accept invitation");
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error("Failed to accept invitation");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-muted-foreground">
              Validating invitation...
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is missing required information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/")}
              className="w-full"
              variant="outline"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation || !invitation.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">
              {invitation?.isExpired
                ? "Invitation Expired"
                : "Invalid Invitation"}
            </CardTitle>
            <CardDescription>
              {invitation?.isExpired
                ? "This invitation has expired. Please contact your team admin for a new invitation."
                : "This invitation is no longer valid or has already been used."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/")}
              className="w-full"
              variant="outline"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg ">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
            <UserPlus className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            You're Invited! 🎉
          </CardTitle>
          <CardDescription className="text-base">
            {invitation.inviterName} has invited you to join their team
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Invitation Details */}
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-muted-foreground">Team:</span>
              <span className="font-semibold">{invitation.tenantName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-muted-foreground">Role:</span>
              <Badge variant="secondary">{invitation.role}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-muted-foreground">Email:</span>
              <span className="text-sm text-muted-foreground">
                {invitation.email}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-muted-foreground">
                Invited by:
              </span>
              <span className="text-sm text-muted-foreground">
                {invitation.inviterName}
              </span>
            </div>
          </div>

          {/* Account Status */}
          <div className="text-center">
            {invitation.userExists ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-800">
                  Great! You already have an account. After accepting, you'll be
                  redirected to sign in.
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <UserPlus className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-800">
                  Welcome to EduMind! After accepting, you'll be redirected to
                  create your account.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="flex-1"
              disabled={accepting}
            >
              Decline
            </Button>
            <Button
              onClick={acceptInvitation}
              disabled={accepting}
              className="flex-1"
            >
              {accepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Accept Invitation
                </>
              )}
            </Button>
          </div>

          {/* Features Preview */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-center mb-4">
              What you'll get access to:
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧠</span>
                <span>Interactive Quizzes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📚</span>
                <span>Flashcard Decks</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📄</span>
                <span>AI Document Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📊</span>
                <span>Progress Tracking</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

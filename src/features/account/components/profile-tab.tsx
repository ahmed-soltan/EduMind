"use client";

import { z } from "zod";
import { useState } from "react";
import { User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useGetProfile } from "../api/use-get-profile";
import { useUpdateProfile } from "../api/use-update-profile";

const profileSchema = z.object({
  nickName: z.string().optional(),
  bio: z.string().optional(),
  timezone: z.string().optional(),
  interests: z.array(z.string()).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfileTab = () => {
  const { data: profile, isLoading } = useGetProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const [newInterest, setNewInterest] = useState("");

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      nickName: profile?.nickName || "",
      bio: profile?.bio || "",
      timezone: profile?.timezone || "UTC",
      interests: profile?.interests || [],
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfile(data);
  };

  const ProfileSkeleton = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-16" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-18 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Customize your profile information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nickName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nickname</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your preferred nickname"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself..."
                        className="min-h-[80px]"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Interests
          </CardTitle>
          <CardDescription>
            Add topics that interest you to personalize your experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Add an interest..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addInterest();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addInterest}
                disabled={!newInterest.trim()}
              >
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(form.watch("interests") || []).map((interest) => (
                <Badge
                  key={interest}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeInterest(interest)}
                >
                  {interest} ×
                </Badge>
              ))}
              {(form.watch("interests") || []).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No interests added yet. Add some topics you're interested in!
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

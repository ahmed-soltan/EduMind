"use client";

import z from "zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

// import { useSignup } from "../api/use-signup";
import { signupSchema } from "../schemas";
import { useCallbackUrl } from "@/hooks/use-callback-url";
import { useSignup } from "../api/use-signup";
import { FormBanner } from "@/components/form-banner";

export const SignupForm = () => {
  const router = useRouter();
  const callbackUrl = useCallbackUrl();
  const { mutateAsync, isPending, error } = useSignup();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    const { accessToken } = await mutateAsync(data);
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken!);
    }
    router.refresh();
    router.push(callbackUrl);
  };

  return (
    <Card className="bg-neutral-800 max-w-md w-full text-neutral-200">
      <CardContent className="p-4 border-0 space-y-4">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 justify-center">
            Join Your AI Study Buddy{" "}
          </CardTitle>
        </CardHeader>
        {error && <FormBanner message={error.message} />}
        <Form {...form}>
          <form
            action=""
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <Label>First Name</Label>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter your first name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <Label>Last Name</Label>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter your last name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <Label>Email Address</Label>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <Label>Email Address</Label>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <Label>Password</Label>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Enter your password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button variant={"outline"} className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin size-4" />}
              Create Account
            </Button>
            <hr />
            <p className="text-center text-sm text-neutral-300">
              Already Have an Account?{" "}
              <Link
                href={`/auth/login?callback=${callbackUrl}`}
                className="text-blue-500 underline"
              >
                Sign In
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

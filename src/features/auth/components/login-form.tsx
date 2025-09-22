"use client";

import z from "zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormBanner } from "@/components/form-banner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { loginSchema } from "../schemas";
import { useLogin } from "../api/use-login";
import { useCallbackUrl } from "@/hooks/use-callback-url";
import { APP_DOMAIN, protocol } from "@/lib/utils";

export const LoginForm = () => {
  const router = useRouter();
  const callbackUrl = useCallbackUrl();
  const { mutateAsync, isPending, error } = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      // mutateAsync will throw on network/validation errors — so wrap in try/catch
      const result = await mutateAsync(data);

      // result should be the server response shape
      console.log("login result:", result);

      const accessToken = result?.accessToken;
      const lastActiveTenantSubdomain = result?.lastActiveTenantSubdomain;

      // If backend returns accessToken but you rely on httpOnly cookies, you can skip saving it to localStorage.
      // If you *do* need it client-side, set it here (but prefer httpOnly cookies)
      if (accessToken) {
        // optional: localStorage.setItem("accessToken", accessToken);
        // but prefer httpOnly cookies set by the server
        console.debug("Access token received");
      }

      if (callbackUrl === "/invite") {
        router.push(callbackUrl);
      }

      // If we have a tenant subdomain we prefer redirecting to it.
      if (lastActiveTenantSubdomain) {
        const target = `${protocol}://${lastActiveTenantSubdomain}.${APP_DOMAIN}/dashboard`;
        console.log("Redirecting to tenant dashboard:", target);

        // Use assign for a full navigation (works cross-subdomain)
        window.location.assign(target);
        return;
      }

      // Default: go to callbackUrl
      console.log("Redirecting to callbackUrl:", callbackUrl);
      router.push(callbackUrl);
    } catch (err: any) {
      // mutateAsync threw — show error (you already show FormBanner via error state)
      console.error("Login failed:", err);
      // optionally show toast or set local error state
    }
  };

  return (
    <Card className="bg-neutral-800 max-w-md w-full text-neutral-200">
      <CardContent className="p-4 border-0 space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-2xl text-center flex items-center gap-2 justify-center">
            Welcome Back 👋
          </CardTitle>
        </CardHeader>
        {error && <FormBanner message={"invalid credentials"} />}
        <Form {...form}>
          <form
            action=""
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 "
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
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
                <FormItem className="space-y-2">
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
              Login
            </Button>
            <hr />
            <p className="text-center text-sm text-neutral-300">
              Don't Have an Account?{" "}
              <Link
                href={`/auth/signup?callback=${callbackUrl}`}
                className="text-blue-500 underline"
              >
                create account
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

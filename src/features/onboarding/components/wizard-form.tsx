"use client";

import z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormBanner } from "@/components/form-banner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { onboardingSchema } from "../types";
import { cn, protocol, APP_DOMAIN } from "@/lib/utils";

import { useOnboard } from "../api/use-onboard";
import { Loader2 } from "lucide-react";

const items = [
  {
    id: "mathematics",
    label: "Mathematics",
  },
  {
    id: "physics",
    label: "Physics",
  },
  {
    id: "chemistry",
    label: "Chemistry",
  },
  {
    id: "biology",
    label: "Biology",
  },
  {
    id: "computer-science",
    label: "Computer Science",
  },
  {
    id: "english",
    label: "English",
  },
  {
    id: "history",
    label: "History",
  },
] as const;

export const WizardForm = ({ tenantId }: { tenantId: string }) => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const { mutateAsync, isPending, error } = useOnboard();

  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      nickName: "",
      bio: "",
      subdomain: "",
      gradeLevel: "",
      learningGoal: "",
      interests: [],
    },
  });
  const totalSteps = 2;

  const { handleSubmit, control } = form;

  const onSubmit = async (data: z.infer<typeof onboardingSchema>) => {
    if (step === 0) return;
    const onboardingData = {
      ...data,
      tenantId,
    };
    const { subdomain } = await mutateAsync(onboardingData);

    router.push(`${protocol}://${subdomain}.${APP_DOMAIN}/dashboard`);

    form.reset();

    toast.success("Form successfully submitted");
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-center ">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex items-center">
            <div
              className={cn(
                "w-4 h-4 rounded-full transition-all duration-300 ease-in-out",
                index <= step ? "bg-primary" : "bg-primary/30",
                index < step && "bg-primary"
              )}
            />
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  "w-8 h-0.5",
                  index < step ? "bg-primary" : "bg-primary/30"
                )}
              />
            )}
          </div>
        ))}
      </div>
      <Card className="shadow-none border-0 w-full max-w-[700px] bg-transparent">
        <CardHeader>
          <CardTitle className="text-lg">Complete Your Profile</CardTitle>
          <CardDescription>Current step {step + 1}</CardDescription>
          {error && <FormBanner message={error?.message} />}
        </CardHeader>
        <CardContent className="w-full">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid gap-y-4 w-full"
            >
              {step === 0 && (
                <div className="grid gap-y-4 w-full">
                  <FormField
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tenant Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder=""
                            autoComplete="off"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="nickName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nickname</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder=""
                            autoComplete="off"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Your preferred display name (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="subdomain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subdomain</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder=""
                            autoComplete="off"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormDescription className="w-full max-w-[400px]">
                          Choose a unique subdomain for your account. It will
                          appear in your URL, e.g., subdomain.example.com.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={5}
                            content={field.value}
                            onChange={field.onChange}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Tell us a little about yourself (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      className="font-medium"
                      size="sm"
                      disabled={true}
                    >
                      Back
                    </Button>

                    <Button
                      size="sm"
                      className="font-medium"
                      onClick={handleNext}
                      type="button"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-y-4 w-full">
                  <FormField
                    control={control}
                    name="gradeLevel"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Grade Level</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder=""
                            autoComplete="off"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          e.g., Grade 6, College, etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="learningGoal"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Learning Goal</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder=""
                            autoComplete="off"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          e.g., Improve math skills, Learn to code, etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="interests"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base font-medium">
                            Choose what you are interested in
                          </FormLabel>
                        </div>
                        <div className="grid grid-cols-3 gap-5">
                          {items.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="interests"
                              render={({ field }) => {
                                const currentValue = field.value ?? [];
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-center gap-2"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...currentValue,
                                                item.id,
                                              ])
                                            : field.onChange(
                                                currentValue.filter(
                                                  (value) => value !== item.id
                                                )
                                              );
                                        }}
                                        disabled={isPending}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      className="font-medium"
                      size="sm"
                      onClick={handleBack}
                      disabled={isPending}
                    >
                      Back
                    </Button>

                    <Button
                      size="sm"
                      className="font-medium flex items-center gap-1"
                      type="submit"
                      disabled={isPending}
                    >
                      {isPending && (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      )}
                      {isPending ? "Creating Your Dashboard..." : "Submit"}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

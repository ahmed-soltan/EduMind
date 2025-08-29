"use client";

import z from "zod";
import { useForm } from "react-hook-form";
import { Loader2, Sparkles } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { generateQuizSchema } from "../schema";

import { useGenerateQuiz } from "../api/use-generate-quiz";

interface GenerateQuizFormProps {
  onCancel: () => void;
}

export const GenerateQuizForm = ({ onCancel }: GenerateQuizFormProps) => {
  const { mutateAsync, isPending } = useGenerateQuiz();
  const form = useForm<z.infer<typeof generateQuizSchema>>({
    resolver: zodResolver(generateQuizSchema),
    defaultValues: {
      topic: "",
      prompt: "",
      difficulty: "easy",
      numQuestions: [5],
    },
  });

  const onSubmit = async (data: z.infer<typeof generateQuizSchema>) => {
    const newData = { ...data, numQuestions: data.numQuestions[0] };
    await mutateAsync(newData);

    onCancel?.();
  };

  return (
    <Card className="w-full border-0">
      <CardContent className="w-full space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5" />
            <h1 className="text-2xl">Generate AI Quiz</h1>
          </CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              name="topic"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Label>Topic</Label>
                  <FormControl>
                    <Input
                      placeholder="e.g., Math, Computer Science, etc"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="difficulty"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Label>Difficulty</Label>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background border-border w-full">
                        <SelectValue placeholder="Select difficulty..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border shadow-elegant">
                      <SelectItem
                        value="easy"
                        className="text-foreground hover:bg-muted"
                      >
                        <div className="flex items-center gap-2">
                          <span>🟢</span>
                          Easy
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="medium"
                        className="text-foreground hover:bg-muted"
                      >
                        <div className="flex items-center gap-2">
                          <span>🟡</span>
                          Medium
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="hard"
                        className="text-foreground hover:bg-muted"
                      >
                        <div className="flex items-center gap-2">
                          <span>🔴</span>
                          Hard
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              name="numQuestions"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <Label>Number of Questions: {field.value[0]}</Label>
                  <FormControl>
                    <div className="px-3">
                      <Slider
                        value={field.value}
                        onValueChange={field.onChange}
                        max={30}
                        min={5}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="prompt"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <Label>
                    Prompt <span className="text-neutral-500">(optional)</span>
                  </Label>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Create a quiz about JavaScript"
                      {...field}
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <CardFooter className="flex gap-3 p-0">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-border text-foreground hover:bg-muted"
                type="button"
              >
                Cancel
              </Button>
              <Button disabled={isPending} className="flex-1" type="submit">
                {isPending ? (
                  <Loader2 className="animate-spin size-5" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-1" />
                )}
                Generate Quiz
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

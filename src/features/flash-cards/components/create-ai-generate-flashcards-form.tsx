"use client";

import z from "zod";
import { useForm } from "react-hook-form";
import { Loader2, Sparkles } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
} from "@/components/ui/form";

import { CreateAIGeneratedFlashCardSchema } from "../schemas";
import { useCreateAIGeneratedFlashCard } from "../api/use-create-ai-generated-flash-card";

interface CreateAIGeneratedFlashCardFormProps {
  onCancel: () => void;
}

export const CreateAIGeneratedFlashCardForm = ({
  onCancel,
}: CreateAIGeneratedFlashCardFormProps) => {
  const { mutateAsync, isPending } = useCreateAIGeneratedFlashCard();
  const form = useForm<z.infer<typeof CreateAIGeneratedFlashCardSchema>>({
    resolver: zodResolver(CreateAIGeneratedFlashCardSchema),
    defaultValues: {
      numFlashCards: [1],
    },
  });

  const onSubmit = async (
    data: z.infer<typeof CreateAIGeneratedFlashCardSchema>
  ) => {
    await mutateAsync({numFlashCards: data.numFlashCards[0]});

    onCancel?.();
  };

  return (
    <Card className="w-full border-0">
      <CardContent className="w-full space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5" />
            <h1 className="text-2xl">Generate Flash Card with AI </h1>
          </CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              name="numFlashCards"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <Label>Number of Flash Cards: {field.value[0]}</Label>
                  <FormControl>
                    <div className="px-3">
                      <Slider
                        value={field.value}
                        onValueChange={field.onChange}
                        max={5}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </FormControl>
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
                {isPending && <Loader2 className="animate-spin size-5" />}
                Generate Flash Cards
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

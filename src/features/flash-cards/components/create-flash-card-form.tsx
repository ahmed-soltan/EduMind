"use client";

import z from "zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

import { CreateFlashCardSchema } from "../schemas";
import { useCreateFlashCard } from "../api/use-create-flash-card";


interface CreateFlashCardFormProps {
  onCancel: () => void;
}

export const CreateFlashCardForm = ({ onCancel }: CreateFlashCardFormProps) => {
  const { mutateAsync, isPending } = useCreateFlashCard();
  const form = useForm<z.infer<typeof CreateFlashCardSchema>>({
    resolver: zodResolver(CreateFlashCardSchema),
    defaultValues: {
      front: "",
      back: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof CreateFlashCardSchema>) => {
    await mutateAsync(data);

    onCancel?.();
  };

  return (
    <Card className="w-full border-0">
      <CardContent className="w-full space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-2">
            <h1 className="text-2xl">Create Flash Card</h1>
          </CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              name="front"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Label>Front</Label>
                  <FormControl>
                    <Input
                      placeholder="e.g., What is the time complexity of QuickSort?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="back"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Label>Back</Label>
                  <FormControl>
                    <Input
                      placeholder="e.g., O(n log n) "
                      {...field}
                    />
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
                Create Flash Card
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

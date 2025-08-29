"use client";

import z from "zod";
import { useForm } from "react-hook-form";
import { Loader2, Sparkles } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

import { UpdateDeckSchema } from "../schemas";
import { useUpdateDeck } from "../api/use-update-deck";

interface UpdateDeckFormProps {
  onCancel: () => void;
  initialData: {
    id: string;
    title: string;
    description: string;
  };
}

export const UpdateDeckForm = ({
  onCancel,
  initialData,
}: UpdateDeckFormProps) => {
  const { mutateAsync, isPending } = useUpdateDeck(initialData.id);
  const form = useForm<z.infer<typeof UpdateDeckSchema>>({
    resolver: zodResolver(UpdateDeckSchema),
    defaultValues: {
      title: initialData.title,
      description: initialData.description,
    },
  });

  const onSubmit = async (data: z.infer<typeof UpdateDeckSchema>) => {
    await mutateAsync(data);

    onCancel?.();
  };

  return (
    <Card className="w-full border-0">
      <CardContent className="w-full space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-2">
            <h1 className="text-2xl">Update Deck</h1>
          </CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Label>Title</Label>
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
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Label>Description</Label>
                  <FormControl>
                    <Textarea
                      placeholder="Enter deck description"
                      {...field}
                      rows={5}
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
              <Button
                disabled={isPending || !form.formState.isDirty}
                className="flex-1"
                type="submit"
              >
                {isPending && <Loader2 className="animate-spin size-5" />}
                Update Deck
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

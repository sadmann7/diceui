"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Rating, RatingItem } from "@/registry/bases/radix/ui/rating";

const formSchema = z.object({
  rating: z.number().min(1, {
    message: "Please provide a rating.",
  }),
});

type FormSchema = z.infer<typeof formSchema>;

export default function RatingFormDemo() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 0,
    },
  });

  const onSubmit = React.useCallback((data: FormSchema) => {
    toast.success(`You rated: ${data.rating} stars`);
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <Rating
                  value={field.value}
                  onValueChange={field.onChange}
                  step={0.5}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <RatingItem key={i} />
                  ))}
                </Rating>
              </FormControl>
              <FormDescription>
                Rate your experience from 1 to 5 stars.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

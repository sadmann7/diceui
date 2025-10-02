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
import { Rating, RatingItem } from "@/registry/default/ui/rating";

const FormSchema = z.object({
  rating: z.number().min(1, {
    message: "Please provide a rating.",
  }),
});

export default function RatingFormDemo() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      rating: 0,
    },
  });

  const onSubmit = React.useCallback((data: z.infer<typeof FormSchema>) => {
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
                  name={field.name}
                  allowHalf
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

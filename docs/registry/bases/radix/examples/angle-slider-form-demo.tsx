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
import {
  AngleSlider,
  AngleSliderRange,
  AngleSliderThumb,
  AngleSliderTrack,
  AngleSliderValue,
} from "@/registry/bases/radix/ui/angle-slider";

const formSchema = z.object({
  rotation: z.array(z.number()).length(1),
  range: z.array(z.number()).length(2),
});

type FormSchema = z.infer<typeof formSchema>;

export default function AngleSliderFormDemo() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rotation: [45],
      range: [90, 270],
    },
  });

  const onSubmit = React.useCallback((data: FormSchema) => {
    toast.success(
      <pre className="w-full">{JSON.stringify(data, null, 2)}</pre>,
    );
  }, []);

  const onReset = React.useCallback(() => {
    form.reset();
  }, [form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="rotation"
            render={({ field }) => (
              <FormItem className="place-items-center rounded-lg border p-6">
                <FormLabel>Rotation angle</FormLabel>
                <FormControl>
                  <AngleSlider
                    value={field.value}
                    onValueChange={field.onChange}
                    max={360}
                    min={0}
                    step={1}
                    size={60}
                    name={field.name}
                  >
                    <AngleSliderTrack>
                      <AngleSliderRange />
                    </AngleSliderTrack>
                    <AngleSliderThumb />
                    <AngleSliderValue />
                  </AngleSlider>
                </FormControl>
                <FormDescription>
                  Set the rotation angle in degrees (0-360°)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="range"
            render={({ field }) => (
              <FormItem className="place-items-center rounded-lg border p-6">
                <FormLabel>Angle range</FormLabel>
                <FormControl>
                  <AngleSlider
                    value={field.value}
                    onValueChange={field.onChange}
                    max={360}
                    min={0}
                    step={5}
                    size={60}
                    minStepsBetweenThumbs={1}
                    name={field.name}
                  >
                    <AngleSliderTrack>
                      <AngleSliderRange />
                    </AngleSliderTrack>
                    <AngleSliderThumb index={0} />
                    <AngleSliderThumb index={1} />
                    <AngleSliderValue />
                  </AngleSlider>
                </FormControl>
                <FormDescription>
                  Define a range of angles for the operation
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onReset}>
            Reset
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}

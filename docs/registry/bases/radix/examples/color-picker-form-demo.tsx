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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ColorPicker,
  ColorPickerAlphaSlider,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerEyeDropper,
  ColorPickerFormatSelect,
  ColorPickerHueSlider,
  ColorPickerInput,
  ColorPickerSwatch,
  ColorPickerTrigger,
} from "@/registry/bases/radix/ui/color-picker";

const formSchema = z.object({
  primaryColor: z
    .string()
    .min(1, "Primary color is required")
    .regex(/^#([0-9A-F]{3}){1,2}$/i, "Must be a valid hex color"),
  secondaryColor: z
    .string()
    .min(1, "Secondary color is required")
    .regex(/^#([0-9A-F]{3}){1,2}$/i, "Must be a valid hex color"),
  accentColor: z
    .string()
    .min(1, "Accent color is required")
    .regex(/^#([0-9A-F]{3}){1,2}$/i, "Must be a valid hex color"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ColorPickerFormDemo() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      primaryColor: "#3b82f6",
      secondaryColor: "#10b981",
      accentColor: "#f59e0b",
    },
  });

  const onSubmit = React.useCallback((input: FormValues) => {
    toast.success(
      <div className="space-y-2">
        <div className="font-medium">Theme Colors Updated!</div>
        <pre className="w-full text-xs">{JSON.stringify(input, null, 2)}</pre>
      </div>,
    );
  }, []);

  const onReset = React.useCallback(() => {
    form.reset();
  }, [form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full max-w-md flex-col gap-4 rounded-md border p-6 shadow-sm"
      >
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-lg">Theme Colors</h3>
          <p className="text-muted-foreground text-sm">
            Configure your application's color scheme
          </p>
        </div>
        <FormField
          control={form.control}
          name="primaryColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Color</FormLabel>
              <FormControl>
                <ColorPicker
                  value={field.value}
                  onValueChange={field.onChange}
                  defaultFormat="hex"
                >
                  <div className="flex items-center gap-3">
                    <ColorPickerTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 px-3"
                      >
                        <ColorPickerSwatch className="size-4" />
                        {field.value}
                      </Button>
                    </ColorPickerTrigger>
                  </div>
                  <ColorPickerContent>
                    <ColorPickerArea />
                    <div className="flex items-center gap-2">
                      <ColorPickerEyeDropper />
                      <div className="flex flex-1 flex-col gap-2">
                        <ColorPickerHueSlider />
                        <ColorPickerAlphaSlider />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ColorPickerFormatSelect />
                      <ColorPickerInput />
                    </div>
                  </ColorPickerContent>
                </ColorPicker>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="secondaryColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secondary Color</FormLabel>
              <FormControl>
                <ColorPicker
                  value={field.value}
                  onValueChange={field.onChange}
                  defaultFormat="hex"
                >
                  <div className="flex items-center gap-3">
                    <ColorPickerTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 px-3"
                      >
                        <ColorPickerSwatch className="size-4" />
                        {field.value}
                      </Button>
                    </ColorPickerTrigger>
                  </div>
                  <ColorPickerContent>
                    <ColorPickerArea />
                    <div className="flex items-center gap-2">
                      <ColorPickerEyeDropper />
                      <div className="flex flex-1 flex-col gap-2">
                        <ColorPickerHueSlider />
                        <ColorPickerAlphaSlider />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ColorPickerFormatSelect />
                      <ColorPickerInput />
                    </div>
                  </ColorPickerContent>
                </ColorPicker>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accentColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Accent Color</FormLabel>
              <FormControl>
                <ColorPicker
                  value={field.value}
                  onValueChange={field.onChange}
                  defaultFormat="hex"
                >
                  <div className="flex items-center gap-3">
                    <ColorPickerTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 px-3"
                      >
                        <ColorPickerSwatch className="size-4" />
                        {field.value}
                      </Button>
                    </ColorPickerTrigger>
                  </div>
                  <ColorPickerContent>
                    <ColorPickerArea />
                    <div className="flex items-center gap-2">
                      <ColorPickerEyeDropper />
                      <div className="flex flex-1 flex-col gap-2">
                        <ColorPickerHueSlider />
                        <ColorPickerAlphaSlider />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ColorPickerFormatSelect />
                      <ColorPickerInput />
                    </div>
                  </ColorPickerContent>
                </ColorPicker>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onReset}>
            Reset
          </Button>
          <Button type="submit">Save Theme</Button>
        </div>
      </form>
    </Form>
  );
}

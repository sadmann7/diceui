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
import { MaskInput } from "@/registry/default/ui/mask-input";

const formSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  ssn: z.string().min(9, "SSN must be 9 digits"),
  birthDate: z.string().min(8, "Birth date is required"),
  emergencyContact: z.string().min(10, "Emergency contact is required"),
});

type FormSchema = z.infer<typeof formSchema>;

export default function MaskInputFormDemo() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
      ssn: "",
      birthDate: "",
      emergencyContact: "",
    },
  });

  function onSubmit(values: FormSchema) {
    toast.success("Form submitted successfully!");
    console.log(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-6"
      >
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <MaskInput
                  mask="phone"
                  value={field.value}
                  onValueChange={(maskedValue, unmaskedValue) => {
                    field.onChange(unmaskedValue);
                  }}
                  placeholder="(555) 123-4567"
                  invalid={!!form.formState.errors.phone}
                />
              </FormControl>
              <FormDescription>Enter your primary phone number</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ssn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Social Security Number</FormLabel>
              <FormControl>
                <MaskInput
                  mask="ssn"
                  value={field.value}
                  onValueChange={(maskedValue, unmaskedValue) => {
                    field.onChange(unmaskedValue);
                  }}
                  placeholder="123-45-6789"
                  invalid={!!form.formState.errors.ssn}
                />
              </FormControl>
              <FormDescription>
                Enter your social security number
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Birth Date</FormLabel>
              <FormControl>
                <MaskInput
                  mask="date"
                  value={field.value}
                  onValueChange={(maskedValue, unmaskedValue) => {
                    field.onChange(unmaskedValue);
                  }}
                  placeholder="mm/dd/yyyy"
                  invalid={!!form.formState.errors.birthDate}
                />
              </FormControl>
              <FormDescription>Enter your date of birth</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emergencyContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emergency Contact</FormLabel>
              <FormControl>
                <MaskInput
                  mask="phone"
                  value={field.value}
                  onValueChange={(maskedValue, unmaskedValue) => {
                    field.onChange(unmaskedValue);
                  }}
                  placeholder="(555) 987-6543"
                  invalid={!!form.formState.errors.emergencyContact}
                />
              </FormControl>
              <FormDescription>
                Enter emergency contact phone number
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Submit Form
        </Button>
      </form>
    </Form>
  );
}

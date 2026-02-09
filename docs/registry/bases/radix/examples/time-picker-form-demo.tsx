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
  TimePicker,
  TimePickerContent,
  TimePickerHour,
  TimePickerInput,
  TimePickerInputGroup,
  TimePickerMinute,
  TimePickerPeriod,
  TimePickerSeparator,
  TimePickerTrigger,
} from "@/registry/bases/radix/ui/time-picker";

const formSchema = z.object({
  appointmentTime: z.string().min(1, {
    message: "Please select an appointment time.",
  }),
});

type FormSchema = z.infer<typeof formSchema>;

export default function TimePickerFormDemo() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      appointmentTime: "09:00",
    },
  });

  const onSubmit = React.useCallback((data: FormSchema) => {
    toast.success(`Appointment scheduled for: ${data.appointmentTime}`);
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-[280px] flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="appointmentTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Appointment time</FormLabel>
              <FormControl>
                <TimePicker
                  value={field.value}
                  onValueChange={field.onChange}
                  className="w-[280px]"
                >
                  <TimePickerInputGroup>
                    <TimePickerInput segment="hour" />
                    <TimePickerSeparator />
                    <TimePickerInput segment="minute" />
                    <TimePickerInput segment="period" />
                    <TimePickerTrigger />
                  </TimePickerInputGroup>
                  <TimePickerContent>
                    <TimePickerHour />
                    <TimePickerMinute />
                    <TimePickerPeriod />
                  </TimePickerContent>
                </TimePicker>
              </FormControl>
              <FormDescription>
                Select your preferred appointment time.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Schedule appointment</Button>
      </form>
    </Form>
  );
}

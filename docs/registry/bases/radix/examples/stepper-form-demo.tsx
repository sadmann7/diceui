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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperNext,
  StepperPrev,
  type StepperProps,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/registry/bases/radix/ui/stepper";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  website: z.url("Please enter a valid URL").optional().or(z.literal("")),
});

type FormSchema = z.infer<typeof formSchema>;

const steps = [
  {
    value: "personal",
    title: "Personal Details",
    description: "Enter your basic information",
    fields: ["firstName", "lastName", "email"] as const,
  },
  {
    value: "about",
    title: "About You",
    description: "Tell us more about yourself",
    fields: ["bio"] as const,
  },
  {
    value: "professional",
    title: "Professional Info",
    description: "Add your professional details",
    fields: ["company", "website"] as const,
  },
];

export default function StepperFormDemo() {
  const [step, setStep] = React.useState("personal");

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      bio: "",
      company: "",
      website: "",
    },
  });

  const stepIndex = steps.findIndex((s) => s.value === step);

  const onValidate: NonNullable<StepperProps["onValidate"]> = React.useCallback(
    async (_value, direction) => {
      if (direction === "prev") return true;

      const stepData = steps.find((s) => s.value === step);
      if (!stepData) return true;

      const isValid = await form.trigger(stepData.fields);

      if (!isValid) {
        toast.info("Please complete all required fields to continue");
      }

      return isValid;
    },
    [form, step],
  );

  const onSubmit = React.useCallback((input: FormSchema) => {
    toast.success(
      <pre className="w-full">{JSON.stringify(input, null, 2)}</pre>,
    );
  }, []);

  return (
    <Form {...form}>
      <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
        <Stepper value={step} onValueChange={setStep} onValidate={onValidate}>
          <StepperList>
            {steps.map((step) => (
              <StepperItem key={step.value} value={step.value}>
                <StepperTrigger>
                  <StepperIndicator />
                  <div className="flex flex-col gap-px">
                    <StepperTitle>{step.title}</StepperTitle>
                    <StepperDescription>{step.description}</StepperDescription>
                  </div>
                </StepperTrigger>
                <StepperSeparator className="mx-4" />
              </StepperItem>
            ))}
          </StepperList>
          <StepperContent value="personal">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </StepperContent>
          <StepperContent value="about">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about yourself..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Write a brief description about yourself.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </StepperContent>
          <StepperContent value="professional">
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional: Your personal or company website.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </StepperContent>
          <div className="mt-4 flex justify-between">
            <StepperPrev asChild>
              <Button variant="outline">Previous</Button>
            </StepperPrev>
            <div className="text-muted-foreground text-sm">
              Step {stepIndex + 1} of {steps.length}
            </div>
            {stepIndex === steps.length - 1 ? (
              <Button type="submit">Complete</Button>
            ) : (
              <StepperNext asChild>
                <Button>Next</Button>
              </StepperNext>
            )}
          </div>
        </Stepper>
      </form>
    </Form>
  );
}

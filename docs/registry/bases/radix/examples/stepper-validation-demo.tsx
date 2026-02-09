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
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  email: z.email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
});

type FormSchema = z.infer<typeof formSchema>;

const steps = [
  {
    value: "account",
    title: "Account Setup",
    description: "Create your account",
    fields: ["username", "email"] as const,
  },
  {
    value: "profile",
    title: "Profile Info",
    description: "Complete your profile",
    fields: ["firstName", "lastName", "bio"] as const,
  },
  {
    value: "review",
    title: "Review",
    description: "Review your information",
    fields: [] as const,
  },
];

export default function StepperValidationDemo() {
  const [step, setStep] = React.useState("account");

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      bio: "",
    },
  });

  const stepIndex = React.useMemo(
    () => steps.findIndex((s) => s.value === step),
    [step],
  );

  const onValidate: NonNullable<StepperProps["onValidate"]> = React.useCallback(
    async (_value, direction) => {
      if (direction === "prev") return true;

      const stepData = steps.find((s) => s.value === step);
      if (!stepData) return true;

      const isValid = await form.trigger(stepData.fields);

      if (!isValid) {
        toast.info("Please complete all required fields to continue", {
          description: "Fix the validation errors and try again.",
        });
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
                  <div className="flex flex-col gap-1">
                    <StepperTitle>{step.title}</StepperTitle>
                    <StepperDescription>{step.description}</StepperDescription>
                  </div>
                </StepperTrigger>
                <StepperSeparator className="mx-4" />
              </StepperItem>
            ))}
          </StepperList>
          <StepperContent
            value="account"
            className="flex flex-col gap-4 rounded-md border bg-card p-4 text-card-foreground"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </StepperContent>
          <StepperContent
            value="profile"
            className="flex flex-col gap-4 rounded-md border bg-card p-4 text-card-foreground"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
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
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about yourself..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </StepperContent>
          <StepperContent
            value="review"
            className="grid grid-cols-2 gap-4 rounded-md border bg-card p-4 text-card-foreground lg:grid-cols-3"
          >
            <div className="flex flex-col gap-1 rounded-md border p-2">
              <span className="font-medium text-sm">Username</span>
              <p className="text-sm">
                {form.watch("username") ?? "Not provided"}
              </p>
            </div>
            <div className="flex flex-col gap-1 rounded-md border p-2">
              <span className="font-medium text-sm">Email</span>
              <p className="text-sm">{form.watch("email") ?? "Not provided"}</p>
            </div>
            <div className="flex flex-col gap-1 rounded-md border p-2">
              <span className="font-medium text-sm">First Name</span>
              <p className="text-sm">
                {form.watch("firstName") ?? "Not provided"}
              </p>
            </div>
            <div className="flex flex-col gap-1 rounded-md border p-2">
              <span className="font-medium text-sm">Last Name</span>
              <p className="text-sm">
                {form.watch("lastName") ?? "Not provided"}
              </p>
            </div>
            <div className="flex flex-col gap-1 rounded-md border p-2">
              <span className="font-medium text-sm">Bio</span>
              <p className="text-sm">{form.watch("bio") ?? "Not provided"}</p>
            </div>
          </StepperContent>
          <div className="flex justify-between">
            <StepperPrev asChild>
              <Button type="button" variant="outline">
                Previous
              </Button>
            </StepperPrev>
            <div className="text-muted-foreground text-sm">
              Step {stepIndex + 1} of {steps.length}
            </div>
            {stepIndex === steps.length - 1 ? (
              <Button type="submit">Complete Setup</Button>
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

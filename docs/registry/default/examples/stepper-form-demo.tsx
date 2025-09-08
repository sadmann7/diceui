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
  StepperItem,
  StepperItemDescription,
  StepperItemIndicator,
  StepperItemSeparator,
  StepperItemTitle,
  StepperItemTrigger,
  StepperList,
} from "@/registry/default/ui/stepper";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
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
  const [currentStep, setCurrentStep] = React.useState("personal");

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

  const currentIndex = steps.findIndex((step) => step.value === currentStep);

  const validateStep = React.useCallback(
    async (stepValue: string) => {
      const step = steps.find((s) => s.value === stepValue);
      if (!step) return false;
      const isValid = await form.trigger(step.fields);
      return isValid;
    },
    [form],
  );

  const nextStep = React.useCallback(async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      const nextIndex = Math.min(currentIndex + 1, steps.length - 1);
      setCurrentStep(steps[nextIndex]?.value ?? "");
    }
  }, [currentIndex, currentStep, validateStep]);

  const prevStep = React.useCallback(() => {
    const prevIndex = Math.max(currentIndex - 1, 0);
    setCurrentStep(steps[prevIndex]?.value ?? "");
  }, [currentIndex]);

  const onSubmit = React.useCallback((input: FormSchema) => {
    toast.success(
      <pre className="w-full">{JSON.stringify(input, null, 2)}</pre>,
    );
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stepper value={currentStep}>
          <StepperList>
            {steps.map((step, index) => (
              <StepperItem key={step.value} value={step.value}>
                <StepperItemTrigger value={step.value}>
                  <StepperItemIndicator value={step.value}>
                    {index + 1}
                  </StepperItemIndicator>
                </StepperItemTrigger>
                <div className="mt-2 flex flex-col items-center gap-1">
                  <StepperItemTitle>{step.title}</StepperItemTitle>
                  <StepperItemDescription>
                    {step.description}
                  </StepperItemDescription>
                </div>
                {index < steps.length - 1 && (
                  <StepperItemSeparator completed={index < currentIndex} />
                )}
              </StepperItem>
            ))}
          </StepperList>
          <StepperContent value="personal">
            <div className="space-y-4">
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
            <div className="space-y-4">
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
          <div className="mt-6 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>
            <div className="text-muted-foreground text-sm">
              Step {currentIndex + 1} of {steps.length}
            </div>
            {currentIndex === steps.length - 1 ? (
              <Button type="submit">Complete</Button>
            ) : (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            )}
          </div>
        </Stepper>
      </form>
    </Form>
  );
}

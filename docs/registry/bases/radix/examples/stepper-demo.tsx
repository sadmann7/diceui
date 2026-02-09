import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperSeparator,
  StepperTrigger,
} from "@/registry/bases/radix/ui/stepper";

const steps = [
  {
    value: "account",
    title: "Account Setup",
    description: "Create your account and verify email",
  },
  {
    value: "profile",
    title: "Profile Information",
    description: "Add your personal details and preferences",
  },
  {
    value: "payment",
    title: "Payment Details",
    description: "Set up billing and payment methods",
  },
  {
    value: "complete",
    title: "Complete Setup",
    description: "Review and finish your account setup",
  },
];

export default function StepperDemo() {
  return (
    <Stepper defaultValue="account" className="w-full max-w-md">
      <StepperList>
        {steps.map((step) => (
          <StepperItem key={step.value} value={step.value}>
            <StepperTrigger>
              <StepperIndicator />
            </StepperTrigger>
            <StepperSeparator />
          </StepperItem>
        ))}
      </StepperList>
      {steps.map((step) => (
        <StepperContent
          key={step.value}
          value={step.value}
          className="flex flex-col items-center gap-4 rounded-md border bg-card p-4 text-card-foreground"
        >
          <div className="flex flex-col items-center gap-px text-center">
            <h3 className="font-semibold text-lg">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </div>
          <p className="text-sm">Content for {step.title} goes here.</p>
        </StepperContent>
      ))}
    </Stepper>
  );
}

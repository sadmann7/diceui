import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/registry/default/ui/stepper";

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
    <Stepper defaultValue="profile">
      <StepperList>
        {steps.map((step, index) => (
          <StepperItem key={step.value} value={step.value}>
            <StepperTrigger>
              <StepperIndicator>{index + 1}</StepperIndicator>
            </StepperTrigger>
            <div className="mt-2 flex flex-col items-center gap-1">
              <StepperTitle>{step.title}</StepperTitle>
              <StepperDescription>{step.description}</StepperDescription>
            </div>
            {index < steps.length - 1 && (
              <StepperSeparator completed={index < 1} />
            )}
          </StepperItem>
        ))}
      </StepperList>
      {steps.map((step) => (
        <StepperContent key={step.value} value={step.value}>
          <div className="rounded-lg border p-6 text-center">
            <h3 className="mb-2 font-semibold text-lg">{step.title}</h3>
            <p className="mb-4 text-muted-foreground">{step.description}</p>
            <p className="text-sm">Content for {step.title} goes here.</p>
          </div>
        </StepperContent>
      ))}
    </Stepper>
  );
}

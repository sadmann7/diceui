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
    value: "step1",
    title: "Step 1",
    description: "First step with loop navigation",
  },
  {
    value: "step2",
    title: "Step 2",
    description: "Second step with loop navigation",
  },
  {
    value: "step3",
    title: "Step 3",
    description: "Third step with loop navigation",
  },
];

export default function StepperLoopDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-2 font-semibold text-lg">With Loop Navigation</h3>
        <p className="mb-4 text-muted-foreground text-sm">
          Use arrow keys to navigate. Navigation wraps around from last to first
          step.
        </p>
        <Stepper defaultValue="step1" loop>
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
                <StepperSeparator />
              </StepperItem>
            ))}
          </StepperList>
          {steps.map((step) => (
            <StepperContent key={step.value} value={step.value}>
              <div className="rounded-lg border p-6 text-center">
                <h4 className="mb-2 font-semibold">{step.title}</h4>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </div>
            </StepperContent>
          ))}
        </Stepper>
      </div>
      <div>
        <h3 className="mb-2 font-semibold text-lg">Without Loop Navigation</h3>
        <p className="mb-4 text-muted-foreground text-sm">
          Use arrow keys to navigate. Navigation stops at first/last step.
        </p>
        <Stepper defaultValue="step1">
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
                <StepperSeparator />
              </StepperItem>
            ))}
          </StepperList>
          {steps.map((step) => (
            <StepperContent key={step.value} value={step.value}>
              <div className="rounded-lg border p-6 text-center">
                <h4 className="mb-2 font-semibold">{step.title}</h4>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </div>
            </StepperContent>
          ))}
        </Stepper>
      </div>
    </div>
  );
}

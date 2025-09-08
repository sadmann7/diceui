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
    value: "placed",
    title: "Order Placed",
    description: "Your order has been successfully placed",
  },
  {
    value: "processing",
    title: "Processing",
    description: "We're preparing your items for shipment",
  },
  {
    value: "shipped",
    title: "Shipped",
    description: "Your order is on its way to you",
  },
  {
    value: "delivered",
    title: "Delivered",
    description: "Order delivered to your address",
  },
];

export default function StepperVerticalDemo() {
  return (
    <Stepper defaultValue="shipped" orientation="vertical">
      <StepperList>
        {steps.map((step, index) => (
          <StepperItem key={step.value} value={step.value}>
            <StepperTrigger>
              <StepperIndicator>{index + 1}</StepperIndicator>
            </StepperTrigger>
            <div className="flex flex-col gap-1">
              <StepperTitle>{step.title}</StepperTitle>
              <StepperDescription>{step.description}</StepperDescription>
            </div>
            {index < steps.length - 1 && (
              <StepperSeparator completed={index < 2} />
            )}
          </StepperItem>
        ))}
      </StepperList>
      {steps.map((step) => (
        <StepperContent key={step.value} value={step.value}>
          <div className="ml-12 rounded-lg border p-4">
            <h4 className="mb-2 font-semibold">{step.title}</h4>
            <p className="text-muted-foreground text-sm">
              Additional details and actions for this step can be placed here.
            </p>
          </div>
        </StepperContent>
      ))}
    </Stepper>
  );
}

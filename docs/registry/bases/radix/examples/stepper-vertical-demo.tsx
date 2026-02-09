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
} from "@/registry/bases/radix/ui/stepper";

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
        {steps.map((step) => (
          <StepperItem key={step.value} value={step.value}>
            <StepperTrigger className="not-last:pb-6">
              <StepperIndicator />
              <div className="flex flex-col gap-1">
                <StepperTitle>{step.title}</StepperTitle>
                <StepperDescription>{step.description}</StepperDescription>
              </div>
            </StepperTrigger>
            <StepperSeparator className="absolute inset-y-0 top-5 left-3.5 -z-10 -order-1 h-full -translate-x-1/2" />
          </StepperItem>
        ))}
      </StepperList>
      {steps.map((step) => (
        <StepperContent
          key={step.value}
          value={step.value}
          className="flex flex-col gap-4 rounded-lg border bg-card p-6 text-card-foreground"
        >
          <div className="flex flex-col gap-px">
            <h4 className="font-semibold">{step.title}</h4>
            <p className="text-muted-foreground text-sm">{step.description}</p>
          </div>
          <p className="text-sm">
            This is the content for {step.title}. You can add forms,
            information, or any other content here.
          </p>
        </StepperContent>
      ))}
    </Stepper>
  );
}

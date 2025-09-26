"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MaskInput } from "@/registry/default/ui/mask-input";

export default function MaskInputCardInformationDemo() {
  const id = React.useId();
  const [cardNumber, setCardNumber] = React.useState("");
  const [expiryDate, setExpiryDate] = React.useState("");
  const [cvc, setCvc] = React.useState("");
  const [cardNumberValid, setCardNumberValid] = React.useState(true);
  const [expiryValid, setExpiryValid] = React.useState(true);
  const [cvcValid, setCvcValid] = React.useState(true);

  const onSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      toast.success(
        <pre className="w-full">
          {JSON.stringify({ cardNumber, expiryDate, cvc }, null, 2)}
        </pre>,
      );
    },
    [cardNumber, expiryDate, cvc],
  );

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Card information</CardTitle>
          <CardDescription>Enter your card information</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-card-number  `}>Card number</Label>
            <MaskInput
              id={`${id}-card-number`}
              mask="creditCard"
              placeholder="1234 1234 1234 1234"
              value={cardNumber}
              onValueChange={setCardNumber}
              onValidate={setCardNumberValid}
              invalid={!cardNumberValid}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${id}-expiry`}>Expiry date</Label>
              <MaskInput
                id={`${id}-expiry`}
                mask="creditCardExpiry"
                placeholder="MM/YY"
                value={expiryDate}
                onValueChange={setExpiryDate}
                onValidate={setExpiryValid}
                invalid={!expiryValid}
              />
              {!expiryValid && expiryDate && (
                <p className="text-destructive text-sm">
                  Your card's expiration date is invalid.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${id}-cvc`}>CVC</Label>
              <MaskInput
                id={`${id}-cvc`}
                mask={{
                  pattern: "###",
                  transform: (value) => value.replace(/[^0-9]/g, ""),
                  validate: (value) => value.length === 3,
                }}
                placeholder="123"
                value={cvc}
                onValueChange={setCvc}
                onValidate={setCvcValid}
                invalid={!cvcValid}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

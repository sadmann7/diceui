import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
  PhoneInput,
  PhoneInputCountrySelect,
  PhoneInputField,
} from "@/registry/default/ui/phone-input";

const FormSchema = z.object({
  phone: z.string().min(1, {
    message: "Phone number is required.",
  }),
  country: z.string().min(1, {
    message: "Country is required.",
  }),
});

export default function PhoneInputFormDemo() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      phone: "",
      country: "US",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const country = data.country;
    const phoneNumber = data.phone;

    toast.success("Phone number submitted", {
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">
            {JSON.stringify({ country, phone: phoneNumber }, null, 2)}
          </code>
        </pre>
      ),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <PhoneInput
                  value={field.value}
                  onValueChange={field.onChange}
                  country={form.watch("country")}
                  onCountryChange={(country) =>
                    form.setValue("country", country)
                  }
                  required
                >
                  <PhoneInputCountrySelect />
                  <PhoneInputField />
                </PhoneInput>
              </FormControl>
              <FormDescription>
                Enter your phone number with country code.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

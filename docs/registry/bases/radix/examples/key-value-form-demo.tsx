"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
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
import { Input } from "@/components/ui/input";
import {
  KeyValue,
  KeyValueAdd,
  KeyValueItem,
  KeyValueKeyInput,
  KeyValueList,
  KeyValueRemove,
  KeyValueValueInput,
} from "@/registry/bases/radix/ui/key-value";

const formSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  envVariables: z
    .array(
      z.object({
        id: z.string(),
        key: z.string().min(1, "Key is required"),
        value: z.string(),
      }),
    )
    .min(1, "At least one environment variable is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function KeyValueFormDemo() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      envVariables: [{ id: "1", key: "", value: "" }],
    },
  });

  const onSubmit = React.useCallback((data: FormValues) => {
    toast.success("Submitted values:", {
      description: (
        <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <FormField
          control={form.control}
          name="projectName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="my-awesome-project" {...field} />
              </FormControl>
              <FormDescription>The name of your project</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="envVariables"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Environment Variables</FormLabel>
              <FormControl>
                <KeyValue
                  value={field.value}
                  onValueChange={field.onChange}
                  keyPlaceholder="KEY"
                  valuePlaceholder="value"
                  onKeyValidate={(key) => {
                    if (!key) return "Key is required";
                    if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) {
                      return "Key must be uppercase with underscores";
                    }
                    return undefined;
                  }}
                  allowDuplicateKeys={false}
                >
                  <KeyValueList>
                    <KeyValueItem>
                      <KeyValueKeyInput className="flex-1" />
                      <KeyValueValueInput className="flex-1" />
                      <KeyValueRemove />
                    </KeyValueItem>
                  </KeyValueList>
                  <KeyValueAdd />
                </KeyValue>
              </FormControl>
              <FormDescription>
                Add environment variables for your project. Supports pasting
                multiple lines in KEY=VALUE format.
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

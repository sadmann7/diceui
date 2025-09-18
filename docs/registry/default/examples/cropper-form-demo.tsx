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
import { Label } from "@/components/ui/label";
import {
  Cropper,
  CropperArea,
  type CropperAreaData,
  CropperImage,
  type CropperPoint,
} from "@/registry/default/ui/cropper";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  image: z.string().url("Please select an image"),
  cropData: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function CropperFormDemo() {
  const [crop, setCrop] = React.useState<CropperPoint>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    React.useState<CropperAreaData | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&auto=format&fm=webp&q=80",
      cropData: { x: 0, y: 0, width: 0, height: 0 },
    },
  });

  const onCropComplete = React.useCallback(
    (_: CropperAreaData, croppedAreaPixels: CropperAreaData) => {
      setCroppedAreaPixels(croppedAreaPixels);
      form.setValue("cropData", croppedAreaPixels);
    },
    [form],
  );

  function onSubmit(values: FormValues) {
    toast.success("Profile Updated", {
      description: (
        <div className="space-y-1">
          <div>Name: {values.name}</div>
          <div>
            Crop: {values.cropData.width}×{values.cropData.height} at (
            {values.cropData.x}, {values.cropData.y})
          </div>
        </div>
      ),
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
                </FormControl>
                <FormDescription>
                  This will be displayed on your profile.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="rounded-md border">
              <Cropper
                aspectRatio={1}
                crop={crop}
                zoom={zoom}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                className="h-80"
                shape="circular"
              >
                <CropperImage
                  src={form.watch("image")}
                  alt="Profile picture"
                  crossOrigin="anonymous"
                />
                <CropperArea />
              </Cropper>
            </div>
            {croppedAreaPixels && (
              <p className="text-muted-foreground text-sm">
                Crop area: {croppedAreaPixels.width}×{croppedAreaPixels.height}{" "}
                pixels
              </p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Save Profile
          </Button>
        </form>
      </Form>
    </div>
  );
}

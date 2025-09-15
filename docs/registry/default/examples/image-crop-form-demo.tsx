"use client";

import { Upload } from "lucide-react";
import * as React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/default/ui/avatar";
import { Button } from "@/registry/default/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/registry/default/ui/card";
import * as ImageCrop from "@/registry/default/ui/image-crop";
import { Input } from "@/registry/default/ui/input";
import { Label } from "@/registry/default/ui/label";

export default function ImageCropFormDemo() {
  const [src, setSrc] = React.useState<string>();
  const [cropValue, setCropValue] = React.useState({
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [croppedImage, setCroppedImage] = React.useState<string>();
  const [name, setName] = React.useState("John Doe");
  const [email, setEmail] = React.useState("john@example.com");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSrc(url);
    }
  };

  const handleCropComplete = async () => {
    if (!src || !cropValue) return;

    // In a real implementation, you would process the crop here
    // For demo purposes, we'll just use the original image
    setCroppedImage(src);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", {
      name,
      email,
      profileImage: croppedImage,
      cropSettings: { cropValue, zoom, rotation },
    });
    alert("Profile updated successfully!");
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Update Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar-upload">Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={croppedImage} alt={name} />
                      <AvatarFallback>
                        {name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                </div>

                {croppedImage && (
                  <div className="flex gap-2">
                    <Button type="submit">Update Profile</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSrc(undefined);
                        setCroppedImage(undefined);
                      }}
                    >
                      Remove Image
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {src ? (
                  <ImageCrop.Root
                    src={src}
                    alt="Profile picture crop"
                    value={cropValue}
                    onValueChange={setCropValue}
                    zoom={zoom}
                    onZoomChange={setZoom}
                    rotation={rotation}
                    onRotationChange={setRotation}
                    aspect={1}
                    cropShape="round"
                    onCropComplete={(croppedArea, croppedAreaPixels) => {
                      console.log("Crop complete:", {
                        croppedArea,
                        croppedAreaPixels,
                      });
                    }}
                  >
                    <ImageCrop.CropArea />

                    <ImageCrop.Controls>
                      <ImageCrop.ZoomSlider />
                      <ImageCrop.RotateButton direction="left" />
                      <ImageCrop.RotateButton direction="right" />
                      <ImageCrop.ResetButton />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCropComplete}
                      >
                        Apply Crop
                      </Button>
                    </ImageCrop.Controls>
                  </ImageCrop.Root>
                ) : (
                  <div className="flex aspect-square w-full max-w-md items-center justify-center rounded-lg border-2 border-muted-foreground/25 border-dashed bg-muted/50 text-muted-foreground">
                    <div className="text-center">
                      <Upload className="mx-auto mb-2 h-8 w-8" />
                      <p className="text-sm">Upload an image to crop</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

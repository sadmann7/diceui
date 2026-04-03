"use client";

import { Info } from "lucide-react";
import * as React from "react";
import {
  Banner,
  BannerActions,
  BannerClose,
  BannerContent,
  BannerDescription,
  BannerIcon,
  BannerTitle,
} from "@/registry/bases/base/ui/banner";
import { Button } from "@/registry/bases/base/ui/button";

export default function BannerDemo() {
  const [open, setOpen] = React.useState(true);

  return (
    <>
      <Banner open={open} onOpenChange={setOpen}>
        <BannerIcon>
          <Info />
        </BannerIcon>
        <BannerContent>
          <BannerTitle>New update available</BannerTitle>
          <BannerDescription>
            A new version of the app is available. Update now to get the latest
            features.
          </BannerDescription>
        </BannerContent>
        <BannerActions>
          <Button size="sm">Update now</Button>
          <BannerClose />
        </BannerActions>
      </Banner>
      {!open && <Button onClick={() => setOpen(true)}>Show banner</Button>}
    </>
  );
}

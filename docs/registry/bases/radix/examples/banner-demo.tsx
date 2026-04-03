"use client";

import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import * as React from "react";
import {
  Banner,
  BannerActions,
  BannerClose,
  BannerContent,
  BannerDescription,
  BannerIcon,
  Banners,
  BannerTitle,
  useBanner,
  useBanners,
} from "@/registry/bases/radix/ui/banner";
import { Button } from "@/registry/bases/radix/ui/button";

function BannerDemo() {
  return (
    <Banners>
      <div className="flex w-full flex-col gap-6">
        <SimpleExample />
        <StackedExample />
      </div>
    </Banners>
  );
}

function SimpleExample() {
  const [open, setOpen] = React.useState(true);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold text-base">Simple Banner</h3>
      {open ? (
        <Banner variant="info" open={open} onOpenChange={setOpen}>
          <BannerIcon>
            <Info />
          </BannerIcon>
          <BannerContent>
            <BannerTitle>New update available</BannerTitle>
            <BannerDescription>
              A new version of the app is available. Update now to get the
              latest features.
            </BannerDescription>
          </BannerContent>
          <BannerActions>
            <Button size="sm" variant="ghost">
              Later
            </Button>
            <Button size="sm" variant="default">
              Update Now
            </Button>
          </BannerActions>
          <BannerClose />
        </Banner>
      ) : (
        <Button onClick={() => setOpen(true)} variant="outline">
          Show Banner
        </Button>
      )}
    </div>
  );
}

function WarningBannerContent() {
  const { onClose } = useBanner();

  return (
    <>
      <BannerIcon>
        <AlertTriangle />
      </BannerIcon>
      <BannerContent>
        <BannerTitle>Warning</BannerTitle>
        <BannerDescription>
          Please review your changes before continuing.
        </BannerDescription>
      </BannerContent>
      <BannerActions>
        <Button size="sm" variant="ghost" onClick={onClose}>
          Skip
        </Button>
        <Button size="sm" variant="default">
          Review
        </Button>
      </BannerActions>
    </>
  );
}

function StackedExample() {
  const { onBannerAdd, banners } = useBanners();

  const onAddInfoBanner = React.useCallback(() => {
    onBannerAdd({
      variant: "info",
      dismissible: true,
      content: (
        <>
          <BannerIcon>
            <Info />
          </BannerIcon>
          <BannerContent>
            <BannerTitle>Information</BannerTitle>
            <BannerDescription>
              This is an informational message.
            </BannerDescription>
          </BannerContent>
        </>
      ),
    });
  }, [onBannerAdd]);

  const onAddSuccessBanner = React.useCallback(() => {
    onBannerAdd({
      variant: "success",
      dismissible: true,
      duration: 5000,
      content: (
        <>
          <BannerIcon>
            <CheckCircle />
          </BannerIcon>
          <BannerContent>
            <BannerTitle>Success!</BannerTitle>
            <BannerDescription>
              Your changes have been saved successfully.
            </BannerDescription>
          </BannerContent>
        </>
      ),
    });
  }, [onBannerAdd]);

  const onAddWarningBanner = React.useCallback(() => {
    onBannerAdd({
      variant: "warning",
      content: <WarningBannerContent />,
    });
  }, [onBannerAdd]);

  const onAddDestructiveBanner = React.useCallback(() => {
    onBannerAdd({
      variant: "destructive",
      dismissible: true,
      content: (
        <>
          <BannerIcon>
            <AlertCircle />
          </BannerIcon>
          <BannerContent>
            <BannerTitle>Action Required</BannerTitle>
            <BannerDescription>
              Your session is about to expire. Please save your work.
            </BannerDescription>
          </BannerContent>
          <BannerActions>
            <BannerClose asChild>
              <Button size="sm" variant="ghost">
                Dismiss
              </Button>
            </BannerClose>
            <Button size="sm" variant="destructive">
              Save Now
            </Button>
          </BannerActions>
        </>
      ),
    });
  }, [onBannerAdd]);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold text-base">
        Stacked Banners ({banners.length} in queue)
      </h3>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onAddInfoBanner} variant="outline" size="sm">
          Add Info Banner
        </Button>
        <Button onClick={onAddSuccessBanner} variant="outline" size="sm">
          Add Success Banner
        </Button>
        <Button onClick={onAddWarningBanner} variant="outline" size="sm">
          Add Warning Banner
        </Button>
        <Button onClick={onAddDestructiveBanner} variant="outline" size="sm">
          Add Destructive Banner
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">
        Only one banner is visible at a time. Additional banners are queued and
        will appear when the current banner is dismissed.
      </p>
    </div>
  );
}

export default BannerDemo;

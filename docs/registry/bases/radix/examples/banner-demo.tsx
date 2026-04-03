"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  ServerCrash,
  Sparkles,
} from "lucide-react";
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
  useBanners,
} from "@/registry/bases/radix/ui/banner";
import { Button } from "@/registry/bases/radix/ui/button";

export default function BannerDemo() {
  return (
    <Banners>
      <div className="flex w-full flex-col gap-6">
        <SimpleExample />
        <StackedExample />
        <PriorityExample />
      </div>
    </Banners>
  );
}

function SimpleExample() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold text-base">Simple Banner</h3>
      <Banner variant="info" open={open} onOpenChange={setOpen}>
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
          <Button size="sm" variant="ghost">
            Later
          </Button>
          <Button size="sm" variant="default">
            Update Now
          </Button>
        </BannerActions>
        <BannerClose />
      </Banner>
      {!open && (
        <Button onClick={() => setOpen(true)} variant="outline">
          Show Banner
        </Button>
      )}
    </div>
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
      content: ({ onClose }) => (
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
      ),
    });
  }, [onBannerAdd]);

  const onAddDestructiveBanner = React.useCallback(() => {
    onBannerAdd({
      variant: "destructive",
      dismissible: false,
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

function PriorityExample() {
  const { onBannerAdd, banners } = useBanners();

  const onAddAppVersionBanner = React.useCallback(() => {
    onBannerAdd({
      variant: "info",
      priority: 0,
      dismissible: true,
      content: (
        <>
          <BannerIcon>
            <Sparkles />
          </BannerIcon>
          <BannerContent>
            <BannerTitle>New version available</BannerTitle>
            <BannerDescription>
              Version 2.0 is now available with exciting new features.
            </BannerDescription>
          </BannerContent>
          <BannerActions>
            <Button size="sm" variant="default">
              Update
            </Button>
          </BannerActions>
        </>
      ),
    });
  }, [onBannerAdd]);

  const onAddSystemHealthBanner = React.useCallback(() => {
    onBannerAdd({
      variant: "destructive",
      priority: 10,
      dismissible: true,
      content: (
        <>
          <BannerIcon>
            <ServerCrash />
          </BannerIcon>
          <BannerContent>
            <BannerTitle>System outage</BannerTitle>
            <BannerDescription>
              Some services are currently unavailable. We&apos;re working on it.
            </BannerDescription>
          </BannerContent>
        </>
      ),
    });
  }, [onBannerAdd]);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold text-base">
        Priority ({banners.length} in queue)
      </h3>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onAddAppVersionBanner} variant="outline" size="sm">
          Add App Version (priority: 0)
        </Button>
        <Button onClick={onAddSystemHealthBanner} variant="outline" size="sm">
          Add System Health (priority: 10)
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">
        Higher priority banners jump ahead in the queue. Try adding version
        first, then system health - system health will show first.
      </p>
    </div>
  );
}

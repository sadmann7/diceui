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

export default function BannerStackedDemo() {
  return (
    <Banners maxVisible={1}>
      <BannerControls />
    </Banners>
  );
}

function BannerControls() {
  const { onBannerAdd, banners } = useBanners();

  const onInfoBannerAdd = React.useCallback(() => {
    onBannerAdd({
      variant: "info",
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
          <BannerClose />
        </>
      ),
    });
  }, [onBannerAdd]);

  const onSuccessBannerAdd = React.useCallback(() => {
    onBannerAdd({
      variant: "success",
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
          <BannerClose />
        </>
      ),
    });
  }, [onBannerAdd]);

  const onWarningBannerAdd = React.useCallback(() => {
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

  const onDestructiveBannerAdd = React.useCallback(() => {
    onBannerAdd({
      variant: "destructive",
      content: (
        <>
          <BannerIcon>
            <AlertCircle />
          </BannerIcon>
          <BannerContent>
            <BannerTitle>Action required</BannerTitle>
            <BannerDescription>
              Your session is about to expire. Please save your work.
            </BannerDescription>
          </BannerContent>
          <BannerActions>
            <Button size="sm" variant="destructive">
              Save now
            </Button>
            <BannerClose />
          </BannerActions>
        </>
      ),
    });
  }, [onBannerAdd]);

  const onAppVersionBannerAdd = React.useCallback(() => {
    onBannerAdd({
      variant: "info",
      priority: 0,
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
            <BannerClose />
          </BannerActions>
        </>
      ),
    });
  }, [onBannerAdd]);

  const onSystemHealthBannerAdd = React.useCallback(() => {
    onBannerAdd({
      variant: "destructive",
      priority: 10,
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
          <BannerClose />
        </>
      ),
    });
  }, [onBannerAdd]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2.5">
        <h3 className="font-semibold text-base">
          Stacked Banners ({banners.length} in queue)
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onInfoBannerAdd} variant="outline" size="sm">
            Add Info
          </Button>
          <Button onClick={onSuccessBannerAdd} variant="outline" size="sm">
            Add Success
          </Button>
          <Button onClick={onWarningBannerAdd} variant="outline" size="sm">
            Add Warning
          </Button>
          <Button onClick={onDestructiveBannerAdd} variant="outline" size="sm">
            Add Destructive
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <h3 className="font-semibold text-base">Priority</h3>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onAppVersionBannerAdd} variant="outline" size="sm">
            App Version (priority: 0)
          </Button>
          <Button onClick={onSystemHealthBannerAdd} variant="outline" size="sm">
            System Health (priority: 10)
          </Button>
        </div>
        <div className="text-muted-foreground text-sm">
          Higher priority banners jump ahead in the queue.
          <br />
          Try adding the app version banner first, then the system health
          banner.
        </div>
      </div>
    </div>
  );
}

import { Info } from "lucide-react";
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
  return (
    <Banner>
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
        <BannerClose size="sm">Later</BannerClose>
        <Button size="sm" variant="default">
          Update Now
        </Button>
      </BannerActions>
      <BannerClose />
    </Banner>
  );
}

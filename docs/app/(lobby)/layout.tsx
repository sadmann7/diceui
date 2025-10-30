import { HomeLayout } from "fumadocs-ui/layouts/home";
import { SiteFooter } from "@/components/site-footer";
import { baseOptions } from "@/config/layout";

interface IndexLayoutProps {
  children: React.ReactNode;
}

export default function IndexLayout({ children }: IndexLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <HomeLayout {...baseOptions}>
        <main className="flex flex-1 items-center">{children}</main>
        <SiteFooter />
      </HomeLayout>
    </div>
  );
}

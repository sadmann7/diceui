import { SiteFooter } from "@/components/site-footer";
import { HomeLayout } from "fumadocs-ui/layouts/home";

interface IndexLayoutProps {
  children: React.ReactNode;
}

export default function IndexLayout({ children }: IndexLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <HomeLayout>
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </HomeLayout>
    </div>
  );
}

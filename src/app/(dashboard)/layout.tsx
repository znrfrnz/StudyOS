import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/user";
import { DesktopNav, MobileNav } from "@/components/layout/nav";

export const metadata: Metadata = {
  title: {
    default: "StudyOS App",
    template: "%s | StudyOS App",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen lg:flex">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <aside className="border-b border-border bg-card lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-6 py-4 lg:flex-col lg:items-start lg:gap-8 lg:py-8">
          <Link href="/dashboard" className="brand-link">
            <img src="/Logo.svg" alt="StudyOS" className="h-14" />
          </Link>
          <DesktopNav />
        </div>
        <MobileNav />
      </aside>

      <main id="main-content" className="flex-1">
        {children}
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Clock,
  CalendarCheck,
  Calendar,
  HelpCircle,
  LogOut,
  type LucideIcon,
} from "lucide-react";

import { signOut } from "@/features/auth/actions";

const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Sessions", href: "/sessions", icon: CalendarCheck },
  { label: "Subjects", href: "/subjects", icon: BookOpen },
  { label: "Deadlines", href: "/deadlines", icon: CalendarDays },
  { label: "Availability", href: "/availability", icon: Clock },
  { label: "Practice", href: "/practice", icon: HelpCircle },
  { label: "Plan", href: "/plan", icon: Calendar },
];

const mobileNavItems = navItems;

function NavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted"
      }`}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}

export function DesktopNav() {
  return (
    <nav className="hidden lg:flex lg:w-full lg:flex-col lg:gap-1">
      {navItems.map((item) => (
        <NavLink key={item.href} {...item} />
      ))}
      <form action={signOut} className="mt-2">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-5" />
          Sign out
        </button>
      </form>
    </nav>
  );
}

export function MobileNav() {
  return (
    <nav className="flex gap-1 overflow-x-auto px-6 pb-4 lg:hidden">
      {mobileNavItems.map((item) => (
        <NavLink key={item.href} {...item} />
      ))}
      <form action={signOut}>
        <button
          type="submit"
          aria-label="Sign out"
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          <LogOut className="size-4" />
        </button>
      </form>
    </nav>
  );
}

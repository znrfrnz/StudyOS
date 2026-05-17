import type { Metadata } from "next";
import { Geist } from "next/font/google";

import "./globals.css";

export const preferredRegion = "syd1";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "StudyOS",
  title: {
    default: "StudyOS",
    template: "%s | StudyOS",
  },
  description: "Turn study materials, deadlines, and availability into a realistic study plan students can follow.",
  keywords: [
    "study planner",
    "student productivity",
    "study schedule",
    "PDF study tool",
    "exam planner",
  ],
  openGraph: {
    title: "StudyOS",
    description: "Turn study materials, deadlines, and availability into a realistic study plan students can follow.",
    siteName: "StudyOS",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudyOS",
    description: "Turn study materials, deadlines, and availability into a realistic study plan students can follow.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={geistSans.variable}>{children}</body>
    </html>
  );
}

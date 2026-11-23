import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Board",
  description:
    "A learning full-stack task board built with Next.js, Prisma, and SQLite.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.04),_transparent_45%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)] text-foreground">
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ChatBot from "@/components/ChatBot";
import SessionProvider from "@/components/SessionProvider";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BizAutomatrix - Website, SEO & Automation Systems",
  description: "Free audits and 7-day starter implementation for website upgrades, SEO, review automation, inquiry tracking, and AI-assisted workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SessionProvider>{children}</SessionProvider>
        <ChatBot />
      </body>
    </html>
  );
}

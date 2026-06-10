import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import QueryProvider from "@/components/QueryProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "SahayaK - Premium Hyperlocal Assistance",
  description: "A beautiful, accessible hyperlocal volunteer platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 dark:bg-[#0A0A0A] selection:bg-indigo-500/30">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import QueryProvider from "@/components/QueryProvider";
import { OnboardingPopup } from "@/components/OnboardingPopup";
import { GlobalSplash } from "@/components/ui/GlobalSplash";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Toaster } from 'sonner';

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "SahayaK - Premium Hyperlocal Assistance",
  description: "A beautiful, accessible hyperlocal volunteer platform",
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 dark:bg-[#0A0A0A] selection:bg-indigo-500/30" suppressHydrationWarning>
        {/* Google Translate Init */}
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new window.google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,hi,gu',
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
              }, 'google_translate_element');
            }
          `}
        </Script>
        <Script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="afterInteractive" />

        <QueryProvider>
          <ScrollToTop />
          <GlobalSplash />
          <Toaster position="top-center" richColors />
          {children}
          <OnboardingPopup />
        </QueryProvider>
      </body>
    </html>
  );
}

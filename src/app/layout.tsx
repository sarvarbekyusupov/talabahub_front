import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "TALABA HUB";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Talabalar uchun ish, kurs, tadbir va chegirmalar platformasi";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} - Talabalar uchun platforma`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    "talaba",
    "ish",
    "kurs",
    "tadbir",
    "chegirma",
    "student",
    "job",
    "course",
    "event",
    "discount",
    "Uzbekistan",
    "O'zbekiston",
  ],
  authors: [{ name: "TALABA HUB Team" }],
  creator: "TALABA HUB",
  publisher: "TALABA HUB",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} - Talabalar uchun platforma`,
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: APP_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} - Talabalar uchun platforma`,
    description: APP_DESCRIPTION,
    images: ["/og-image.png"],
    creator: "@talabahub",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-gray-50">
        <ToastProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard Uskup Surabaya",
  description: "Sistem Manajemen Data Uskup Keuskupan Surabaya",
  keywords: ["Dashboard", "Uskup", "Surabaya", "Keuskupan", "Katolik"],
  authors: [{ name: "Keuskupan Surabaya" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Dashboard Uskup Surabaya",
    description: "Sistem Manajemen Data Uskup Keuskupan Surabaya",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

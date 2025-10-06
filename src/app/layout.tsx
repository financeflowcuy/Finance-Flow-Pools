import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Batik Pools - Lottery System Terpercaya",
  description: "Nikmati pengalaman bermain lottery yang aman dan terpercaya dengan sistem kriptografi terkini. Hadiah besar, pembayaran instant.",
  keywords: ["Batik Pools", "Lottery", "Togel", "4D", "3D", "2D", "Indonesia", "Terpercaya", "Kriptografi"],
  authors: [{ name: "Batik Pools Team" }],
  openGraph: {
    title: "Batik Pools - Lottery System Terpercaya",
    description: "Nikmati pengalaman bermain lottery yang aman dan terpercaya dengan sistem kriptografi terkini",
    url: "https://batikpools.com",
    siteName: "Batik Pools",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Batik Pools - Lottery System Terpercaya",
    description: "Nikmati pengalaman bermain lottery yang aman dan terpercaya dengan sistem kriptografi terkini",
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}

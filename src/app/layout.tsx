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
<<<<<<< HEAD
  title: "Batik Pools - Lottery System Terpercaya",
  description: "Nikmati pengalaman bermain lottery yang aman dan terpercaya dengan sistem kriptografi terkini. Hadiah besar, pembayaran instant.",
  keywords: ["Batik Pools", "Lottery", "Togel", "4D", "3D", "2D", "Indonesia", "Terpercaya", "Kriptografi"],
  authors: [{ name: "Batik Pools Team" }],
  openGraph: {
    title: "Batik Pools - Lottery System Terpercaya",
    description: "Nikmati pengalaman bermain lottery yang aman dan terpercaya dengan sistem kriptografi terkini",
    url: "https://batikpools.com",
    siteName: "Batik Pools",
=======
  title: "Z.ai Code Scaffold - AI-Powered Development",
  description: "Modern Next.js scaffold optimized for AI-powered development with Z.ai. Built with TypeScript, Tailwind CSS, and shadcn/ui.",
  keywords: ["Z.ai", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "AI development", "React"],
  authors: [{ name: "Z.ai Team" }],
  openGraph: {
    title: "Z.ai Code Scaffold",
    description: "AI-powered development with modern React stack",
    url: "https://chat.z.ai",
    siteName: "Z.ai",
>>>>>>> b54ed963e42b18f24b0debb1a41952154db626e5
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
<<<<<<< HEAD
    title: "Batik Pools - Lottery System Terpercaya",
    description: "Nikmati pengalaman bermain lottery yang aman dan terpercaya dengan sistem kriptografi terkini",
=======
    title: "Z.ai Code Scaffold",
    description: "AI-powered development with modern React stack",
>>>>>>> b54ed963e42b18f24b0debb1a41952154db626e5
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<<<<<<< HEAD
    <html lang="id" suppressHydrationWarning>
=======
    <html lang="en" suppressHydrationWarning>
>>>>>>> b54ed963e42b18f24b0debb1a41952154db626e5
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

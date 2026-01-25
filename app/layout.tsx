import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TextPrism - Professional Message Generator",
  description:
    "The Bridge Between Your Thoughts and AI's Best Output. Generate platform-optimized professional messages for Slack, Email, LinkedIn, Reddit, and Quora.",
  keywords: [
    "AI",
    "prompt generator",
    "professional messages",
    "slack",
    "email",
    "linkedin",
    "reddit",
    "quora",
    "communication",
  ],
  authors: [{ name: "TextPrism Team" }],
  openGraph: {
    title: "TextPrism - Professional Message Generator",
    description: "Generate platform-optimized professional messages with AI",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TextPrism",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TextPrism - Professional Message Generator",
    description: "Generate platform-optimized professional messages with AI",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://innovators.eu.cc"),
  title: {
    default: "Team Innovators Fund | Financial Governance & Treasury",
    template: "%s | Team Innovators Fund",
  },
  description:
    "Official Capital Disbursement, Real-time Ledger & Financial Governance Platform for Team Innovators with ₹1,50,000 RS Capital Pool.",
  applicationName: "Team Innovators Fund",
  keywords: [
    "Team Innovators",
    "Innovators Fund",
    "Treasury Management",
    "Expense Governance",
    "Capital Pool",
    "Financial Audit",
  ],
  authors: [{ name: "Team Innovators" }],
  creator: "Team Innovators",
  publisher: "Team Innovators",
  icons: {
    icon: "/icon.jpg",
    shortcut: "/icon.jpg",
    apple: "/icon.jpg",
  },
  openGraph: {
    title: "Team Innovators Fund | Financial Governance & Treasury",
    description:
      "Official Capital Disbursement, Real-time Ledger & Financial Governance Platform for Team Innovators with ₹1,50,000 RS Capital Pool.",
    url: "https://innovators.eu.cc",
    siteName: "Team Innovators Fund",
    images: [
      {
        url: "/logo.jpg",
        width: 800,
        height: 800,
        alt: "Team Innovators Official Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Team Innovators Fund | Financial Governance & Treasury",
    description:
      "Official Capital Disbursement, Real-time Ledger & Financial Governance Platform for Team Innovators with ₹1,50,000 RS Capital Pool.",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}

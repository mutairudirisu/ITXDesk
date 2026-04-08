import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Montserrat } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";

const montserrat = Montserrat({ subsets: ["latin"] });

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ITX Helpdesk",
  description: "Ticket logging and helpdesk requests",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/ITXDesk.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0074de",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.className} ${geistSans.variable} ${geistMono.variable} antialiased text-[16px] md:text-[17px]`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

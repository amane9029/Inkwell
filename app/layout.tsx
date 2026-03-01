import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { InsforgeProvider } from "./providers";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inkwell",
  description: "A premium, editorial blogging platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-[#0d0d0d] text-[#f0ece4] min-h-screen flex flex-col font-sans`}
      >
        <InsforgeProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
        </InsforgeProvider>
      </body>
    </html>
  );
}

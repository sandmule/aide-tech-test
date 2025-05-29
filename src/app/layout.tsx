import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aide Health Tech Test",
  description: "Aide Health Tech Test",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
<header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Heart Monitor
            </Link>
            <nav className="space-x-6">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Live
              </Link>
              <Link
                href="/history"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                History
              </Link>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto p-4">{children}</main>      </body>
    </html>
  );
}

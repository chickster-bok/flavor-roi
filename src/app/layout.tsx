import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { PantryProvider } from "@/contexts/PantryContext";
import { CookbookProvider } from "@/contexts/CookbookContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { ReviewsProvider } from "@/contexts/ReviewsContext";
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
  title: "Gap Chef",
  description: "Enter your ingredients. Get delicious recipes.",
  keywords: ["cooking", "recipes", "ingredients", "meal planning"],
  authors: [{ name: "Gap Chef" }],
  openGraph: {
    title: "Gap Chef",
    description: "Enter your ingredients. Get delicious recipes.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <AuthProvider>
          <PantryProvider>
            <CookbookProvider>
              <ProfileProvider>
                <ReviewsProvider>
                  {children}
                </ReviewsProvider>
              </ProfileProvider>
            </CookbookProvider>
          </PantryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

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
  title: "The $5 Chef | FlavorROI",
  description: "Scan your ingredients. Get maximum flavor for minimum cost.",
  keywords: ["cooking", "recipes", "ingredients", "meal planning", "budget cooking"],
  authors: [{ name: "FlavorROI" }],
  openGraph: {
    title: "The $5 Chef | FlavorROI",
    description: "Scan your ingredients. Get maximum flavor for minimum cost.",
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

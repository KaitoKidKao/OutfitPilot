import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OutfitPilot",
  description: "Phòng thử đồ ảo cá nhân: thử hai món trên chính bạn rồi quyết định mua.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh font-sans sm:flex sm:items-center sm:justify-center">
        <StoreProvider>
          <div className="relative mx-auto h-dvh w-full max-w-[440px] overflow-hidden bg-white sm:h-[min(880px,calc(100dvh-48px))] sm:rounded-[32px] sm:shadow-lift sm:ring-1 sm:ring-line">
            {children}
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}

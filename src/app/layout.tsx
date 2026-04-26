import type { Metadata, Viewport } from "next";
import { UserProvider } from "@/context/UserContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "유빈 & 문성",
  description: "우리만의 커플 캘린더",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "유빈 & 문성",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F5EFE6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body style={{ fontFamily: "'Pretendard', sans-serif" }}>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
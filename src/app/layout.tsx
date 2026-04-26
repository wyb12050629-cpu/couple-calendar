import type { Metadata, Viewport } from "next";
import { Gaegu, Nanum_Pen_Script, Gowun_Dodum } from "next/font/google";
import { UserProvider } from "@/context/UserContext";
import "./globals.css";

const gaegu = Gaegu({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-header",
  display: "swap",
});

const nanumPenScript = Nanum_Pen_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-handwriting",
  display: "swap",
});

const gowunDodum = Gowun_Dodum({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "💑 유빈 & 문성",
  description: "우리만의 커플 캘린더",
  manifest: "/manifest.json",
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
      <body className={`${gaegu.variable} ${nanumPenScript.variable} ${gowunDodum.variable} font-body antialiased`}>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Noto_Sans_Lao } from "next/font/google";
import "./globals.css";

const notoSansLao = Noto_Sans_Lao({
  subsets: ["lao"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-sans-lao",
});

export const metadata: Metadata = {
  title: "Social Media Task Tracker",
  description: "Employee daily task and social media posting tracker.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="lo"
      className={`${notoSansLao.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

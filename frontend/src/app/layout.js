import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "ResumeFlow - Resume Processing Pipeline",
  description: "Distributed Resume Processing Pipeline with AI-powered matching",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-slate-950 text-white font-[family-name:var(--font-inter)]`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}

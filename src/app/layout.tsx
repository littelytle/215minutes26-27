import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { AppDataProvider } from "@/lib/AppDataContext";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IEP Minute Pro",
  description: "Track IEP minutes by student, subject, and staff.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex font-sans">
        <AppDataProvider>
          <Sidebar />
          <div className="flex-1 min-w-0 flex flex-col">
            <Topbar />
            <main className="flex-1 min-w-0 px-8 py-7">{children}</main>
          </div>
        </AppDataProvider>
      </body>
    </html>
  );
}

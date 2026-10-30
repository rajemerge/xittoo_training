import type { Metadata } from "next";
import { Mukta } from "next/font/google";
import "./globals.css";

const body = Mukta({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Free Technician Training Registration | Xittoo Sewa",
  description:
    "Register for the free 2-month home appliance repair and maintenance training in Banepa.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className={`${body.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

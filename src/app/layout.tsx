import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Account Code Create | Chart of Accounts",
  description: "Account Code Create form built with React & Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

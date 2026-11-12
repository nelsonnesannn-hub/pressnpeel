import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/nav";

export const metadata: Metadata = {
  title: "Press N Peel | Custom Die-Cut Stickers, Vinyl Decals & B2B Labels",
  description:
    "Premium custom die-cut stickers, vinyl decals, heat transfer vinyl, and B2B safety labels. Any shape, glossy or matte finish, printed to order. Start your order today.",
  icons: {
    icon: "/images/press-n-peel-dog-logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/nav";
import CartDrawer from "@/components/cart-drawer";
import { CartProvider } from "@/components/cart-store";
import BackToTop from "@/components/back-to-top";

export const metadata: Metadata = {
  title: "Press N Peel | Custom Die-Cut Stickers, Vinyl Decals & B2B Labels",
  description:
    "Premium custom die-cut stickers, vinyl decals, heat transfer vinyl, and B2B safety labels. Any shape, glossy or matte finish, printed to order. Start your order today.",
  icons: {
    icon: "/images/press-n-peel-logo-light.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="scroll-smooth bg-slate-950 text-slate-100 antialiased">
        <CartProvider>
          <Header />
          <CartDrawer />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </CartProvider>
      </body>
      <BackToTop />
    </html>
  );
}

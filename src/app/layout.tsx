import type { Metadata } from "next";
import { Oswald, Rubik, Cairo } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";

const oswald = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
});

const rubik = Rubik({
  variable: "--font-body-fr",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-body-ar",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "Hamdouni's Chicken — Commander en ligne",
  description: "Poulet grillé au feu de bois — commandez sur place, à emporter ou en livraison. Corniche, Larache.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${oswald.variable} ${rubik.variable} ${cairo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full w-full overflow-x-hidden bg-[var(--hc-bg)] text-[var(--hc-ink)]">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}

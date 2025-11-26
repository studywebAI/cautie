import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Inter, Space_Grotesk, Atkinson_Hyperlegible } from 'next/font/google';
import { cn } from "@/lib/utils";
import { AppContextProvider } from "@/contexts/app-context";

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const fontSpaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const fontAtkinsonHyperlegible = Atkinson_Hyperlegible({
  subsets: ['latin'],
  variable: '--font-atkinson-hyperlegible',
  weight: ['400', '700'],
});


export const metadata: Metadata = {
  title: "StudyWeb",
  description: "The future of learning, powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "font-body antialiased",
        fontInter.variable,
        fontSpaceGrotesk.variable,
        fontAtkinsonHyperlegible.variable
      )}>
        <AppContextProvider>
            {children}
        </AppContextProvider>
        <Toaster />
      </body>
    </html>
  );
}

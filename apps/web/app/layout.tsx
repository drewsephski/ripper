import "./globals.css";
import { Playfair_Display, Space_Grotesk, Syne, DM_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

const dmSansDisplay = DM_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display-alt',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-body-alt',
  weight: ['300', '400', '500', '600', '700'],
});

const themeScript = `
  (function() {
    const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  })();
`;

const fontScript = `
  (function() {
    const font = localStorage.getItem('font');
    if (font === 'alt') {
      document.documentElement.classList.add('font-alt');
    }
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-body", spaceGrotesk.variable, playfair.variable, dmSansDisplay.variable, dmSans.variable)} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: fontScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

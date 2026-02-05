import { Geist, Geist_Mono, Be_Vietnam_Pro } from 'next/font/google';

import { cn } from '@/lib/utils';

// Primary sans-serif font
const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans'
});

// Monospace font for code
const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
});

// Vietnamese-friendly font - primary for this app
const fontBeVietnam = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam'
});

export const fontVariables = cn(
  fontSans.variable,
  fontMono.variable,
  fontBeVietnam.variable
);

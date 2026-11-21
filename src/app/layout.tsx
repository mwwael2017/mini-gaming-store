import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { StoreProvider } from '@/context/store-context';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'NEXUS STORE | Gaming Marketplace',
    template: '%s | NEXUS STORE',
  },
  description:
    'Shop digital gift cards, game keys, gaming accounts, and secure game top-ups with fast delivery.',
  applicationName: 'NEXUS STORE',
  keywords: [
    'gaming store',
    'game keys',
    'gift cards',
    'gaming accounts',
    'game top-ups',
    'digital gaming products',
  ],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[#090D16] font-sans text-slate-100 antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
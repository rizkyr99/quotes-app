import type { Metadata } from 'next';
import { Geist, Geist_Mono, Noto_Serif } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { TRPCReactProvider } from '@/trpc/client';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const andadaPro = Noto_Serif({
  variable: '--font-andanda-pro',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Quotes App',
  description: 'Save and share your favorite quotes from any source.',
  openGraph: {
    type: 'website',
    siteName: 'Quotes App',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang='en' suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${andadaPro.variable} antialiased`}>
          <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
            <TRPCReactProvider>{children}</TRPCReactProvider>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

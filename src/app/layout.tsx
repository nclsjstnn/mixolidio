import type { Metadata } from 'next';
import SessionProvider from '@/components/SessionProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mixolidio - Browser-Based DAW',
  description: 'A browser-based Digital Audio Workstation for creating and mixing audio tracks',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-[#0f1117]">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

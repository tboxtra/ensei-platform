import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ConditionalProviders } from '../components/ConditionalProviders';
import { QueryProvider } from '../providers/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ensei Platform',
  description: 'Mission-based social media engagement platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <ErrorBoundary>
          <QueryProvider>
            <ConditionalProviders>
              {children}
            </ConditionalProviders>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

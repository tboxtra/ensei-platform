import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ConditionalProviders } from '../components/ConditionalProviders';
import { Toaster } from 'react-hot-toast';
import FirebaseBootstrap from './_providers/FirebaseBootstrap';

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
        <FirebaseBootstrap />
        <ErrorBoundary>
          <ConditionalProviders>
            {children}
          </ConditionalProviders>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #374151',
              },
            }}
          />
        </ErrorBoundary>
      </body>
    </html>
  );
}

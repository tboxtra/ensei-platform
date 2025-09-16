import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { UserAuthProvider } from '../contexts/UserAuthContext';
import { FirebaseInitializer } from '../components/FirebaseInitializer';
import { QueryProvider } from '../components/QueryProvider';

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
        <FirebaseInitializer />
        <QueryProvider>
          <UserAuthProvider>
            {children}
          </UserAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

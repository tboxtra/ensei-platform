import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ensei Admin Dashboard',
  description: 'Admin dashboard for Ensei Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-ensei-primary">Ensei Admin</h1>
                </div>
                <div className="flex items-center space-x-4">
                  <a href="/review" className="text-gray-600 hover:text-gray-900">Review Queue</a>
                  <a href="/missions" className="text-gray-600 hover:text-gray-900">Missions</a>
                  <a href="/analytics" className="text-gray-600 hover:text-gray-900">Analytics</a>
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

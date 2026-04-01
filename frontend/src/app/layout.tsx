import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Emosense AI Dashboard',
  description: 'AI-based Emotion Monitoring and Wellbeing System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen flex text-slate-900 bg-slate-50 dark:text-slate-100 dark:bg-[#0c0a1a]">
        <Sidebar />
        <main className="flex-1 max-h-screen overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}

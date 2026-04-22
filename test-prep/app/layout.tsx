import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TestPrep — AI-Powered Interactive Quizzes',
  description:
    'Generate timed, interactive quizzes on any topic. Upload materials, search the web, get instant feedback.',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}

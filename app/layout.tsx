import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NativeSeed — Grow Native, Grow Local',
  description:
    'Location-intelligent native plant recommendations and seed ordering for US gardeners.',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="en">
      <body className="bg-stone-50 text-stone-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}

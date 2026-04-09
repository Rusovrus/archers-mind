import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Archer's Mind",
  description: 'Antrenorul tău mental pentru tir cu arcul',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        {children}
      </body>
    </html>
  );
}

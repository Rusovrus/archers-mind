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
  return children;
}

// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Stream Guru',
  description: 'Discover your next favorite movie',
};

// Here we type the props for our layout component
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* REMOVED all "scrollbar-*" classes from here */}
      <body className={`${inter.className} bg-bg text-text transition-colors duration-300`}>
        <Header />
        <main className="mx-auto max-w-7xl px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
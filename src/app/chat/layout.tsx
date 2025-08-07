// src/app/chat/layout.tsx
import React from 'react';

// This layout is for the standalone chat page.
// It should be minimal and NOT import globals.css or the site Header/Footer.
// The global styles are already applied from the root layout.

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // This div provides the full-screen, dark container for the chat component.
    <div className="flex h-screen w-full items-center justify-center bg-navy p-4">
      {children}
    </div>
  );
}
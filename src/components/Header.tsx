// app/components/Header.tsx
import Link from 'next/link';
import React from 'react';

// We'll make the ThemeSwitcher a separate component later for clean state management.
const ThemeSwitcher: React.FC = () => {
  return (
    <select
      id="themeSelector"
      title="Choose a theme"
      className="cursor-pointer justify-self-end rounded-lg border-none bg-gold px-4 py-2 font-semibold text-navy"
    >
      <option value="">Sunset (default)</option>
      <option value="theme-ocean">Ocean</option>
      <option value="theme-forest">Forest</option>
      <option value="theme-night">Night</option>
    </select>
  );
};

const Header: React.FC = () => {
  return (
    <header className="grid grid-cols-3 items-center bg-navy px-8 py-4 text-gold">
      <div className="justify-self-start text-2xl font-extrabold text-gold">
        StreamGuru
      </div>
      <nav className="flex justify-center gap-8">
        <Link href="/" className="font-semibold text-gray-300 transition-colors hover:text-burgundy">
          Home
        </Link>
        <Link href="/explore" className="font-semibold text-gray-300 transition-colors hover:text-burgundy">
          Explore
        </Link>
        <Link href="/chat" className="font-semibold text-gray-300 transition-colors hover:text-burgundy">
          Chat
        </Link>
        <Link href="/match" className="font-semibold text-gray-300 transition-colors hover:text-burgundy">
          Match Mode
        </Link>
      </nav>
      <div className="justify-self-end">
         <ThemeSwitcher />
      </div>
    </header>
  );
};

export default Header;
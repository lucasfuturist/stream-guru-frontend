import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg': 'var(--bg)',
        'text': 'var(--text)',
        'navy': 'var(--navy)',
        'gold': 'var(--gold)',
        'burgundy': 'var(--burgundy)',
        'modal-bg': '#1a1a2e',
        'modal-title': '#ff6f61',
        'modal-text-primary': '#f0f0f0',
        'modal-text-secondary': '#a0a0b0',
      },
    },
  },
  // The plugins array should now be empty
  plugins: [],
};

export default config;
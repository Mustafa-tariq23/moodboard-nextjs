/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'var(--color-border)',
        ring: 'var(--color-ring)',
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        // Add more custom colors as needed
      },
      // ...existing theme extensions...
    },
  },
  plugins: [
    // ...existing plugins...
  ],
  // Disable the new CSS engine that's causing native binding issues
  future: {
    hoverOnlyWhenSupported: true,
  },
  // Use the stable CSS engine instead of oxide
  experimental: {
    optimizeUniversalDefaults: true,
  }
}

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  // Only scan files that use Tailwind classes
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  // Enable JIT mode for faster builds and smaller CSS
  mode: 'jit',
  // Remove unused styles in production
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      "./src/components/**/*.{js,ts,jsx,tsx}",
      "./src/app/**/*.{js,ts,jsx,tsx}",
    ],
    options: {
      safelist: [
        // Add any dynamic classes that need to be included
        /^bg-/, /^text-/, /^border-/, /^hover:/, /^focus:/
      ]
    }
  },
  theme: {
    extend: {
      // Only extend with necessary utilities
      colors: {
        lamaSky: "#C3EBFA",
        lamaSkyLight: "#EDF9FD",
        lamaPurple: "#CFCEFF",
        lamaPurpleLight: "#F1F0FF",
        lamaYellow: "#FAE27C",
        lamaYellowLight: "#FEFCE8",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.5s ease-in-out',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  // Disable core plugins you don't need
  corePlugins: {
    float: false,
    clear: false,
    // Add other plugins to disable if not needed
  },
  // Enable only the variants you need
  variants: {
    extend: {
      opacity: ['disabled'],
      backgroundColor: ['active', 'hover', 'focus'],
      textColor: ['active', 'hover', 'focus'],
    },
  },
  plugins: [
    // Add only necessary plugins
  ],
};

export default config;

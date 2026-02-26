import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        // Golf theme colors
        'golf-green': {
          50: 'var(--golf-green-50)',
          100: 'var(--golf-green-100)',
          200: 'var(--golf-green-200)',
          300: 'var(--golf-green-300)',
          400: 'var(--golf-green-400)',
          500: 'var(--golf-green-500)',
          600: 'var(--golf-green-600)',
          700: 'var(--golf-green-700)',
          800: 'var(--golf-green-800)',
          900: 'var(--golf-green-900)',
        },
        'golf-gold': {
          50: 'var(--golf-gold-50)',
          100: 'var(--golf-gold-100)',
          200: 'var(--golf-gold-200)',
          300: 'var(--golf-gold-300)',
          400: 'var(--golf-gold-400)',
          500: 'var(--golf-gold-500)',
          600: 'var(--golf-gold-600)',
          700: 'var(--golf-gold-700)',
          800: 'var(--golf-gold-800)',
          900: 'var(--golf-gold-900)',
        },
        'golf-sand': {
          50: 'var(--golf-sand-50)',
          100: 'var(--golf-sand-100)',
          200: 'var(--golf-sand-200)',
          300: 'var(--golf-sand-300)',
          400: 'var(--golf-sand-400)',
          500: 'var(--golf-sand-500)',
          600: 'var(--golf-sand-600)',
        },
        'golf-water': {
          50: 'var(--golf-water-50)',
          100: 'var(--golf-water-100)',
          200: 'var(--golf-water-200)',
          300: 'var(--golf-water-300)',
          400: 'var(--golf-water-400)',
          500: 'var(--golf-water-500)',
          600: 'var(--golf-water-600)',
          700: 'var(--golf-water-700)',
          800: 'var(--golf-water-800)',
          900: 'var(--golf-water-900)',
        },
        "gambler-black": "#0A0A0A",
        "gambler-green": "#00C853",
        "gambler-gold": "#FFD700",
        "gambler-slate": "#1C1C1E",
        "gambler-border": "#3A3A3C",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

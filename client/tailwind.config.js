/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAF8",
        primary: {
          DEFAULT: "#0F7B5F",
          light: "#E0F4EE",
        },
        amber: {
          DEFAULT: "#D97706",
          light: "#FEF3C7",
        },
        purple: {
          DEFAULT: "#6D28D9",
          light: "#EDE9FE",
        },
        coral: {
          DEFAULT: "#DC4A35",
          light: "#FEE8E5",
        },
        success: {
          DEFAULT: "#16A34A",
          light: "#DCFCE7",
        },
        gray: {
          900: "#111827",
          500: "#6B7280",
          300: "#D1D5DB",
          100: "#F3F4F6",
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      borderRadius: {
        '2xl': '16px',
        'pill': '50px',
      },
      boxShadow: {
        'card': '0 1px 4px rgba(0,0,0,0.08)',
      },
      transitionDuration: {
        'fast': '180ms',
      },
      transitionTimingFunction: {
        'ease-out': 'ease-out',
      }
    },
  },
  plugins: [],
}

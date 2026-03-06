/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body:    ['var(--font-body)',    'sans-serif'],
      },
      colors: {
        bg:       'var(--bg)',
        surface:  'var(--surface)',
        surface2: 'var(--surface2)',
        surface3: 'var(--surface3)',
        border1:  'var(--border)',
        border2:  'var(--border2)',
        t1:       'var(--text)',
        t2:       'var(--text2)',
        t3:       'var(--text3)',
        brand:    'var(--brand)',
        brand2:   'var(--brand2)',
      },
      borderRadius: {
        sm: '8px', md: '10px', lg: '12px', xl: '16px', '2xl': '20px', '3xl': '28px',
      },
      animation: {
        'fade-up':      'fadeUp 0.45s ease both',
        'pulse-brand':  'pulse-brand 2s infinite',
        'spin-fast':    'spin 0.7s linear infinite',
      },
    },
  },
  plugins: [],
}

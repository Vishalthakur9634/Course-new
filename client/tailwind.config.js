/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    bg: 'var(--orbit-bg)',
                    layer1: 'var(--orbit-layer1)',
                    layer2: 'var(--orbit-layer2)',
                    text: 'var(--orbit-text)',
                    muted: 'var(--orbit-muted)'
                },
                brand: {
                    primary: 'var(--brand-primary)',
                    hover: 'var(--brand-hover)'
                },
                quantum: {
                    purple: 'var(--quantum-purple)',
                },
                stellar: {
                    gold: 'var(--stellar-gold)',
                }
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}

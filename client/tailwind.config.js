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
                }
            }
        },
    },
    plugins: [],
}

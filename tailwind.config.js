/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                beige: {
                    50: '#fff5f5', // Very pale pinkish white
                    100: '#ffe3e3',
                    200: '#ffc9c9',
                    300: '#ffa8a8', // Salmon-ish
                    400: '#ff8787',
                    500: '#ff6b6b',
                    600: '#fa5252',
                    700: '#f03e3e',
                    800: '#e03131',
                    900: '#c92a2a',
                },
                pink: {
                    50: '#fdf2f8',
                    100: '#fce7f3',
                    200: '#fbcfe8',
                    300: '#f9a8d4',
                    400: '#f472b6',
                    500: '#ec4899',
                    600: '#db2777',
                    700: '#be185d',
                    800: '#9d174d',
                    900: '#831843',
                },
                // Adding a specific 'rose' palette that might replace beige usage if needed,
                // but for now I'm making 'beige' actually be a soft rose/warm palette
                // to instantly update the app's feel without refactoring class names.
                // Let's make 'beige' a very soft, warm, pinkish neutral.
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                serif: ['"Playfair Display"', 'serif'],
            },
            keyframes: {
                'heart-pop': {
                    '0%': { transform: 'scale(0)', opacity: '0' },
                    '50%': { transform: 'scale(1.2)', opacity: '1' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'heart-pulse': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.1)' },
                },
                'heart-particle': {
                    '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
                    '100%': { transform: 'translateY(-100px) scale(0)', opacity: '0' },
                },
                'fade-in-out': {
                    '0%': { opacity: '0' },
                    '20%': { opacity: '1' },
                    '80%': { opacity: '1' },
                    '100%': { opacity: '0' },
                },
                'ballerina-spin': {
                    '0%, 100%': { transform: 'scaleX(1)' },
                    '50%': { transform: 'scaleX(-1)' },
                },
            },
            animation: {
                'heart-pop': 'heart-pop 0.5s ease-out',
                'heart-pulse': 'heart-pulse 1s ease-in-out infinite',
                'heart-particle': 'heart-particle 1.5s ease-out forwards',
                'fade-in-out': 'fade-in-out 2s ease-in-out',
                'ballerina-spin': 'ballerina-spin 0.75s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}

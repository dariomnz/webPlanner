/** @type {import('tailwindcss').Config} */
export default {
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
        },
    },
    plugins: [],
}

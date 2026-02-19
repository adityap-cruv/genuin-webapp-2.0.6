module.exports = {
    plugins: [
        require('@tailwindcss/postcss'),
        require('postcss-prefixwrap')('.genai-sdk-container', {
            ignoredSelectors: [':root', 'html', 'body', '@keyframes'],
        }),
        require('autoprefixer'),
    ],
};

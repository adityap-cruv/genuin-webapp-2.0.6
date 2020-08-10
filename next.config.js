const withCSS = require('@zeit/next-css')
const withImages = require('next-images')
const withFonts = require('next-fonts')
// module.exports = withImages()
module.exports = withImages(withCSS(withFonts({
    webpack(config, options) {
        return config;
    },
    env: {
        // hostname:'http://localhost:3000'
        hostname: 'http://159.89.201.211:4000',
        apiurl: 'http://159.89.201.211:9092',
        genuinurl: 'https://begenuin.com/',
    }
})));

// module.exports = withCSS({
//   cssLoaderOptions: {
//     url: true
//   }
// });
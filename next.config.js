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
        hostname: 'https://app.begenuin.com',
        apiurl: 'http://172.31.47.136:9092',
        genuinurl: 'http://begenuine.com/',
    }
})));

// module.exports = withCSS({
//   cssLoaderOptions: {
//     url: true
//   }
// });
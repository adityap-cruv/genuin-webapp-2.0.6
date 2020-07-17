const withCSS = require('@zeit/next-css')
const withImages = require('next-images')
// module.exports = withImages()
module.exports = withImages(withCSS({
    env: {
        // hostname:'http://localhost:3000'
        hostname: 'http://134.209.152.229:4000',
        node_api: 'http://134.209.152.229:9092',
        genuin_url: 'http://begenuine.com/',
    }
}));
// module.exports = withCSS({
//   cssLoaderOptions: {
//     url: true
//   }
// });
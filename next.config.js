const withCSS = require('@zeit/next-css')
const withImages = require('next-images')
// module.exports = withImages()
module.exports = withImages(withCSS({
    env: {
        // hostname:'http://localhost:3000'
        hostname: 'http://134.209.152.229:4000',
        apiurl: 'http://134.209.152.229:9092',
        genuinurl: 'http://begenuine.com/',
    }
}));
// module.exports = withCSS({
//   cssLoaderOptions: {
//     url: true
//   }
// });
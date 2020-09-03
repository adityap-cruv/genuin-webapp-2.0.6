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
        genuinurl: 'https://begenuin.com/',
        installurl: 'https://install.begenuin.com/86sn?pid=Genuin&is_retargeting=true&af_dp=genuinapp%3A%2F%2Fmainactivity&video_id='
    }
})));

// module.exports = withCSS({
//   cssLoaderOptions: {
//     url: true
//   }
// });

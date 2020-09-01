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
        hostname: 'http://app.qa.begenuin.com',
        apiurl: 'http://159.89.201.211:9092',
        genuinurl: 'https://begenuin.com/',
        installurl: 'https://install.begenuin.com/86sn?pid=Genuin&af_ios_url=https%3A%2F%2Fapps.apple.com%2Fus%2Fapp%2Fitunes-connect%2Fid376771144&is_retargeting=true&af_dp=genuinapp%3A%2F%2Fmainactivity&video_id='
    }
})));

// module.exports = withCSS({
//   cssLoaderOptions: {
//     url: true
//   }
// });
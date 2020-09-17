const withCSS = require('@zeit/next-css')
const withImages = require('next-images')
const withFonts = require('next-fonts')
// module.exports = withImages()
module.exports = withImages(withCSS(withFonts({
    webpack(config, options) {
        return config;
    },
    env: {
        // hostname:'http://localhost:3000',
        hostname: 'https://app.begenuin.com',
        apiurl: 'http://172.31.47.136:9092',
        // apiurl: 'http://localhost:9092',
        genuinurl: 'https://begenuin.com/',
        apps_flyer_url:"https://video.begenuin.com/86sn?pid=Genuin&af_web_dp=http%3A%2F%2Fapp.begenuin.com%2Fvideo%2F{{video_id}}&af_android_url=http%3A%2F%2Fapp.begenuin.com%2Fvideo&af_ios_url=http%3A%2F%2Fapp.begenuin.com%2Fvideo&is_retargeting=true&af_dp=genuinapp%3A%2F%2Fmainactivity&video_id=",
        installurl: 'https://install.begenuin.com/86sn?pid=Genuin&is_retargeting=true&af_dp=genuinapp%3A%2F%2Fmainactivity&video_id='
    }
})));

// module.exports = withCSS({
//   cssLoaderOptions: {
//     url: true
//   }
// });

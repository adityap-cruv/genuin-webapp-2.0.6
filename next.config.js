const withCSS = require('@zeit/next-css')
const withImages = require('next-images')
const withFonts = require('next-fonts')
const webpack = require('webpack')
const withSass = require('@zeit/next-sass')
// module.exports = withImages()
module.exports = withImages(withFonts(withCSS({
    webpack(config, options) {
        config.plugins.push(
            new webpack.ProvidePlugin({
            '$': 'jquery',
            'jQuery': 'jquery',
            'window.jQuery': 'jquery',
            })
        )
        return config;
    },
    env: {
        hostname:'http://localhost:3000',
        //hostname: 'http://app.qa.begenuin.com',
        apiurl: 'http://159.89.201.211:9092',
        // apiurl: 'http://localhost:9092',
        genuinurl: 'https://begenuin.com/',
        apps_flyer_url:"https://video.begenuin.com/86sn?pid=Genuin&af_web_dp=http%3A%2F%2Fapp.qa.begenuin.com%2Fvideo%2F{{video_id}}&af_android_url=http%3A%2F%2Fapp.qa.begenuin.com%2Fvideo&af_ios_url=http%3A%2F%2Fapp.qa.begenuin.com%2Fvideo&is_retargeting=true&af_dp=genuinapp%3A%2F%2Fmainactivity&video_id=",
        installurl: 'https://install.begenuin.com/86sn?pid=Genuin&is_retargeting=true&af_dp=genuinapp%3A%2F%2Fmainactivity&video_id='
    }
})));

// module.exports = withCSS({
//   cssLoaderOptions: {
//     url: true
//   }
// });
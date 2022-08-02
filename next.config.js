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
        hostname: process.env.hostname,
        apiurl: process.env.apiurl,
        genuinurl: process.env.genuinurl,
        apps_flyer_url:process.env.apps_flyer_url,
        rt_apps_flyer_url: process.env.rt_apps_flyer_url,
        qt_apps_flyer_url: process.env.qt_apps_flyer_url,
        profile_apps_flyer_url: process.env.profile_apps_flyer_url,
        record_apps_flyer_url: process.env.record_apps_flyer_url,
        installurl: process.env.installurl,
        ios_app_association: process.env.ios_app_association,
        android_app_association: process.env.android_app_association        
    }
})));

// module.exports = withCSS({
//   cssLoaderOptions: {
//     url: true
//   }
// });

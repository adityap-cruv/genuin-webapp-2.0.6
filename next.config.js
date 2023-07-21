module.exports = {
  env: {
    hostname: process.env.hostname,
    apiurl: process.env.apiurl,
    genuinurl: process.env.genuinurl,
    apps_flyer_url: process.env.apps_flyer_url,
    rt_apps_flyer_url: process.env.rt_apps_flyer_url,
    qt_apps_flyer_url: process.env.qt_apps_flyer_url,
    profile_apps_flyer_url: process.env.profile_apps_flyer_url,
    record_apps_flyer_url: process.env.record_apps_flyer_url,
    installurl: process.env.installurl,
    internalApiurl: process.env.internalApiurl,
    applicationId: process.env.applicationId,
    clientToken: process.env.clientToken,
    site: process.env.site,
    service: process.env.service,
    env: process.env.env
  },
  async headers () {
    return [
      {
        source: '/.well-known/apple-app-site-association',
        headers: [{ key: 'content-type', value: 'application/json' }]
      }
    ]
  },
  reactStrictMode: true
}

import * as rudder from 'rudder-sdk-js'

export function initAnalytics() {
  rudder.load('2TKjFZvo9nt38kcH91svAZ2T1vl', 'https://rudderstack.qa.begenuin.com/v1/batch', {
    onLoaded(analytics) {
      console.log('analytics loaded::', analytics)
    },
  })
}

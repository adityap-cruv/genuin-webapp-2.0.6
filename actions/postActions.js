/* eslint-disable no-plusplus */
/* eslint-disable no-redeclare */
/* eslint-disable block-scoped-var */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable array-callback-return */
/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */

import axios from 'axios'

export function increaseVideoViewCount (share_string, type) {
  return new Promise((resolve, reject) => {
    axios
      .put(process.env.apiurl + '/api/v3/public/video_view/', {
        share_string,
        type
      })
      .then((response) => {
        // console.log("Response from video_view",response)
        resolve({})
      })
      .catch((err) => {
        reject(err)
      })
  })
}

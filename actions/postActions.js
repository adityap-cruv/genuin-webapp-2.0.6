/* eslint-disable no-plusplus */
/* eslint-disable no-redeclare */
/* eslint-disable block-scoped-var */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable array-callback-return */
/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */

import axios from "axios";

export function increaseVideoViewCount(video_id) {
	return new Promise((resolve, reject) => {
		axios.post(process.env.apiurl + "/api/v3/users/video/view/" + video_id)
		.then(response => {
			resolve({});
		})
		.catch((err) => {
			reject(err)
		});
	});
}

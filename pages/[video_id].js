import React from 'react';
import axios from 'axios';
import { Player } from '../components/new/player';
import { Layout } from '../components/new/layout/layout';
import { TopNav } from '../components/new/topNav';

const ShortUrlPage = (props) => {
  return (
    <Layout>
      <TopNav />
      <Player {...props.data} {...props.url} />
    </Layout>
  );
};
ShortUrlPage.getInitialProps = async ({ query: { video_id } }) => {
  return axios
    .get(process.env.apiurl + '/api/v3/users/video/meta_data/' + video_id)
    .then((response) => {
      var resObj = response.data.data;
      var video_id_to_use =
        resObj.video_uuid !== undefined && resObj.video_uuid !== null
          ? resObj.video_uuid
          : video_id;
      Object.assign(resObj, {
        video_id: video_id,
        video_id_to_use: video_id_to_use,
      });
      return Promise.resolve({ data: resObj });
    })
    .catch((err) => {
      return Promise.resolve({ data: {} });
    });
};
export default ShortUrlPage;

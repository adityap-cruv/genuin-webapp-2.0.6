import React from 'react';

import axios from 'axios';
import { Question } from '../../components/new/question';
import { Layout } from '../../components/new/layout';

const QTIndex2 = ({ data, url, genuinurl, host }) => {
  return (
    <Layout>
      <Question {...data} {...url} genuinurl={genuinurl} host={host} />
    </Layout>
  );
};
QTIndex2.getInitialProps = async ({ query: { share_string } }) => {
  if (
    share_string !== undefined &&
    share_string !== null &&
    share_string !== ''
  ) {
    var url_to_use = `${process.env.apiurl}/api/v3/qt/web?question_id=${share_string}`;
    return axios
      .get(url_to_use)
      .then((response) => {
        return Promise.resolve({
          data: response.data.data,
          genuinurl: process.env.genuinurl,
          host: process.env.hostname,
        });
      })
      .catch((err) => {
        return Promise.resolve({ data: {}, genuinurl: process.env.genuinurl });
      });
  } else {
    return Promise.resolve({ data: {}, genuinurl: process.env.genuinurl });
  }
};
export default QTIndex2;

import React, { useState, useEffect } from 'react'
import { useRouter, withRouter } from 'next/router';
import axios from 'axios';
import QTIndexPage from '../../components/qt_index_page';
const QTIndex2 = (props) => {
    const router = useRouter()
    const { share_string } = router.query
  return (
        <QTIndexPage {...props.data} {...props.url} />
  )
}
QTIndex2.getInitialProps = async ({ query: { share_string } }) => {
    if(share_string !== undefined && share_string !== null && share_string !== ''){
        var url_to_use = `${process.env.apiurl}/api/v3/qt/web?question_id=${share_string}`;
        return axios.get(url_to_use)
        .then(response => {
            // console.log('response', response);
            return Promise.resolve({ data: response.data.data })
        })
        .catch((err) => {
            return Promise.resolve({ data: {} })
        });
    }
    else{
        return Promise.resolve({ data: {} })
    }
}
export default QTIndex2;
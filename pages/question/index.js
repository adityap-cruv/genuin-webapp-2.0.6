import { useRouter, withRouter } from 'next/router';
import axios from 'axios';
import React, { useState, useEffect } from 'react'
import QTIndexPage from '../../components/qt_index_page';
const QTIndex = (props) => {
    const router = useRouter()
    const { question_id } = router.query
  return (
        <QTIndexPage {...props.data} {...props.url} />
  )
}
QTIndex.getInitialProps = async ({ query: { question_id } }) => {
    if(question_id !== undefined && question_id !== null && question_id !== ''){
        var url_to_use = `${process.env.apiurl}/api/v3/qt/web?question_id=${question_id}`;
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
export default QTIndex;
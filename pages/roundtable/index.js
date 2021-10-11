import { useRouter, withRouter } from 'next/router';
import axios from 'axios';
import React, { useState, useEffect } from 'react'
import RTIndexPage from '../../components/rt_index_page';
const RTIndex = (props) => {
    const router = useRouter()
    const { chat_id, video_id } = router.query
  return (
        <RTIndexPage {...props.data} {...props.url} />
  )
}
RTIndex.getInitialProps = async ({ query: { chat_id, video_id } }) => {
    if(chat_id !== undefined && chat_id !== null && chat_id !== ''){
        var url_to_use = `${process.env.apiurl}/api/v3/rt/web?chat_id=${chat_id}`;
        if(video_id !== undefined && video_id !== null){
            url_to_use = `${url_to_use}&video_id=${video_id}`
        }
        return axios.get(url_to_use)
        .then(response => {
            console.log('response', response);
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
export default RTIndex;
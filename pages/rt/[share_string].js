import { useRouter, withRouter } from 'next/router';
import axios from 'axios';
import React, { useState, useEffect } from 'react'
import RTIndexPage from '../../components/rt_index_page';
const RTIndex2 = (props) => {
    const router = useRouter()
    const { share_string, v } = router.query
  return (
        <RTIndexPage {...props.data} {...props.url} />
  )
}
RTIndex2.getInitialProps = async ({ query: { share_string, v } }) => {
    if(share_string !== undefined && share_string !== null && share_string !== ''){
        var url_to_use = `${process.env.apiurl}/api/v3/rt/web?chat_id=${share_string}`;
        if(v !== undefined && v !== null){
            url_to_use = `${url_to_use}&video_id=${v}`
        }
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
export default RTIndex2;
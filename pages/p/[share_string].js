import React, { useState, useEffect } from 'react'
import { useRouter, withRouter } from 'next/router';
import axios from 'axios';
import ProfileIndexPage from '../../components/profile_index_page';
const ProfileIndex2 = (props) => {
    const router = useRouter()
    const { share_string } = router.query
  return (
        <ProfileIndexPage {...props.data} {...{url:props.url}} />
  )
}
ProfileIndex2.getInitialProps = async ({ query: { share_string } }) => {
    if(share_string !== undefined && share_string !== null && share_string !== ''){
        var url_to_use = `${process.env.apiurl}/api/v3/p/web?username=${share_string}&start=0&rows=10`;
        return axios.get(url_to_use)
        .then(response => {
            // console.log('response', response.data.data);
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
export default ProfileIndex2;
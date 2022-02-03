import { useRouter, withRouter } from 'next/router';
import axios from 'axios';
import React, { useState, useEffect } from 'react'
import ProfileIndexPage from '../../components/profile_index_page';
const ProfileIndex = (props) => {
    const router = useRouter()
    const { user_id } = router.query
  return (
        <ProfileIndexPage {...props.data} {...props.url} />
  )
}
ProfileIndex.getInitialProps = async ({ query: { user_id } }) => {
    if(user_id !== undefined && user_id !== null && user_id !== ''){
        var url_to_use = `${process.env.apiurl}/api/v3/p/web?user_id=${user_id}`;
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
export default ProfileIndex;
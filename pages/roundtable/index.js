import { useRouter, withRouter } from 'next/router';
import axios from 'axios';
import React, { useState, useEffect } from 'react'
import RTIndexPage from '../../components/rt_index_page';
const RTIndex = (props) => {
    const router = useRouter()
    const { chat_id, start_at } = router.query
  return (
        <RTIndexPage {...props.data} {...props.url} />
  )
}
RTIndex.getInitialProps = async ({ query: { chat_id } }) => {
    return axios.get(process.env.apiurl+ "/api/v3/rt/web?chat_id=" + chat_id)
    .then(response => {
        console.log('response', response);
        return Promise.resolve({ data: response.data.data })
    })
    .catch((err) => {
        return Promise.resolve({ data: {} })
    });
}
export default RTIndex;
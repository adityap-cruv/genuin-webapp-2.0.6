import React, { useState, useEffect } from 'react'
import { useRouter, withRouter } from 'next/router';
import axios from 'axios';
import ProfileIndexPage from '../../components/profile_index_page';
const QRShortUrlPage = (props) => {
    const router = useRouter();
    const { qr_code } = router.query
    return (
        <ProfileIndexPage {...props.data} {...{url:props.url}} />
    );
}
QRShortUrlPage.getInitialProps = async ({ query: { qr_code } }) => {
    return new Promise(function(resolve, reject){
        var url_to_use = `${process.env.apiurl}/api/v3/qr/web?qr_code=${qr_code}`;
        // console.log('api url', url_to_use);
        axios.get(url_to_use)
        .then(response => {
            // console.log('api response', response);
            if(response.data.data.owner.nickname !== undefined && response.data.data.owner.nickname !== null && response.data.data.owner.nickname !== ''){
                var url_to_use2 = `${process.env.apiurl}/api/v3/p/web?username=${response.data.data.owner.nickname}&start=0&rows=10`;
                axios.get(url_to_use2)
                .then(response2 => {
                    var final_response = response2.data.data;
                    final_response['is_record'] = true;
                    final_response['owner'] = response.data.data.owner;
                    resolve({ data: final_response})
                })
                .catch((err) => {
                    console.log('api err', err);
                    resolve({ data: {} })
                });
            }
            else{
                console.log('owner data not found');
                resolve({ data: {} })
            }
        })
        .catch((err) => {
            console.log('api err', err);
            resolve({ data: {} })
        });
    });
}
export default QRShortUrlPage;
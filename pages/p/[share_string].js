import React, { useState, useEffect } from 'react'
import { useRouter, withRouter } from 'next/router';
import Error from 'next/error';
import { NextSeo } from 'next-seo';
import axios from 'axios';
const ProfileShortUrlPage = (props) => {
    const router = useRouter();
    const { share_string } = router.query
    // console.log('share_string', share_string);
    // console.log('v', v);
    useEffect(() => {
        if(share_string !== undefined && share_string !== null && share_string !== ''){
            // console.log('props', props);
            // setTimeout(function(){
                var user_id_to_use = (props.data.user_id !== undefined && props.data.user_id !== null)?props.data.user_id:'';
                var redirect_url = process.env.profile_apps_flyer_url + user_id_to_use;
                redirect_url = redirect_url.replace('{{user_id}}',user_id_to_use);
                // console.log('redirect_url', redirect_url);
                window.location.href = redirect_url;
            // }, 300);
        }
    });
    var currentUrl = process.env.hostname + props.url.asPath;
    var name = props.data.name !== undefined && props.data.name !== null && props.data.name !== '' ? props.data.name+' is on Genuin. Connect with him.' : props.data.nickname+' is on Genuin. Connect with him.';
    var bio = props.data.bio !== undefined && props.data.bio !== null && props.data.bio !== '' ? props.data.bio : '';
    var preview_image = (props.data.preview_image !== undefined && props.data.preview_image !== null)?props.data.preview_image:'';
    return (
        <div>
            <NextSeo
                title={name}
                description={bio}
                openGraph={{
                    type: 'object',
                    url: currentUrl,
                    title: `${name}`,
                    images: [
                        {
                          url: preview_image,
                          width: 1084,
                          height: 546,
                          alt: 'Genuin',
                        },
                        {
                            url: preview_image,
                            width: 300,
                            height: 200,
                            alt: 'Genuin',
                            // type:'image/png'
                        }
                    ],
                    site_name: 'Genuin',
                }}
                facebook={{
                    appId: 1234567890,
                }}
                twitter={{
                    handle: '@handle',
                    site: '@site',
                    cardType: 'summary_large_image',
                }}
            />
            <p>Redirecting...</p>
        </div>
    );
}
ProfileShortUrlPage.getInitialProps = async ({ query: { share_string } }) => {
    var url_to_use = `${process.env.apiurl}/api/v3/p/web?username=${share_string}`;
    return axios.get(url_to_use)
    .then(response => {
        return Promise.resolve({ data: response.data.data })
    })
    .catch((err) => {
        return Promise.resolve({ data: {} })
    });
}
export default ProfileShortUrlPage;
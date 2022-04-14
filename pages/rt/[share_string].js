import React, { useState, useEffect } from 'react'
import { useRouter, withRouter } from 'next/router';
import Error from 'next/error';
import { NextSeo } from 'next-seo';
import axios from 'axios';
const RTShortUrlPage = (props) => {
    const router = useRouter();
    const { share_string, v } = router.query
    // console.log('share_string', share_string);
    // console.log('v', v);
    useEffect(() => {
        if(share_string !== undefined && share_string !== null && share_string !== ''){
            // console.log('props', props);
            // setTimeout(function(){
                var chat_id_to_use = (props.data.chat_id !== undefined && props.data.chat_id !== null)?props.data.chat_id:'';
                var video_id_to_use = '';
                if(props.data.chats !== undefined && props.data.chats !== null && props.data.chats.length > 0){
                    video_id_to_use = props.data.chats[0].conversation_id;
                }
                var redirect_url = process.env.rt_apps_flyer_url + chat_id_to_use;
                redirect_url = redirect_url.replace('{{chat_id}}',chat_id_to_use);
                if(video_id_to_use !== ''){
                    redirect_url = `${redirect_url}&video_id=${video_id_to_use}`;
                }
                console.log('redirect_url', redirect_url);
                window.location.href = redirect_url;
            // }, 300);
        }
    });
    var currentUrl = process.env.hostname + props.url.asPath;
    var description = props.data.group && props.data.group.group_description ? props.data.group.group_description : '';
    // let metaImage = props.data.videoPreviewImage;
    let group_name = props.data.group && props.data.group.group_name ? `${props.data.group.group_name} Roundtable on Genuin` : '';
    return (
        <div>
            <NextSeo
                title="Genuin"
                description={description}
                openGraph={{
                    type: 'object',
                    url: currentUrl,
                    title: `${group_name}`,
                    // description: description,
                    images: [
                        {
                          url: props.data.preview_image,
                          width: 1084,
                          height: 546,
                          alt: 'Genuin',
                        },
                        {
                            url: props.data.preview_image,
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
RTShortUrlPage.getInitialProps = async ({ query: { share_string, v } }) => {
    var url_to_use = `${process.env.apiurl}/api/v3/rt/web?chat_id=${share_string}`;
    if(v !== undefined && v !== null){
        url_to_use = `${url_to_use}&video_id=${v}`
    }
    return axios.get(url_to_use)
    .then(response => {
        return Promise.resolve({ data: response.data.data })
    })
    .catch((err) => {
        return Promise.resolve({ data: {} })
    });
}
export default RTShortUrlPage;
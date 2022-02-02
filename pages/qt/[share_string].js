import React, { useState, useEffect } from 'react'
import { useRouter, withRouter } from 'next/router';
import Error from 'next/error';
import { NextSeo } from 'next-seo';
import axios from 'axios';
const RTShortUrlPage = (props) => {
    const router = useRouter();
    const { share_string } = router.query
    // console.log('share_string', share_string);
    // console.log('v', v);
    useEffect(() => {
        if(share_string !== undefined && share_string !== null && share_string !== ''){
            // console.log('props', props);
            // setTimeout(function(){
                var question_id_to_use = (props.data.question_id !== undefined && props.data.question_id !== null)?props.data.question_id:'';
                var redirect_url = process.env.qt_apps_flyer_url + question_id_to_use;
                redirect_url = redirect_url.replace('{{question_id}}',question_id_to_use);
                console.log('redirect_url', redirect_url);
                window.location.href = redirect_url;
            // }, 300);
        }
    });
    var currentUrl = process.env.hostname + props.url.asPath;
    var question = props.data.question ? 'Question on Genuin: '+props.data.question : '';
    return (
        <div>
            <NextSeo
                title={question}
                description=""
                openGraph={{
                    type: 'object',
                    url: currentUrl,
                    title: `${question}`,
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
RTShortUrlPage.getInitialProps = async ({ query: { share_string } }) => {
    var url_to_use = `${process.env.apiurl}/api/v3/qt/web?question_id=${share_string}`;
    return axios.get(url_to_use)
    .then(response => {
        return Promise.resolve({ data: response.data.data })
    })
    .catch((err) => {
        return Promise.resolve({ data: {} })
    });
}
export default RTShortUrlPage;
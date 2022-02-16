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
    abbreviateNumber = (value) => {
        var newValue = value;
        if (value >= 1000) {
            var suffixes = ["", "k", "m", "b","t"];
            var suffixNum = Math.floor( (""+value).length/3 );
            var shortValue = '';
            for (var precision = 2; precision >= 1; precision--) {
                shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
                var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
                if (dotLessShortValue.length <= 2) { break; }
            }
            if (shortValue % 1 != 0)  shortValue = shortValue.toFixed(1);
            newValue = shortValue+suffixes[suffixNum];
        }
        return newValue;
    }
    var currentUrl = process.env.hostname + props.url.asPath;
    var name_nickname = props.data.name !== undefined && props.data.name !== null && props.data.name !== '' ? props.data.name : props.data.nickname;
    var views_formatted = this.abbreviateNumber(props.data.no_of_views);
    var meta_title = name_nickname+' is on Genuin. Connect with him.';
    var meta_description = `${name_nickname}, ${props.data.no_of_videos} Videos, ${views_formatted} Views, ${props.data.no_of_replies} Replies`;
    var preview_image = (props.data.preview_image !== undefined && props.data.preview_image !== null)?props.data.preview_image:'';
    return (
        <div>
            <NextSeo
                title={meta_title}
                description={meta_description}
                openGraph={{
                    type: 'object',
                    url: currentUrl,
                    title: `${meta_title}`,
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
    var url_to_use = `${process.env.apiurl}/api/v3/p/web?username=${share_string}&start=0&rows=10`;
    return axios.get(url_to_use)
    .then(response => {
        return Promise.resolve({ data: response.data.data })
    })
    .catch((err) => {
        return Promise.resolve({ data: {} })
    });
}
export default ProfileShortUrlPage;
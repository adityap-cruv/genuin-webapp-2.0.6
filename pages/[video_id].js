import React, { useState, useEffect } from 'react'
import { useRouter, withRouter } from 'next/router';
import Error from 'next/error';
import { NextSeo } from 'next-seo';
import axios from 'axios';
const ShortUrlPage = (props) => {
    const router = useRouter();
    const { video_id } = router.query
    // console.log('video_id', video_id);
    useEffect(() => {
        if(video_id !== undefined && video_id !== null && video_id !== ''){
            // setTimeout(function(){
                var video_id_to_use = (props.data.video_uuid !== undefined && props.data.video_uuid !== null)?props.data.video_uuid:video_id;
                var redirect_url = process.env.apps_flyer_url + video_id_to_use;
                redirect_url = redirect_url.replace('{{video_id}}',video_id_to_use);
                console.log('redirect_url', redirect_url);
                window.location.href = redirect_url;
            // }, 300);
        }
    });
    var currentUrl = process.env.hostname + props.url.asPath;
    var description = props.data.description;
    // var videoThumbnail = props.data.videoThumbnail;
    let metaVideo = props.data.videoUrl;
    let metaImage = props.data.videoPreviewImage;
    let metaImageWidth = 280;
    let metaImageHeight = 534;
    let nickName = props.data.userNickname
    // let metaImage2=props.data.videoPreview1200;
    // let metaImage2Width = 280;
    // let metaImage2Height = 534;
    // if (props.data.videoShareImage != '' && props.data.videoShareImage != undefined && props.data.videoShareImage != null) {
    //   metaImage = props.data.videoShareImage;
    //   metaImageWidth = 350;
    //   metaImageHeight = 650;
    // }
    return (
        <div>
            <NextSeo
                title="Genuin"
                description={description}
                openGraph={{
                type: 'website',
                url: currentUrl,
                title: `${nickName}@Genuin`,
                description: description,
                videos:[{
                    url: metaVideo,
                    secure_url: metaVideo,
                    type: "video/mp4",
                    width: "720",
                    height: "1280",
                    alt: 'Genuin'
                }],
                images: [
                    {
                      url: metaImage,
                      width: metaImageWidth,
                      height: metaImageHeight,
                      alt: 'Genuin',
                    },
                    {
                        url: metaImage,
                        width: 300,
                        height: 200,
                        alt: 'Genuin large image',
                      },
                    // {
                    // url: videoThumbnail,
                    // width: 350,
                    // height: 650,
                    // alt: 'Genuin',
                    // }
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
ShortUrlPage.getInitialProps = async ({ query: { video_id } }) => {
    return axios.get(process.env.apiurl+ "/api/v3/users/video/meta_data/" + video_id)
    .then(response => {
        return Promise.resolve({ data: response.data.data })
    })
    .catch((err) => {
        return Promise.resolve({ data: {} })
    });
}
export default ShortUrlPage;
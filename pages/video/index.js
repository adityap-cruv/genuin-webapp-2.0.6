import React from 'react'
import { useRouter, withRouter } from 'next/router';
import Error from 'next/error';
import { NextSeo } from 'next-seo';
const VideoIndex = (props) => {
    const router = useRouter();
    const { video_id } = router.query
    console.log('video_id', video_id);
    if(video_id !== undefined && video_id !== null && video_id !== ''){
        // setTimeout(function(){ 
        //     window.location.href = `${process.env.hostname}/video/${video_id}`
        // }, 300);
        return (
            <div>
                <NextSeo
                    title="Genuin"
                    description="#mac again #thumbs"
                    openGraph={{
                    url: "http://app.qa.begenuin.com/video/23e395e4-36ae-4337-b735-261282450ee5",
                    title: 'Genuin',
                    description: "#mac again #thumbs",
                    images: [
                        // {
                        //   url: metaImage,
                        //   width: metaImageWidth,
                        //   height: metaImageHeight,
                        //   alt: 'Genuin',
                        // },
                        {
                        url: "http://159.89.201.211:9092/thumbnail/919726240815_1594273300669.jpeg",
                        width: 300,
                        height: 200,
                        alt: 'Genuin',
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
    else{
        // return <Error statusCode="404" />;
        return(<p>check</p>); 
    }
}
export default VideoIndex;
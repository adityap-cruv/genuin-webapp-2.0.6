import React from 'react'
import { useRouter, withRouter } from 'next/router';
import Error from 'next/error';
const VideoIndex = (props) => {
    const router = useRouter();
    const { video_id } = router.query
    console.log('video_id', video_id);
    if(video_id !== undefined && video_id !== null && video_id !== ''){
        window.location.href = `${process.env.hostname}/video/${video_id}`
    }
    else{
        return <Error statusCode="404" />;
    }
}
export default VideoIndex;
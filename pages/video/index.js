import React from 'react'
import { useRouter, withRouter } from 'next/router';
const VideoIndex = (props) => {
    const router = useRouter();
    const { video_id } = router.query
    console.log('video_id', video_id);
    if(query.video_id !== undefined && query.video_id !== null && query.video_id !== ''){
        window.location.href = `${process.env.hostname}/video/${query.video_id}`
    }
    return (
        <div>Welcome to Genuin</div>
    )
}
export default VideoIndex;
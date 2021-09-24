import { useRouter, withRouter } from 'next/router';
import Player from '../player';
import axios from 'axios';
const VideoIndex = (props) => {
  console.log(props);
  const router = useRouter()
  const { video_id } = router.query
  // console.log('video_id', video_id)
  return (
    <Player {...props.data} {...props.url} installUrl={process.env.installurl+props.data.video_id_to_use} />
  )
}
VideoIndex.getInitialProps = async ({ query: { video_id } }) => {

  return axios.get(process.env.apiurl+ "/api/v3/users/video/meta_data/" + video_id)
    .then(response => {
      var resObj = response.data.data;
      var video_id_to_use = (resObj.video_uuid !== undefined && resObj.video_uuid !== null)?resObj.video_uuid : video_id;
      Object.assign(resObj,{
        video_id: video_id,
        video_id_to_use: video_id_to_use
      })
      return Promise.resolve({ data: resObj})
    })
    .catch((err) => {
      return Promise.resolve({ data: {} })
    });
}
export default VideoIndex;
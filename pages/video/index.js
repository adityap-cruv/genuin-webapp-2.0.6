import { useRouter, withRouter } from 'next/router';
import Player from '../player';
import axios from 'axios';
const VideoIndex = (props) => {
  console.log(props);
  const router = useRouter()
  const { video_id } = router.query
  // console.log('video_id', video_id)
  return (
    <Player {...props.data} {...props.url} installUrl={process.env.installurl+video_id} />
  )
}
VideoIndex.getInitialProps = async ({ query: { video_id } }) => {

  return axios.post(process.env.apiurl+ "/api/v3/users/video/meta_data/" + video_id)
    .then(response => {
      var resObj = response.data.data;
      Object.assign(resObj,{
        video_id: video_id
      })
      return Promise.resolve({ data: resObj})
    })
    .catch((err) => {
      return Promise.resolve({ data: {} })
    });
}
export default VideoIndex;
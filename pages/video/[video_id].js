import { useRouter, withRouter } from 'next/router';
import Player from '../player';
import axios from 'axios';
const Page = (props) => {
  console.log(props);
  const router = useRouter()
  const { video_id } = router.query
  // console.log('video_id', video_id)
  return (
    <Player {...props.data} {...props.url} installUrl={process.env.installurl+video_id} />
  )
}
Page.getInitialProps = async ({ query: { video_id } }) => {

  return axios.post(process.env.apiurl+ "/api/v3/users/video/meta_data/" + video_id)
    .then(response => {
      return Promise.resolve({ data: response.data.data })
    })
    .catch((err) => {
      return Promise.resolve({ data: {} })
    });
}
export default Page;
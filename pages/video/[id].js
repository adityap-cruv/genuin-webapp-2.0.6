import { useRouter } from 'next/router';
import Player from '../player';
import axios from 'axios';
const Page = (props) => {
  console.log(props);
  return (
    <Player {...props.data} {...props.url} />
  )
}
Page.getInitialProps = async ({ query: { id } }) => {

  return axios.post(process.env.apiurl+ "/api/v3/users/video/meta_data/" + id,{
    headers: { 'User-Agent': req.headers['user-agent'] }
  })
    .then(response => {
      return Promise.resolve({ data: response.data.data })
    })
    .catch((err) => {
      return Promise.resolve({ data: {} })
    });
}
export default Page;
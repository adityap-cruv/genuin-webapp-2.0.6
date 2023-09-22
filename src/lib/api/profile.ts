import axios from 'axios'

export async function getUserData(nickname: string) {
  return axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/user/details', {
      params: {
        nickname: nickname,
      },
    })
    .then((res) => {
      return res.data.data
    })
    .catch((e) => {
      console.log('e::', e)
      // throw new Error('Something went wrong...')
    })
}

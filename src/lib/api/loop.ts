import axios from 'axios'
import { z } from 'zod'

export function getLoopDetails(loopId: string) {
  return async function () {
    return axios
      .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/rt/details?chat_id=' + loopId)
      .then((res) => {
        return res?.data?.data
      })
      .catch((e) => {
        throw new Error('Something went wrong!!')
      })
  }
}

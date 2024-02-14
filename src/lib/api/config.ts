import { type ConfigType } from '@lib/stores/genuin-options'
import axios from 'axios'

export async function getEmbedConfig(params: any) {
  // console.log('params::', params)
  return await axios
    .get(process.env.NEXT_PUBLIC_BRAND_API_URL + '/api/v1/brand/detail', {
      params,
    })
    .then((res) => {
      return res.data.data as ConfigType
    })
    .catch((e) => {
      throw new Error('Something went wrogn::')
    })
}

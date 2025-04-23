import { type ConfigType } from '@lib/stores/genuin-options'

export async function getEmbedConfig(params: Record<string, string>) {
  const url = new URL(process.env.NEXT_PUBLIC_API_URL + '/api/v3/brand/detail')
  Object.keys(params).forEach((key) => {
    url.searchParams.append(key, params[key])
  })
  return await fetch(url.href, {})
    .then(async (res) => {
      const resData = await res.json()
      return resData.data as ConfigType
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('error:;', e)
      throw new Error('Something went wrong::')
    })
}

export async function getIpAddress() {
  return await fetch('https://api.ipify.org?format=json')
    .then(async (res) => await res.json())
    .then((res) => {
      return res.ip
    })
    .catch((e) => {
      console.log('Error in getting ip address.')
    })
}

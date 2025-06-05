import axios from 'axios'

export async function userContactDetails(payload: {
  email?: string
  firstname?: string
  lastname?: string
  company?: string
  company_type?: string
  country?: string
  what_piqued_your_interest_in_genuin_?: string
  company_size?: string
}): Promise<{ status: boolean; user: any }> {
  return await axios
    .post(process.env.NEXT_PUBLIC_API_URL + '/api/v3/contact_us', payload)
    .then((res) => {
      return { status: res.status === 200, user: res.data.data }
    })
    .catch((e) => {
       
      console.log('::ERROR in contact_us api::', e)
      throw new Error('Something went wrong')
    })
}

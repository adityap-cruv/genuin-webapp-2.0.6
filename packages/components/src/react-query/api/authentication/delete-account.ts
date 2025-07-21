import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { API_PATHS } from "@genuin/components/react-query/paths";


export async function deleteUserAccount(): Promise<{ code: number; data: any }> {
  return await axiosInstance
    .delete(API_PATHS.DELETE_ACCOUNT)
    .then((res) => {
      return { code: res.data.code, data: res.data.data }
    })
    .catch((e) => {
      return { code: Number(e?.response?.data.code), data: e?.response?.data.data }
    })
}
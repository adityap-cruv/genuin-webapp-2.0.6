import type { AxiosInstance } from "axios";

import { API_PATHS } from "@genuin/components/react-query/paths";

export async function deleteUserAccount(axios: AxiosInstance): Promise<{ code: number; data: any }> {
  return await axios
    .delete(API_PATHS.DELETE_ACCOUNT)
    .then((res) => {
      return { code: res.data.code, data: res.data.data };
    })
    .catch((e) => {
      return { code: Number(e?.response?.data.code), data: e?.response?.data.data };
    });
}

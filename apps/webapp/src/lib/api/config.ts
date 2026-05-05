import { type ConfigType } from "@lib/stores/genuin-options";

import { toHttpUrl } from "../utils/common/url";

export async function getEmbedConfig(params: Record<string, string>) {
  const url = new URL(toHttpUrl(process.env.NEXT_PUBLIC_GO_API_URL) + "/brand/details");
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value !== undefined) {
      url.searchParams.append(key, value);
    }
  });
  return await fetch(url.href, {
    cache: "force-cache",
    next: { revalidate: 300 }, // Revalidate every 5 minutes
  })
    .then(async (res) => {
      const resData = await res.json();
      return resData.data as ConfigType;
    })
    .catch((e) => {
      console.log("error in getEmbedConfig::", e);
      throw new Error("Something went wrong::");
    });
}

export async function getIpAddress() {
  return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goservices/data/ip_info`, { cache: "no-store" })
    .then(async (res) => await res.json())
    .then((res) => {
      return res.ip;
    })
    .catch((e) => {
      console.log("Error in getting ip address.");
    });
}

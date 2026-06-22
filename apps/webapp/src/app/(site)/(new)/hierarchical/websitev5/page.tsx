import type { Metadata } from "next";

import { WebsiteV5ClientPage } from "./client-page";

export const metadata: Metadata = {
  title: "Website V5 | Welcome to Genuin!",
};

export default async function WebsiteV5Page() {
  return <WebsiteV5ClientPage />;
}

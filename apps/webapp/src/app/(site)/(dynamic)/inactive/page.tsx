import type { Metadata } from "next";

import MainComponent from "./main-component";

export default async function Page() {
  return <MainComponent />;
}

export const metadata: Metadata = {
  title: "Page not found",
  description: "The service or webpage you are trying to access is no longer available",
};

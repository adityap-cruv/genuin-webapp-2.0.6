import type { Metadata } from "next";

import { GridClientPage } from "./client-page";

export const metadata: Metadata = {
  title: "Grid | Welcome to Genuin!",
};

export default async function GridPage() {
  return <GridClientPage />;
}

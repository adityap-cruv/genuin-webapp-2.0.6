import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FoilLocalAthletePage } from "../../_components/foil-athlete-page";
import { getFoilAthlete } from "../../_data/foil-athletes";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const athlete = getFoilAthlete(slug);
  return athlete ? { title: `${athlete.name} · The Foil` } : { title: "The Foil" };
}

export default async function FoilAthletePage({ params }: PageProps) {
  const { slug } = await params;
  const athlete = getFoilAthlete(slug);
  if (!athlete) notFound();

  return <FoilLocalAthletePage athlete={athlete} />;
}

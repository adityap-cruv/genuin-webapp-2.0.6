import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FoilSourcePage } from "../../_components/foil-source-page";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const FOIL_ATHLETES = {
  slingsby: {
    title: "Tom Slingsby",
    sourceUrl: "https://prototype.thefoil.begenuin.com/TheFoil/athlete-slingsby.html",
  },
  outteridge: {
    title: "Nathan Outteridge",
    sourceUrl: "https://prototype.thefoil.begenuin.com/TheFoil/athlete-outteridge.html",
  },
  delapierre: {
    title: "Quentin Delapierre",
    sourceUrl: "https://prototype.thefoil.begenuin.com/TheFoil/athlete-delapierre.html",
  },
} as const;

type FoilAthleteSlug = keyof typeof FOIL_ATHLETES;

function getAthlete(slug: string) {
  return Object.hasOwn(FOIL_ATHLETES, slug) ? FOIL_ATHLETES[slug as FoilAthleteSlug] : undefined;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const athlete = getAthlete(slug);
  return athlete ? { title: `${athlete.title} · The Foil` } : { title: "The Foil" };
}

export default async function FoilAthletePage({ params }: PageProps) {
  const { slug } = await params;
  const athlete = getAthlete(slug);
  if (!athlete) notFound();

  return <FoilSourcePage title={athlete.title} sourceUrl={athlete.sourceUrl} />;
}

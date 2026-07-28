import Link from "next/link";

type FoilSourcePageProps = {
  title: string;
  sourceUrl: string;
};

export function FoilSourcePage({ title, sourceUrl }: FoilSourcePageProps) {
  return (
    <main className="gencl:flex gencl:h-full gencl:min-h-0 gencl:flex-col gencl:bg-white">
      <div className="gencl:flex gencl:h-12 gencl:shrink-0 gencl:items-center gencl:justify-between gencl:border-b gencl:border-secondary-150 gencl:px-4 gencl:sm:px-6">
        <Link
          href="/home"
          className="gencl:inline-flex gencl:items-center gencl:text-body-2-medium gencl:text-secondary-600 gencl:no-underline hover:gencl:text-secondary-900">
          ← Back to The Foil
        </Link>
        <p className="gencl:truncate gencl:pl-4 gencl:text-body-3 gencl:text-secondary-500">{title}</p>
      </div>
      <iframe
        src={sourceUrl}
        title={title}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts"
        className="gencl:min-h-0 gencl:w-full gencl:flex-1 gencl:border-0 gencl:bg-white"
      />
    </main>
  );
}

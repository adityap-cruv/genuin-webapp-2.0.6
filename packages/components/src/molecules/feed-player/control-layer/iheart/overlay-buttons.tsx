import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { getBaseUrlWithouthighlights } from "@genuin/components/lib/utils";
import { Button, IHeartPlayIcon } from "@genuin/ui";
import { useCallback, useMemo } from "react";

export function OverLayButton({
  onIheartRedirection,
}: {
  onIheartRedirection?: () => void;
}) {
  const embedDetails = useSafeEmbedContext();
  const {
    view: { websiteType },
  } = useEmbedConfigs();

  const contentType = useMemo(() => {
    return embedDetails?.embedData.brand_context?.[0]?.type;
  }, [embedDetails]);

  const ctaText = useMemo(() => {
    return contentType === "podcast" ? "Go to episodes" : "Listen Live";
  }, [contentType]);

  /**
   * Handle go to episodes / listen live action
   * Handles redirection or scrolling behavior based on the content type and website type.
   *
   * Logic:
   * - For podcasts:
   *   - On Polaris sites → redirect to the base URL without highlights.
   *   - On Legacy sites → smoothly scroll to the top of the page.
   * - For station:
   *   - Polaris → redirect to the Now Playing page.
   *   - Legacy → trigger the mini player.
   */
  const handleIheartRedirection = useCallback(() => {
    const isPodcast = contentType === "podcast";
    const isPolaris = websiteType === "polaris";

    onIheartRedirection?.();
    if (isPodcast) {
      if (isPolaris) {
        const redirectUrl = getBaseUrlWithouthighlights(window.location.href);
        window.location.replace(redirectUrl);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    // TODO : change the view and icon accordingly
    // Non-podcast : station content
    if (isPolaris) {
      // TODO : play mini player of polaris
    } else {
      // TODO: Play mini player of legacy
    }
  }, [contentType, websiteType, onIheartRedirection]);

  return (
    <Button
      onClick={handleIheartRedirection}
      aria-label="Go to all episodes page"
      className="gencl:h-11 gencl:text-body-1-semi-bold! gencl:flex gencl:items-center gencl:justify-center gencl:rounded-full gencl:bg-white gencl:px-5 gencl:text-[#27292D]!"
    >
      {/* // TODO : change the view and icon accordingly for legacy and polaris while playing */}
      {contentType === "station" && (
        <IHeartPlayIcon theme="light" size="sm" aria-hidden="true" />
      )}
      {ctaText}
    </Button>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";

type AptivadaOptions = {
  campaignId: number;
  campaignType: string;
  host: string;
  initialHeight: number;
  mobileRedirect: boolean;
  transparent: boolean;
};

declare global {
  interface Window {
    Aptivada?: {
      init: (options: AptivadaOptions) => void;
    };
    AptivadaAsyncInit?: () => void;
  }
}

const APTIVADA_SCRIPT_ID = "genuin-iheart-aptivada-sdk";
const APTIVADA_HOST = "campaign.aptivada.com";

export function IHeartContestEmbed({
  campaignId,
  campaignType,
}: {
  campaignId: number;
  campaignType: string;
}) {
  const instanceId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const initialize = () => {
      if (!window.Aptivada || !container) return;
      container.innerHTML = '<div class="aptivada-campaign"></div>';
      window.Aptivada.init({
        campaignId,
        campaignType: campaignType === "ihrcountdown" ? "ihrcountdown" : campaignType,
        host: APTIVADA_HOST,
        transparent: true,
        mobileRedirect: false,
        initialHeight: 2600,
      });
    };

    const existingScript = document.getElementById(APTIVADA_SCRIPT_ID) as HTMLScriptElement | null;
    window.AptivadaAsyncInit = initialize;

    if (window.Aptivada) {
      initialize();
    } else if (existingScript) {
      existingScript.addEventListener("load", initialize, { once: true });
      existingScript.addEventListener("error", () => setFailed(true), { once: true });
    } else {
      const script = document.createElement("script");
      script.id = APTIVADA_SCRIPT_ID;
      script.src = `https://${APTIVADA_HOST}/sdk.js`;
      script.async = true;
      script.addEventListener("load", initialize, { once: true });
      script.addEventListener("error", () => setFailed(true), { once: true });
      document.body.appendChild(script);
    }

    return () => {
      if (existingScript) existingScript.removeEventListener("load", initialize);
      if (container) container.innerHTML = "";
      if (window.AptivadaAsyncInit === initialize) delete window.AptivadaAsyncInit;
    };
  }, [campaignId, campaignType, instanceId]);

  if (failed) {
    return (
      <p className="gencl:rounded-lg gencl:bg-secondary-100 gencl:p-4 gencl:text-body-2 gencl:text-secondary-700">
        The contest experience could not be loaded. Please try again shortly.
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      data-contest-instance={instanceId}
      className="gencl:min-h-[520px] gencl:w-full gencl:overflow-hidden gencl:rounded-lg gencl:bg-white"
      aria-label="iHeart contest entry"
    />
  );
}

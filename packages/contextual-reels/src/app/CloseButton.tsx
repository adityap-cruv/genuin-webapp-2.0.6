import { isIframe } from "@cxr/config";

export function CloseButton({ onClick }: { onClick: () => void }): React.JSX.Element | null {
  // Hide close button inside iframe
  if (isIframe()) return null;

  return (
    <button
      onClick={onClick}
      data-testid="cxr-close"
      aria-label="Close"
      className={[
        "gencl:absolute gencl:z-[100] gencl:w-4 gencl:h-4 gencl:box-content",
        "gencl:rounded-full gencl:cursor-pointer gencl:flex gencl:items-center gencl:justify-center",
        "gencl:-top-[13px] gencl:-right-[2px]",
      ].join(" ")}
      style={{ background: "rgba(0,0,0,0.7)" }}>
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="1.5" y1="1.5" x2="6.5" y2="6.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="6.5" y1="1.5" x2="1.5" y2="6.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </button>
  );
}

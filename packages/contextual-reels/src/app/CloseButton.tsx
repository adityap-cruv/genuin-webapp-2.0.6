import { XIcon } from "@genuin/ui/icons/primary-icons/x-icon";

export function CloseButton({ onClick }: { onClick: () => void }): React.JSX.Element | null {
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
      <XIcon theme="dark" size="xxs" />
    </button>
  );
}

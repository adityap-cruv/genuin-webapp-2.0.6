import { cloneElement, isValidElement, type ComponentProps, type CSSProperties, type ReactElement } from "react";

import { cn } from "../../lib/utils";

import { DARK_OVERLAY_20, DARK_OVERLAY_40, PLAYER_CONTROL_SIZE, type PlayerControlSize } from "./player-control-size";
import { VolumeRing } from "./volume-ring";

// `children` is omitted: the button manages its own inner circle + icon, so a
// consumer must not inject children into the outer div.
type IconCircleButtonProps = Omit<ComponentProps<"div">, "children"> & {
  /** Size token from the design system. @default "lg" */
  size?: PlayerControlSize;
  /** The control icon; auto-sized to the token's glyph dimension. */
  icon: ReactElement<{ style?: CSSProperties }>;
  /** When provided, renders a volume-percentage arc in the ring gap (0–100). */
  volPct?: number;
  /** Outer circle background. @default translucent DARK_OVERLAY_20 */
  outerBg?: string;
  /** Inner circle background. @default translucent DARK_OVERLAY_40 */
  innerBg?: string;
};

/** Design-system double-circle control button: lighter outer ring around a darker inner circle with a centered icon. */
export function IconCircleButton({
  size = "lg",
  icon,
  volPct,
  outerBg = DARK_OVERLAY_20,
  innerBg = DARK_OVERLAY_40,
  className,
  style,
  ...rest
}: IconCircleButtonProps) {
  const token = PLAYER_CONTROL_SIZE[size];
  const sizedIcon = isValidElement(icon)
    ? cloneElement(icon, {
        style: { width: token.glyph, height: token.glyph, ...icon.props.style },
      })
    : icon;

  return (
    <div
      className={cn(
        "gencl:relative gencl:flex gencl:flex-shrink-0 gencl:items-center gencl:justify-center gencl:rounded-full",
        className
      )}
      style={{
        width: token.outer,
        height: token.outer,
        background: outerBg,
        backdropFilter: outerBg === "transparent" ? undefined : `blur(${token.outerBlur}px)`,
        WebkitBackdropFilter: outerBg === "transparent" ? undefined : `blur(${token.outerBlur}px)`,
        ...style,
      }}
      {...rest}>
      {volPct !== undefined && <VolumeRing volPct={volPct} inner={token.inner} />}
      <div
        className="gencl:flex gencl:flex-shrink-0 gencl:items-center gencl:justify-center gencl:rounded-full"
        style={{
          width: token.inner,
          height: token.inner,
          background: innerBg,
          backdropFilter: `blur(${token.innerBlur}px)`,
          WebkitBackdropFilter: `blur(${token.innerBlur}px)`,
        }}>
        {sizedIcon}
      </div>
    </div>
  );
}

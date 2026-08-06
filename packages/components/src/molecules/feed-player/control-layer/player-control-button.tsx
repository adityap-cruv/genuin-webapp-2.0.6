import {
  DARK_OVERLAY_20,
  DARK_OVERLAY_40,
  PLAYER_CONTROL_SIZE,
  type PlayerControlSize,
} from "@genuin/ui/player-controls";
import { cn } from "@genuin/ui/utils";
import { cloneElement, isValidElement, type ComponentProps, type ReactElement } from "react";

import { VolumeRing } from "./volume-ring";

type PlayerControlButtonProps = ComponentProps<"div"> & {
  /** Size token from the design system. @default "lg" */
  size?: PlayerControlSize;
  /** The control icon; auto-sized to the token's glyph dimension. */
  icon: ReactElement<ComponentProps<"svg">>;
  /** When provided, renders a volume-percentage arc in the ring gap (0–100). */
  volPct?: number;
  /** Outer circle background. @default translucent DARK_OVERLAY_20 */
  outerBg?: string;
  /** Inner circle background. @default translucent DARK_OVERLAY_40 */
  innerBg?: string;
};

/** Design-system double-circle control button: lighter outer ring around a darker inner circle with a centered icon. */
export function PlayerControlButton({
  size = "lg",
  icon,
  volPct,
  outerBg = DARK_OVERLAY_20,
  innerBg = DARK_OVERLAY_40,
  className,
  style,
  children: _children,
  ...rest
}: PlayerControlButtonProps) {
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
        backdropFilter: `blur(${token.outerBlur}px)`,
        WebkitBackdropFilter: `blur(${token.outerBlur}px)`,
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

/** Volume-percentage arc filling the gap between the outer and inner control circles. */
export function VolumeRing({ volPct, inner }: { volPct: number; inner: number }) {
  const radius = inner / 2;
  return (
    <div
      className="gencl:absolute gencl:inset-0 gencl:rounded-full gencl:pointer-events-none"
      style={{
        background: `conic-gradient(#ffffff ${volPct}%, rgba(0, 0, 0, 0.2) ${volPct}%)`,
        WebkitMaskImage: `radial-gradient(circle, transparent ${radius}px, #000 ${radius + 0.5}px)`,
        maskImage: `radial-gradient(circle, transparent ${radius}px, #000 ${radius + 0.5}px)`,
        transition: "background 200ms ease-out",
      }}
    />
  );
}

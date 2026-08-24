export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line className="draw" pathLength={1} x1="13" y1="14" x2="45" y2="14" />
      <line className="draw" pathLength={1} x1="29" y1="14" x2="29" y2="50" />
      <path className="draw" pathLength={1} d="M29,18 A10,10 0 0 1 29,38" />
    </svg>
  );
}

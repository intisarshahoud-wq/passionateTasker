import type { IconName } from "@/data/marketplace";

/**
 * One line-icon set for the whole site, so category cards, trust badges and
 * list bullets stay visually consistent. Outline-only, 24x24, 2px stroke —
 * anything heavier reads as decoration rather than signage.
 */
const PATHS: Record<IconName, React.ReactNode> = {
  drop: <path d="M12 3c3 4 5 6.5 5 9.5a5 5 0 0 1-10 0C7 9.5 9 7 12 3z" />,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />,
  wrench: (
    <>
      <path d="M14.5 6.5l3 3L7 20H4v-3z" />
      <path d="M13 8l3-3 3 3-3 3" />
    </>
  ),
  brush: (
    <>
      <path d="M4 20c0-2 1-3 3-3s3 1 3 3-1 2-3 2-3 0-3-2z" />
      <path d="M9 16 19 6a2 2 0 0 0-3-3L6 13" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 4c0 8-5 13-12 13H5c0-8 5-13 12-13z" />
      <path d="M4 21c2-5 5-8 9-10" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3l1.8 4.9L19 9.7l-5.2 1.8L12 16l-1.8-4.5L5 9.7l5.2-1.8z" />
      <path d="M18 16l.9 2.4L21 19l-2.1.9L18 22l-.9-2.1L15 19l2.1-.6z" />
    </>
  ),
  box: (
    <>
      <path d="M3 8l9-4 9 4v8l-9 4-9-4z" />
      <path d="M3 8l9 4 9-4M12 12v8" />
    </>
  ),
  frame: (
    <>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  badge: (
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="M9 13.5L8 21l4-2 4 2-1-7.5" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0M12 17v4M9 21h6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  chat: <path d="M20 15a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" />,
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M6 15h4" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  keyboard: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
    </>
  ),
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  tools: (
    <>
      <path d="m14 10-9.5 9.5" />
      <path d="M14 10l2 2 5-5a1.4 1.4 0 0 0 0-2l-2-2a1.4 1.4 0 0 0-2 0l-5 5z" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6.5h11v9.5H3z" />
      <path d="M14 10h4l3 3v3h-7" />
      <circle cx="7" cy="17.5" r="1.6" />
      <circle cx="17" cy="17.5" r="1.6" />
    </>
  ),
  trend: (
    <>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-6.1-6.5-11a6.5 6.5 0 0 1 13 0c0 4.9-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
};

export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}

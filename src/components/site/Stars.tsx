/**
 * A star rating.
 *
 * The stars themselves are decorative — the rating is also written out in text
 * for screen readers, because five identical shapes announced one at a time is
 * noise, not information.
 */
export function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="stars">
      <span className="stars__row" aria-hidden="true">
        {Array.from({ length: max }, (_, i) => (
          <svg key={i} viewBox="0 0 24 24" className={i < rating ? "is-filled" : ""}>
            <path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9z" />
          </svg>
        ))}
      </span>
      <span className="visually-hidden">
        Rated {rating} out of {max}
      </span>
    </span>
  );
}

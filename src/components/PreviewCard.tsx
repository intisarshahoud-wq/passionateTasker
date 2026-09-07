/**
 * The hero product mock. Doubles as the hero's default media: shown whenever
 * no video file is present, so a missing asset degrades into something
 * intentional rather than an empty frame.
 */
export function PreviewCard() {
  return (
    <div className="preview-card" aria-label="Product preview">
      <span className="preview-tag">Preview — how it will feel</span>
      <div className="mock-input">
        <span className="mic-btn" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0014 0M12 18v3" />
          </svg>
        </span>
        <span className="placeholder-text">
          &quot;My kitchen tap has been leaking since this morning...&quot;
        </span>
      </div>
      <div className="mock-chip-row">
        <span className="mock-chip">
          Category: <strong>Plumbing</strong>
        </span>
        <span className="mock-chip">
          Priority: <strong>Same day</strong>
        </span>
        <span className="mock-chip">3 matches nearby</span>
      </div>
    </div>
  );
}

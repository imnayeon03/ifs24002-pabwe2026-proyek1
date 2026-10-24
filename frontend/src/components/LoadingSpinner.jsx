/**
 * Komponen loading spinner yang accessible.
 */
export default function LoadingSpinner({ text = 'Memuat...' }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <span className="muted">{text}</span>
    </div>
  );
}

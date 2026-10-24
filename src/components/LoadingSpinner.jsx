import PropTypes from 'prop-types';

/**
 * Komponen loading spinner yang accessible.
 */
export default function LoadingSpinner({ text = 'Memuat...' }) {
  return (
    <output className="loading-state" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span className="muted">{text}</span>
    </output>
  );
}

LoadingSpinner.propTypes = {
  text: PropTypes.string,
};

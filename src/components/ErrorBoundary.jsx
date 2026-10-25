import { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Error Boundary — menangkap error di subtree React,
 * mencegah seluruh app crash, dan menampilkan fallback UI.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card narrow error-fallback" role="alert">
          <h2>⚠️ Terjadi Kesalahan</h2>
          <p className="muted">{this.state.error?.message || 'Halaman tidak dapat dimuat.'}</p>
          <button type="button" className="primary" onClick={this.handleReset}>
            Coba Lagi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

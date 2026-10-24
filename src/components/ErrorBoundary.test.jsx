import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary.jsx';

describe('ErrorBoundary Component', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Konten Normal</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Konten Normal')).toBeTruthy();
  });

  it('catches error, displays fallback UI and calls handleReset', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function BadComponent() {
      throw new Error('Test crash boundary');
    }

    render(
      <ErrorBoundary>
        <BadComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/⚠️ Terjadi Kesalahan/i)).toBeTruthy();
    expect(screen.getByText('Test crash boundary')).toBeTruthy();

    const cobaLagiBtn = screen.getByRole('button', { name: 'Coba Lagi' });
    expect(cobaLagiBtn).toBeTruthy();
    fireEvent.click(cobaLagiBtn);

    consoleSpy.mockRestore();
  });

  it('displays default message when error has no message', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function BadComponentNoMessage() {
      throw new Error('');
    }

    render(
      <ErrorBoundary>
        <BadComponentNoMessage />
      </ErrorBoundary>
    );

    expect(screen.getByText('Halaman tidak dapat dimuat.')).toBeTruthy();
    consoleSpy.mockRestore();
  });
});

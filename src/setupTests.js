import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// vitest tanpa `globals: true` tidak memicu auto-cleanup milik Testing Library
afterEach(() => {
  cleanup();
});

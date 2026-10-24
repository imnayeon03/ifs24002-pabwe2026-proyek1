import { describe, it, expect, vi } from 'vitest';
import { hardRedirect } from './navigation';

describe('hardRedirect', () => {
  it('mengarahkan lewat location.assign dengan path yang diberikan', () => {
    const loc = { assign: vi.fn() };
    hardRedirect('/dashboard', loc);
    expect(loc.assign).toHaveBeenCalledTimes(1);
    expect(loc.assign).toHaveBeenCalledWith('/dashboard');
  });
});

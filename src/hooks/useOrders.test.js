import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOrders } from './useOrders';
import api from '../api';

vi.mock('../api', () => ({
  default: { get: vi.fn() },
}));

describe('useOrders Hook', () => {
  it('fetches orders using polling resource', async () => {
    const orders = [{ id: 1, nomor_antrean: 10 }];
    api.get.mockResolvedValueOnce({ data: orders });

    const { result } = renderHook(() => useOrders(10000));

    await waitFor(() => {
      expect(result.current.orders).toEqual(orders);
      expect(result.current.loading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledWith('/orders');
  });
});

import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { errMsg } from '../api';

/**
 * Satu-satunya tempat pola "loading -> try -> toast sukses / toast error -> finally".
 * Sebelumnya pola ini ditulis ulang di useOrderActions, useMenu, dan useCheckout.
 *
 * run(action, { success, rethrow })
 *  - action  : fungsi async yang melakukan pemanggilan API
 *  - success : pesan toast sukses (opsional)
 *  - rethrow : lempar ulang error setelah toast (untuk pemanggil yang perlu tahu gagal)
 * Mengembalikan true jika berhasil, false jika gagal (kecuali rethrow = true).
 */
export function useAsyncAction() {
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (action, { success, rethrow = false } = {}) => {
    setLoading(true);
    try {
      await action();
      if (success) toast.success(success);
      return true;
    } catch (error) {
      toast.error(errMsg(error));
      if (rethrow) throw error;
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, run };
}

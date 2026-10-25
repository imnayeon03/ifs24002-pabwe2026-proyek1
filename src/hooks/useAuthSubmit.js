import { useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import { useAuth } from '../auth.jsx';
import { hardRedirect } from '../utils/navigation.js';

/**
 * Mengirim form masuk/daftar ke API, menyimpan sesi, lalu mengarahkan pengguna.
 * @param {'login'|'register'} mode
 */
export function useAuthSubmit(mode) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const submit = async ({ username, password, nama }) => {
    setLoading(true);
    try {
      const payload = {
        email: username,
        username,
        password,
        ...(mode === 'register' && { nama }),
      };
      const { data } = await api.post(mode === 'login' ? '/auth/login' : '/auth/register', payload);
      login(data.token, data.user);
      toast.success(mode === 'login' ? `Selamat datang, ${data.user.nama}!` : 'Pendaftaran berhasil!');

      // Redirect native (bukan navigate SPA): lihat alasan di utils/navigation.js.
      hardRedirect(data.user.role === 'penjual' ? '/dashboard' : '/');
    } catch (error) {
      toast.error(errMsg(error));
    } finally {
      setLoading(false);
    }
  };

  return { loading, submit };
}

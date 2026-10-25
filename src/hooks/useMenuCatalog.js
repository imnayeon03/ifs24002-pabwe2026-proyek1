import { useEffect, useState } from 'react';
import api from '../api';

const SEARCH_DEBOUNCE_MS = 250;

/**
 * Katalog menu dengan pencarian dan filter kategori.
 * Permintaan ditunda `debounceMs` supaya API tidak dipanggil di setiap ketikan.
 */
export function useMenuCatalog({ searchQuery, kategori, debounceMs = SEARCH_DEBOUNCE_MS }) {
  const [menu, setMenu] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const timerId = setTimeout(() => {
      api
        .get('/menu', { params: { q: searchQuery, kategori } })
        .then((response) => {
          setMenu(response.data);
          setError('');
        })
        .catch(() => setError('Gagal memuat menu'));
    }, debounceMs);
    return () => clearTimeout(timerId);
  }, [searchQuery, kategori, debounceMs]);

  return { menu, error };
}

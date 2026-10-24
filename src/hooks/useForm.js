import { useState } from 'react';

/**
 * Custom hook untuk manajemen form dengan validasi terpusat.
 * @param {Object} initialValues - Nilai awal form
 * @param {Object} validators - Map key → function(value) → string|null
 */
export function useForm(initialValues, validators = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  /** Handler onChange untuk input — otomatis validasi saat blur */
  const set = (key) => (e) => {
    const val = e.target.value;
    setValues((prev) => ({ ...prev, [key]: val }));
    // Hapus error saat user mulai mengetik
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  /** Validasi semua field; return true jika valid */
  const validate = () => {
    const newErrors = {};
    for (const key of Object.keys(validators)) {
      const err = validators[key](values[key]);
      if (err) newErrors[key] = err;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Reset ke nilai awal */
  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return { values, errors, set, validate, reset, setValues };
}

/** Validator bawaan yang bisa dipakai ulang */
export const validators = {
  required: (label) => (v) => (!v?.trim() ? `${label} wajib diisi` : null),
  email: (v) => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '') ? 'Format email tidak valid' : null),
  minLength: (n) => (v) => ((v || '').length < n ? `Minimal ${n} karakter` : null),
  positiveNumber: (label) => (v) => (isNaN(v) || Number(v) <= 0 ? `${label} harus lebih dari 0` : null),
  nonNegativeNumber: (label) => (v) => (isNaN(v) || Number(v) < 0 ? `${label} tidak boleh negatif` : null),
};

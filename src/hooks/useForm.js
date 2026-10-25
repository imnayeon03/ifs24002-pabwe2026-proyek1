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
  const set = (key) => (event) => {
    const newValue = event.target.value;
    setValues((prev) => ({ ...prev, [key]: newValue }));
    // Hapus error saat user mulai mengetik
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  /** Validasi semua field; return true jika valid */
  const validate = () => {
    const newErrors = {};
    for (const key of Object.keys(validators)) {
      const message = validators[key](values[key]);
      if (message) newErrors[key] = message;
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
  required: (label) => (value) => (value?.trim() ? null : `${label} wajib diisi`),
  email: (value) => {
    const text = (value || '').trim();
    if (!text || text.length > 254) return 'Format email tidak valid';
    const parts = text.split('@');
    if (parts.length !== 2) return 'Format email tidak valid';
    const [local, domain] = parts;
    if (!local || !domain || local.includes(' ') || domain.includes(' ')) return 'Format email tidak valid';
    const domainParts = domain.split('.');
    if (domainParts.length < 2 || domainParts.some((part) => !part)) return 'Format email tidak valid';
    return null;
  },
  minLength: (min) => (value) => ((value || '').length < min ? `Minimal ${min} karakter` : null),
  positiveNumber: (label) => (value) => (Number.isNaN(Number(value)) || Number(value) <= 0 ? `${label} harus lebih dari 0` : null),
  nonNegativeNumber: (label) => (value) => (Number.isNaN(Number(value)) || Number(value) < 0 ? `${label} tidak boleh negatif` : null),
};

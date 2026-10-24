import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';

export default function Notifikasi() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/notifications')
      .then((r) => setItems(r.data || []))
      .catch((e) => setErr(errMsg(e)));
  }, []);

  return (
    <section>
      <h1>Notifikasi</h1>
      {err && <p className="error">{err}</p>}
      {!err && items.length === 0 && <p className="muted">Belum ada notifikasi.</p>}
      {items.map((n) => (
        <div className="card" key={n.id}>
          <b>{n.judul}</b>
          <p>{n.pesan}</p>
          <p className="muted small">{n.created_at}</p>
        </div>
      ))}
    </section>
  );
}

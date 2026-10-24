import { useAuth } from '../auth.jsx';

export default function Profil() {
  const { user } = useAuth();
  return (
    <section className="card narrow">
      <h1>Profil Saya</h1>
      <p><b>Nama:</b> {user.nama}</p>
      <p><b>Email:</b> {user.email}</p>
      <p><b>Peran:</b> {user.role}</p>
    </section>
  );
}

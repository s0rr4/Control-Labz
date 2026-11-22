import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { labService } from '../services/labService';

export default function DashboardPage() {
  const [computers, setComputers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    labService.computers().then(setComputers).catch((requestError) => setError(requestError.message));
  }, []);

  const count = (status) => computers.filter((computer) => computer.estatus === status).length;

  return (
    <section className="page">
      <div className="page-heading">
        <div><span className="eyebrow">Resumen general</span><h2>Panel principal</h2></div>
        <Link className="primary-button" to="/labs">Consultar laboratorios</Link>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="stats-grid">
        <article className="stat-card"><span>Disponibles</span><strong className="text-success">{count('DISPONIBLE')}</strong></article>
        <article className="stat-card"><span>Ocupadas</span><strong className="text-danger">{count('OCUPADA')}</strong></article>
        <article className="stat-card"><span>Mantenimiento</span><strong className="text-warning">{count('MANTENIMIENTO')}</strong></article>
      </div>
    </section>
  );
}

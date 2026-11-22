import { useEffect, useState } from 'react';
import { labService } from '../services/labService';

export default function MySessionPage() {
  const [assignments, setAssignments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reporteFalla, setReporteFalla] = useState(false);
  const [descripcionFalla, setDescripcionFalla] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      setAssignments(await labService.assignments());
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => { load(); }, []);
  const active = assignments.find((assignment) => assignment.estatus === 'ASIGNADA');

  const openRelease = (assignment) => {
    setSelected(assignment);
    setReporteFalla(false);
    setDescripcionFalla('');
  };

  const release = async (event) => {
    event.preventDefault();
    if (reporteFalla && !descripcionFalla.trim()) {
      setError('Describe la falla reportada.');
      return;
    }
    try {
      await labService.release(selected.id, { reporteFalla, descripcionFalla: reporteFalla ? descripcionFalla.trim() : '' });
      setSelected(null);
      setMessage('Equipo liberado correctamente.');
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="page">
      <div className="page-heading"><div><span className="eyebrow">Sesión actual</span><h2>Mi sesión activa</h2></div></div>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      {!active ? (
        <div className="empty-state"><h3>No tienes equipo asignado</h3><p>Selecciona una computadora disponible en Laboratorios.</p></div>
      ) : (
        <article className="session-card">
          <div><span>Número de inventario</span><strong>{active.computer?.numeroInventario}</strong></div>
          <div><span>Laboratorio</span><strong>{active.computer?.laboratorio}</strong></div>
          <div><span>Especificaciones</span><strong>{active.computer?.especificaciones}</strong></div>
          <div><span>Materia</span><strong>{active.materia}</strong></div>
          <div><span>Inicio</span><strong>{new Date(active.inicio).toLocaleString('es-MX')}</strong></div>
          <div><span>Horas de uso</span><strong>{active.horasUso}</strong></div>
          <button className="danger-button" onClick={() => openRelease(active)}>Liberar equipo</button>
        </article>
      )}

      {selected && (
        <div className="modal-backdrop">
          <form className="modal-card" onSubmit={release}>
            <div className="modal-heading"><div><span>Confirmar liberación</span><h3>{selected.computer?.numeroInventario}</h3></div><button type="button" className="icon-button" onClick={() => setSelected(null)}>×</button></div>
            <label className="checkbox-row"><input type="checkbox" checked={reporteFalla} onChange={(event) => setReporteFalla(event.target.checked)} /> ¿Deseas reportar alguna falla?</label>
            {reporteFalla && <label>Descripción de la falla<textarea value={descripcionFalla} onChange={(event) => setDescripcionFalla(event.target.value)} /></label>}
            <button className="danger-button full">Confirmar liberación</button>
          </form>
        </div>
      )}
    </section>
  );
}

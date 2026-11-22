import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { labService } from '../services/labService';
import { LABORATORIOS } from '../services/demoStore';

export default function LabsPage() {
  const { user } = useAuth();
  const [laboratorio, setLaboratorio] = useState(LABORATORIOS[0]);
  const [estatus, setEstatus] = useState('');
  const [computers, setComputers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ materia: '', horasUso: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadComputers = async () => {
    setLoading(true);
    setError('');
    try {
      setComputers(await labService.computers(laboratorio, estatus));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadComputers(); }, [laboratorio, estatus]);

  const handleSelect = (computer) => {
    if (computer.estatus !== 'DISPONIBLE') return;
    setSelected(computer);
    setForm({ materia: '', horasUso: '' });
    setError('');
  };

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const hours = Number(form.horasUso);
    if (!form.materia.trim() || !Number.isFinite(hours) || hours <= 0) {
      setError('Complete los datos y capture horas positivas.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await labService.createAssignment({
        computerId: selected.id,
        userId: user.id,
        materia: form.materia.trim(),
        horasUso: hours,
      });
      setSelected(null);
      setMessage('Asignación registrada correctamente.');
      await loadComputers();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      <div className="page-heading">
        <div><span className="eyebrow">Inventario disponible</span><h2>Laboratorios y computadoras</h2></div>
        <div className="filters">
          <select value={laboratorio} onChange={(event) => setLaboratorio(event.target.value)}>
            {LABORATORIOS.map((lab) => <option key={lab}>{lab}</option>)}
          </select>
          <select value={estatus} onChange={(event) => setEstatus(event.target.value)}>
            <option value="">Todos los estados</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="OCUPADA">Ocupada</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
          </select>
        </div>
      </div>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      {loading && !selected && <div className="loading-inline">Cargando computadoras...</div>}
      <div className="computer-grid">
        {computers.map((computer) => (
          <button
            type="button"
            className={`computer-card ${computer.estatus.toLowerCase()}`}
            key={computer.id}
            onClick={() => handleSelect(computer)}
            disabled={computer.estatus !== 'DISPONIBLE'}
          >
            <span className="status-dot" />
            <strong>{computer.numeroInventario}</strong>
            <p>{computer.especificaciones}</p>
            <small>{computer.estatus}</small>
          </button>
        ))}
      </div>

      {selected && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal-card" onSubmit={handleSubmit}>
            <div className="modal-heading"><div><span>Asignación de equipo</span><h3>{selected.numeroInventario}</h3></div><button type="button" className="icon-button" onClick={() => setSelected(null)}>×</button></div>
            <label>Laboratorio<input value={selected.laboratorio} disabled /></label>
            <label>Materia<input name="materia" value={form.materia} onChange={handleChange} placeholder="Ej. Desarrollo Web" /></label>
            <label>Horas de uso<input name="horasUso" type="number" min="0.01" step="any" inputMode="decimal" value={form.horasUso} onChange={handleChange} /></label>
            {error && <div className="alert error">{error}</div>}
            <button className="primary-button full" disabled={loading}>{loading ? 'Procesando...' : 'Confirmar asignación'}</button>
          </form>
        </div>
      )}
    </section>
  );
}

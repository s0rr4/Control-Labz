import { useEffect, useState } from 'react';
import { labService } from '../services/labService';
import { userService } from '../services/userService';
import { LABORATORIOS } from '../services/demoStore';

export default function AdminPage() {
  const [computerForm, setComputerForm] = useState({
    numeroInventario: '',
    laboratorio: LABORATORIOS[0],
    especificaciones: '',
    perifericosIncluidos: 'Monitor, Teclado, Mouse',
  });
  const [equipmentForm, setEquipmentForm] = useState({ tipo: 'Proyector', numeroSerie: '', laboratorio: LABORATORIOS[0] });
  const [assignments, setAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [nextAssignments, nextUsers] = await Promise.all([labService.assignments(), userService.list()]);
      setAssignments(nextAssignments);
      setUsers(nextUsers);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => { load(); }, []);

  const submitComputer = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await labService.createComputer({
        ...computerForm,
        perifericosIncluidos: computerForm.perifericosIncluidos
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      });
      setMessage('Computadora registrada correctamente.');
      setComputerForm({ numeroInventario: '', laboratorio: LABORATORIOS[0], especificaciones: '', perifericosIncluidos: 'Monitor, Teclado, Mouse' });
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const submitEquipment = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await labService.createEquipment(equipmentForm);
      setMessage('Equipo periférico registrado correctamente.');
      setEquipmentForm({ tipo: 'Proyector', numeroSerie: '', laboratorio: LABORATORIOS[0] });
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const changeRole = async (id, rol) => {
    try {
      await userService.changeRole(id, rol);
      setMessage('Rol actualizado correctamente.');
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const forcedRelease = async (id) => {
    try {
      await labService.release(id, { reporteFalla: false, descripcionFalla: '' });
      setMessage('Asignación liberada por el administrador.');
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="page">
      <div className="page-heading"><div><span className="eyebrow">Herramientas administrativas</span><h2>Panel de administrador</h2></div></div>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      <div className="admin-grid">
        <form className="panel-card" onSubmit={submitComputer}>
          <h3>Registrar computadora</h3>
          <label>Número de inventario<input value={computerForm.numeroInventario} onChange={(event) => setComputerForm({ ...computerForm, numeroInventario: event.target.value })} required /></label>
          <label>Laboratorio<select value={computerForm.laboratorio} onChange={(event) => setComputerForm({ ...computerForm, laboratorio: event.target.value })}>{LABORATORIOS.map((lab) => <option key={lab}>{lab}</option>)}</select></label>
          <label>Especificaciones<input value={computerForm.especificaciones} onChange={(event) => setComputerForm({ ...computerForm, especificaciones: event.target.value })} required /></label>
          <label>Periféricos separados por coma<input value={computerForm.perifericosIncluidos} onChange={(event) => setComputerForm({ ...computerForm, perifericosIncluidos: event.target.value })} /></label>
          <button className="primary-button full">Registrar computadora</button>
        </form>

        <form className="panel-card" onSubmit={submitEquipment}>
          <h3>Registrar equipo periférico</h3>
          <label>Tipo<select value={equipmentForm.tipo} onChange={(event) => setEquipmentForm({ ...equipmentForm, tipo: event.target.value })}><option>Proyector</option><option>Cable HDMI</option><option>Switch</option></select></label>
          <label>Número de serie<input value={equipmentForm.numeroSerie} onChange={(event) => setEquipmentForm({ ...equipmentForm, numeroSerie: event.target.value })} required /></label>
          <label>Laboratorio<select value={equipmentForm.laboratorio} onChange={(event) => setEquipmentForm({ ...equipmentForm, laboratorio: event.target.value })}>{LABORATORIOS.map((lab) => <option key={lab}>{lab}</option>)}</select></label>
          <button className="primary-button full">Registrar equipo</button>
        </form>
      </div>

      <div className="panel-card table-card">
        <h3>Asignaciones activas</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Equipo</th><th>Laboratorio</th><th>Usuario</th><th>Materia</th><th>Inicio</th><th>Acción</th></tr></thead>
            <tbody>
              {assignments.filter((item) => item.estatus === 'ASIGNADA').map((item) => (
                <tr key={item.id}>
                  <td>{item.computer?.numeroInventario}</td><td>{item.computer?.laboratorio}</td><td>{item.user?.nombre}</td><td>{item.materia}</td><td>{new Date(item.inicio).toLocaleString('es-MX')}</td>
                  <td><button className="small-danger" onClick={() => forcedRelease(item.id)}>Liberar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel-card table-card">
        <h3>Gestión de usuarios</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nombre</th><th>Matrícula</th><th>Email</th><th>Rol</th><th>Acción</th></tr></thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre}</td><td>{item.matricula}</td><td>{item.email}</td><td><span className={`role-badge ${item.rol.toLowerCase()}`}>{item.rol}</span></td>
                  <td><button className="small-button" onClick={() => changeRole(item.id, item.rol === 'ADMIN' ? 'USER' : 'ADMIN')}>Cambiar a {item.rol === 'ADMIN' ? 'USER' : 'ADMIN'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

import { httpRequest } from './httpClient';
import { DEMO_MODE, demoStore } from './demoStore';

async function demoOr(realRequest) {
  if (DEMO_MODE) return realRequest();
  try { return await realRequest(); }
  catch (error) { throw error; }
}

export const labService = {
  computers: (laboratorio = '', estatus = '') => {
    if (DEMO_MODE) {
      return Promise.resolve(demoStore.computers.filter((computer) =>
        (!laboratorio || computer.laboratorio === laboratorio) &&
        (!estatus || computer.estatus === estatus)
      ));
    }
    const params = new URLSearchParams();
    if (laboratorio) params.set('laboratorio', laboratorio);
    if (estatus) params.set('estatus', estatus);
    const query = params.toString();
    return httpRequest(`/api/labs/computers${query ? `?${query}` : ''}`);
  },
  createComputer: (payload) => demoOr(() => {
    if (DEMO_MODE) {
      const computer = { id: Math.max(...demoStore.computers.map((item) => item.id)) + 1, estatus: 'DISPONIBLE', ...payload };
      demoStore.computers.push(computer);
      return Promise.resolve(computer);
    }
    return httpRequest('/api/labs/computers', { method: 'POST', body: JSON.stringify(payload) });
  }),
  createEquipment: (payload) => demoOr(() => DEMO_MODE
    ? Promise.resolve({ id: Date.now(), estatus: 'DISPONIBLE', ...payload })
    : httpRequest('/api/labs/equipment', { method: 'POST', body: JSON.stringify(payload) })),
  createAssignment: (payload) => demoOr(() => {
    if (DEMO_MODE) {
      const computer = demoStore.computers.find((item) => item.id === payload.computerId);
      if (!computer || computer.estatus !== 'DISPONIBLE') return Promise.reject(new Error('La computadora no está disponible'));
      computer.estatus = 'OCUPADA';
      const id = Math.max(...demoStore.assignments.map((item) => item.id), 209) + 1;
      const assignment = { id, ...payload, inicio: new Date().toISOString(), estatus: 'ASIGNADA', reporteFalla: false, descripcionFalla: '' };
      demoStore.assignments.push(assignment);
      return Promise.resolve({ assignmentId: id, estatus: 'ASIGNADA', inicio: assignment.inicio });
    }
    return httpRequest('/api/labs/assignments', { method: 'POST', body: JSON.stringify(payload) });
  }),
  assignments: () => demoOr(() => DEMO_MODE
    ? Promise.resolve(demoStore.assignments.map((assignment) => ({
      ...assignment,
      computer: demoStore.computers.find((computer) => computer.id === assignment.computerId),
      user: demoStore.users.find((user) => user.id === assignment.userId),
    })))
    : httpRequest('/api/labs/assignments')),
  release: (id, payload) => demoOr(() => {
    if (DEMO_MODE) {
      const assignment = demoStore.assignments.find((item) => item.id === Number(id));
      if (!assignment) return Promise.reject(new Error('Asignación no encontrada'));
      assignment.estatus = 'LIBERADA';
      assignment.reporteFalla = payload.reporteFalla;
      assignment.descripcionFalla = payload.descripcionFalla || '';
      const computer = demoStore.computers.find((item) => item.id === assignment.computerId);
      if (computer) computer.estatus = 'DISPONIBLE';
      return Promise.resolve({ assignmentId: assignment.id, estatus: 'LIBERADA' });
    }
    return httpRequest(`/api/labs/assignments/${id}/release`, { method: 'PATCH', body: JSON.stringify(payload) });
  }),
};

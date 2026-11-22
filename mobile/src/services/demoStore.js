export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_AUTH === 'true';

export const LABORATORIOS = [
  'AL01 - Edificio A Laboratorio 1',
  'AL02 - Edificio A Laboratorio 2',
  'BL01 - Edificio B Laboratorio 1',
  'BL02 - Edificio B Laboratorio 2',
  'BL03 - Edificio B Laboratorio 3',
  'BL04 - Edificio B Laboratorio 4',
  'DL01 - Edificio D Laboratorio 1',
  'DL02 - Edificio D Laboratorio 2',
  'DL03 - Edificio D Laboratorio 3',
  'DL04 - Edificio D Laboratorio 4',
  'VL01 - Centro de Vinculación',
];

const specs = [
  'Core i7, 16 GB RAM, SSD 512 GB',
  'Core i5, 8 GB RAM, SSD 256 GB',
  'AMD Ryzen 5, 16 GB RAM, SSD 512 GB',
];

let computerId = 101;
const computers = [];
LABORATORIOS.forEach((laboratorio, labIndex) => {
  for (let computerNumber = 1; computerNumber <= 20; computerNumber += 1) {
    let estatus = 'DISPONIBLE';
    if (computerNumber === 17 || computerNumber === 18) estatus = 'OCUPADA';
    if (computerNumber === 19 || computerNumber === 20) estatus = 'MANTENIMIENTO';
    const laboratoryCode = laboratorio.slice(0, 4);
    computers.push({
      id: computerId,
      numeroInventario: `${laboratoryCode}-${computerNumber}`,
      laboratorio,
      especificaciones: specs[(labIndex + computerNumber) % specs.length],
      perifericosIncluidos: ['Monitor', 'Teclado', 'Mouse'],
      estatus,
    });
    computerId += 1;
  }
});

const users = [
  { id: 1, nombre: 'Administrador Demo', matricula: 'ADM-001', email: 'admin', rol: 'ADMIN' },
  { id: 2, nombre: 'Ana Martínez', matricula: '20260001', email: 'ana@utr.edu.mx', rol: 'USER' },
  { id: 3, nombre: 'Carlos López', matricula: '20260002', email: 'carlos@utr.edu.mx', rol: 'USER' },
  { id: 4, nombre: 'María Hernández', matricula: '20260003', email: 'maria@utr.edu.mx', rol: 'USER' },
];

const assignments = computers
  .filter((computer) => computer.estatus === 'OCUPADA')
  .map((computer, index) => ({
    id: 210 + index,
    computerId: computer.id,
    userId: users[(index % (users.length - 1)) + 1].id,
    materia: ['Desarrollo Web', 'Bases de Datos', 'Redes de Computadoras', 'Desarrollo Móvil'][index],
    horasUso: [2, 3, 1.5, 2.5][index],
    inicio: new Date(Date.now() - (index + 1) * 25 * 60 * 1000).toISOString(),
    estatus: 'ASIGNADA',
    reporteFalla: false,
    descripcionFalla: '',
  }));

export const demoStore = { computers, users, assignments };

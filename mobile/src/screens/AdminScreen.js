import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { labApi, userApi } from '../services/api';
import { LABORATORIOS } from '../services/demoStore';

export default function AdminScreen() {
  const [computer, setComputer] = useState({ numeroInventario: '', laboratorio: LABORATORIOS[0], especificaciones: '' });
  const [equipment, setEquipment] = useState({ tipo: 'Proyector', numeroSerie: '', laboratorio: LABORATORIOS[0] });
  const [assignments, setAssignments] = useState([]);
  const [users, setUsers] = useState([]);

  const load = async () => {
    try {
      const [nextAssignments, nextUsers] = await Promise.all([labApi.assignments(), userApi.list()]);
      setAssignments(nextAssignments.filter((item) => item.estatus === 'ASIGNADA'));
      setUsers(nextUsers);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const registerComputer = async () => {
    if (!computer.numeroInventario || !computer.especificaciones) return Alert.alert('Datos incompletos', 'Complete inventario y especificaciones.');
    try {
      await labApi.createComputer({ ...computer, perifericosIncluidos: ['Monitor', 'Teclado', 'Mouse'] });
      setComputer({ numeroInventario: '', laboratorio: LABORATORIOS[0], especificaciones: '' });
      Alert.alert('Registrada', 'Computadora creada correctamente.');
    } catch (error) { Alert.alert('Error', error.message); }
  };

  const registerEquipment = async () => {
    if (!equipment.numeroSerie) return Alert.alert('Datos incompletos', 'Capture el número de serie.');
    try {
      await labApi.createEquipment(equipment);
      setEquipment({ tipo: 'Proyector', numeroSerie: '', laboratorio: LABORATORIOS[0] });
      Alert.alert('Registrado', 'Equipo periférico creado correctamente.');
    } catch (error) { Alert.alert('Error', error.message); }
  };

  const changeRole = async (item) => {
    const rol = item.rol === 'ADMIN' ? 'USER' : 'ADMIN';
    try { await userApi.changeRole(item.id, rol); await load(); } catch (error) { Alert.alert('Error', error.message); }
  };

  const release = async (item) => {
    try { await labApi.release(item.id, { reporteFalla: false, descripcionFalla: '' }); await load(); } catch (error) { Alert.alert('Error', error.message); }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ gap: 12 }}>
      <Text style={styles.eyebrow}>Herramientas administrativas</Text><Text style={styles.title}>Administración</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Registrar computadora</Text>
        <TextInput style={styles.input} placeholder="Número de inventario" value={computer.numeroInventario} onChangeText={(numeroInventario) => setComputer({ ...computer, numeroInventario })} />
        <TextInput style={styles.input} placeholder="Laboratorio" value={computer.laboratorio} onChangeText={(laboratorio) => setComputer({ ...computer, laboratorio })} />
        <TextInput style={styles.input} placeholder="Especificaciones" value={computer.especificaciones} onChangeText={(especificaciones) => setComputer({ ...computer, especificaciones })} />
        <TouchableOpacity style={styles.primary} onPress={registerComputer}><Text style={styles.primaryText}>Registrar computadora</Text></TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Registrar equipo periférico</Text>
        <TextInput style={styles.input} placeholder="Tipo (Proyector, Cable HDMI, Switch)" value={equipment.tipo} onChangeText={(tipo) => setEquipment({ ...equipment, tipo })} />
        <TextInput style={styles.input} placeholder="Número de serie" value={equipment.numeroSerie} onChangeText={(numeroSerie) => setEquipment({ ...equipment, numeroSerie })} />
        <TextInput style={styles.input} placeholder="Laboratorio" value={equipment.laboratorio} onChangeText={(laboratorio) => setEquipment({ ...equipment, laboratorio })} />
        <TouchableOpacity style={styles.primary} onPress={registerEquipment}><Text style={styles.primaryText}>Registrar equipo</Text></TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Asignaciones activas</Text>
        {assignments.map((item) => <View key={item.id} style={styles.userRow}><View style={{ flex: 1 }}><Text style={styles.value}>{item.computer?.numeroInventario}</Text><Text>{item.user?.nombre} — {item.materia}</Text></View><TouchableOpacity style={styles.smallDanger} onPress={() => release(item)}><Text style={styles.smallDangerText}>Liberar</Text></TouchableOpacity></View>)}
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Usuarios</Text>
        {users.map((item) => <View key={item.id} style={styles.userRow}><View style={{ flex: 1 }}><Text style={styles.value}>{item.nombre}</Text><Text>{item.rol}</Text></View><TouchableOpacity style={styles.smallButton} onPress={() => changeRole(item)}><Text style={styles.smallButtonText}>Cambiar</Text></TouchableOpacity></View>)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F5F7FA', padding: 16 },
  eyebrow: { color: '#64748B', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }, title: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E3E9F1', padding: 14, gap: 8 },
  cardTitle: { fontWeight: '800', fontSize: 16 }, input: { borderWidth: 1, borderColor: '#D8E0EA', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  primary: { height: 44, borderRadius: 8, backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center' }, primaryText: { color: '#fff', fontWeight: '800' },
  userRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EDF1F5', paddingVertical: 9 }, value: { fontWeight: '800' },
  smallButton: { backgroundColor: '#DBEAFE', borderRadius: 7, paddingHorizontal: 10, paddingVertical: 8 }, smallButtonText: { color: '#1D4ED8', fontWeight: '700' },
  smallDanger: { backgroundColor: '#FEE2E2', borderRadius: 7, paddingHorizontal: 10, paddingVertical: 8 }, smallDangerText: { color: '#B91C1C', fontWeight: '700' },
});

import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { labApi } from '../services/api';

export default function SessionScreen() {
  const [assignment, setAssignment] = useState(null);
  const [reporteFalla, setReporteFalla] = useState(false);
  const [descripcionFalla, setDescripcionFalla] = useState('');

  const load = async () => {
    try {
      const assignments = await labApi.assignments();
      setAssignment(assignments.find((item) => item.estatus === 'ASIGNADA') || null);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const release = async () => {
    if (reporteFalla && !descripcionFalla.trim()) {
      Alert.alert('Falta información', 'Describe la falla reportada.');
      return;
    }
    try {
      await labApi.release(assignment.id, { reporteFalla, descripcionFalla: reporteFalla ? descripcionFalla.trim() : '' });
      setAssignment(null);
      setReporteFalla(false);
      setDescripcionFalla('');
      Alert.alert('Equipo liberado', 'La sesión fue liberada correctamente.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.eyebrow}>Sesión actual</Text><Text style={styles.title}>Mi sesión activa</Text>
      {!assignment ? (
        <View style={styles.empty}><Text style={styles.emptyTitle}>No tienes equipo asignado</Text><Text>Selecciona una computadora disponible.</Text></View>
      ) : (
        <View style={styles.card}>
          <View style={styles.row}><Text style={styles.label}>Equipo</Text><Text style={styles.value}>{assignment.computer?.numeroInventario}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Laboratorio</Text><Text style={styles.value}>{assignment.computer?.laboratorio}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Materia</Text><Text style={styles.value}>{assignment.materia}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Inicio</Text><Text style={styles.value}>{new Date(assignment.inicio).toLocaleString('es-MX')}</Text></View>
          <TouchableOpacity style={styles.checkbox} onPress={() => setReporteFalla((current) => !current)}><View style={[styles.box, reporteFalla && styles.boxChecked]} /><Text>¿Deseas reportar alguna falla?</Text></TouchableOpacity>
          {reporteFalla && <TextInput style={styles.input} placeholder="Descripción de la falla" value={descripcionFalla} onChangeText={setDescripcionFalla} multiline />}
          <TouchableOpacity style={styles.danger} onPress={release}><Text style={styles.dangerText}>Liberar equipo</Text></TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F5F7FA', padding: 16 },
  eyebrow: { color: '#64748B', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }, title: { fontSize: 24, fontWeight: '800', marginBottom: 14 },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderColor: '#CBD5E1', borderRadius: 12, padding: 42, alignItems: 'center' }, emptyTitle: { fontWeight: '800', marginBottom: 6 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E3E9F1', padding: 16, gap: 12 },
  row: { borderBottomWidth: 1, borderBottomColor: '#EDF1F5', paddingBottom: 10 }, label: { color: '#64748B', fontSize: 12 }, value: { fontWeight: '800', marginTop: 3 },
  checkbox: { flexDirection: 'row', alignItems: 'center', gap: 8 }, box: { width: 19, height: 19, borderRadius: 4, borderWidth: 1, borderColor: '#94A3B8' }, boxChecked: { backgroundColor: '#DC2626' },
  input: { borderWidth: 1, borderColor: '#D8E0EA', borderRadius: 8, minHeight: 80, padding: 10, textAlignVertical: 'top' },
  danger: { height: 48, backgroundColor: '#DC2626', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, dangerText: { color: '#fff', fontWeight: '800' },
});

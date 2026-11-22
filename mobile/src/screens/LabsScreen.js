import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { labApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LABORATORIOS } from '../services/demoStore';

export default function LabsScreen() {
  const { user } = useAuth();
  const [laboratorio, setLaboratorio] = useState(LABORATORIOS[0]);
  const [computers, setComputers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [materia, setMateria] = useState('');
  const [horasUso, setHorasUso] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setComputers(await labApi.computers(laboratorio)); } catch (error) { Alert.alert('Error', error.message); }
    finally { setLoading(false); }
  }, [laboratorio]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const choose = (computer) => {
    if (computer.estatus !== 'DISPONIBLE') return;
    setSelected(computer);
    setMateria('');
    setHorasUso('');
  };

  const assign = async () => {
    const normalizedHours = horasUso.replace(',', '.').trim();
    const hours = Number(normalizedHours);
    if (!materia.trim() || !Number.isFinite(hours) || hours <= 0) {
      Alert.alert('Datos incompletos', 'Capture materia y horas positivas.');
      return;
    }
    setLoading(true);
    try {
      await labApi.createAssignment({ computerId: selected.id, userId: user.id, materia: materia.trim(), horasUso: hours });
      setSelected(null);
      Alert.alert('Asignación exitosa', 'La computadora quedó asignada.');
      await load();
    } catch (error) {
      Alert.alert('No se pudo asignar', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.eyebrow}>Inventario disponible</Text>
      <Text style={styles.title}>Laboratorios</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsContent}>
        {LABORATORIOS.map((item) => (
          <Pressable key={item} style={[styles.tab, laboratorio === item && styles.tabActive]} onPress={() => setLaboratorio(item)}>
            <Text style={[styles.tabText, laboratorio === item && styles.tabTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {loading ? <ActivityIndicator size="large" color="#DC2626" style={{ marginTop: 30 }} /> : (
        <FlatList
          data={computers}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={{ gap: 10 }}
          contentContainerStyle={{ gap: 10 }}
          renderItem={({ item }) => (
            <Pressable style={[styles.card, styles[item.estatus.toLowerCase()]]} onPress={() => choose(item)} disabled={item.estatus !== 'DISPONIBLE'}>
              <Text style={styles.inventory}>{item.numeroInventario}</Text>
              <Text style={styles.specs}>{item.especificaciones}</Text>
              <Text style={styles.status}>{item.estatus}</Text>
            </Pressable>
          )}
        />
      )}
      <Modal visible={Boolean(selected)} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{selected?.numeroInventario}</Text>
            <Text style={styles.modalInfo}>Laboratorio: {selected?.laboratorio}</Text>
            <TextInput style={styles.input} placeholder="Materia" value={materia} onChangeText={setMateria} />
            <TextInput style={styles.input} placeholder="Horas de uso" keyboardType="decimal-pad" inputMode="decimal" value={horasUso} onChangeText={(value) => setHorasUso(value.replace(/[^0-9,.]/g, ''))} />
            <Pressable style={styles.primary} onPress={assign} disabled={loading}><Text style={styles.primaryText}>{loading ? 'Procesando...' : 'Confirmar asignación'}</Text></Pressable>
            <Pressable style={styles.cancel} onPress={() => setSelected(null)}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F5F7FA', padding: 16 },
  eyebrow: { color: '#64748B', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  tabs: { marginBottom: 12 },
  tabsContent: { flexDirection: 'row', gap: 6 },
  tab: { minWidth: 150, borderRadius: 8, backgroundColor: '#E8EDF4', padding: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#DC2626' },
  tabText: { color: '#475569', fontWeight: '700' }, tabTextActive: { color: '#fff' },
  card: { flex: 1, minHeight: 145, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderTopWidth: 4, borderColor: '#D8E0EA', padding: 12, marginBottom: 10 },
  disponible: { borderTopColor: '#16A34A' }, ocupada: { borderTopColor: '#DC2626' }, mantenimiento: { borderTopColor: '#EAB308' },
  inventory: { fontWeight: '800', marginBottom: 8 }, specs: { color: '#64748B', flex: 1, fontSize: 12 }, status: { fontWeight: '800', fontSize: 11 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,.5)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: '#fff', borderRadius: 12, padding: 20, gap: 10 },
  modalTitle: { fontSize: 20, fontWeight: '800' }, modalInfo: { color: '#64748B' },
  input: { borderWidth: 1, borderColor: '#D8E0EA', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11 },
  primary: { backgroundColor: '#DC2626', borderRadius: 8, height: 48, alignItems: 'center', justifyContent: 'center' }, primaryText: { color: '#fff', fontWeight: '800' },
  cancel: { height: 42, alignItems: 'center', justifyContent: 'center' }, cancelText: { color: '#64748B', fontWeight: '700' },
});

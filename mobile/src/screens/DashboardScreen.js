import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { labApi } from '../services/api';

export default function DashboardScreen() {
  const [computers, setComputers] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    labApi.computers().then(setComputers).finally(() => setLoading(false)).catch(() => setLoading(false));
  }, []));

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color="#DC2626" /></View>;
  const count = (status) => computers.filter((item) => item.estatus === status).length;

  return (
    <View style={styles.page}>
      <Text style={styles.eyebrow}>Resumen general</Text>
      <Text style={styles.title}>Panel principal</Text>
      <View style={styles.cards}>
        <View style={styles.card}><Text>Disponibles</Text><Text style={[styles.number, { color: '#16A34A' }]}>{count('DISPONIBLE')}</Text></View>
        <View style={styles.card}><Text>Ocupadas</Text><Text style={[styles.number, { color: '#DC2626' }]}>{count('OCUPADA')}</Text></View>
        <View style={styles.card}><Text>Mantenimiento</Text><Text style={[styles.number, { color: '#EAB308' }]}>{count('MANTENIMIENTO')}</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F5F7FA', padding: 16 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { color: '#64748B', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  cards: { gap: 10 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#E3E9F1' },
  number: { fontSize: 32, fontWeight: '800', marginTop: 6 },
});

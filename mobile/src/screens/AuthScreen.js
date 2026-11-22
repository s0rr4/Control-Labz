import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen({ navigation, route }) {
  const register = route?.name === 'Register';
  const { saveSession } = useAuth();
  const [form, setForm] = useState({ nombre: '', matricula: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const payload = register ? { ...form, rol: 'USER' } : { email: form.email, password: form.password };
      const result = register ? await authApi.register(payload) : await authApi.login(payload);
      await saveSession(result);
    } catch (requestError) {
      setError(requestError.status === 403 ? 'Acceso restringido.' : requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.brand}><View style={styles.mark}><Text style={styles.markText}>UTR</Text></View><Text style={styles.title}>Control de Laboratorios</Text></View>
      <View style={styles.card}>
        <Text style={styles.heading}>{register ? 'Crear cuenta' : 'Iniciar sesión'}</Text>
        {register && <><TextInput style={styles.input} placeholder="Nombre completo" value={form.nombre} onChangeText={(value) => handleChange('nombre', value)} /><TextInput style={styles.input} placeholder="Matrícula" value={form.matricula} onChangeText={(value) => handleChange('matricula', value)} /></>}
        <TextInput style={styles.input} placeholder="Correo electrónico" autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={(value) => handleChange('email', value)} />
        <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={form.password} onChangeText={(value) => handleChange('password', value)} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.primary} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{register ? 'Registrarme' : 'Entrar'}</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.replace(register ? 'Login' : 'Register')}>
          <Text style={styles.switch}>{register ? 'Ya tengo cuenta' : 'Crear una cuenta'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F5F7FA', padding: 24, justifyContent: 'center' },
  brand: { alignItems: 'center', marginBottom: 24 },
  mark: { width: 58, height: 58, borderRadius: 12, backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center' },
  markText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  title: { color: '#1F2937', fontSize: 22, fontWeight: '800', marginTop: 12 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 20, gap: 11, borderWidth: 1, borderColor: '#E7ECF3', shadowColor: '#1F2937', shadowOpacity: 0.14, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  heading: { fontSize: 24, fontWeight: '800', color: '#1F2937', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#D8E0EA', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11, backgroundColor: '#fff' },
  primary: { height: 48, borderRadius: 8, backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryText: { color: '#fff', fontWeight: '800' },
  switch: { color: '#DC2626', textAlign: 'center', fontWeight: '700', padding: 8 },
  error: { color: '#991B1B', backgroundColor: '#FEE2E2', borderRadius: 8, padding: 10 },
});

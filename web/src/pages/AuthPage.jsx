import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export default function AuthPage({ mode = 'login' }) {
  const isRegister = mode === 'register';
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const [form, setForm] = useState({ nombre: '', matricula: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = isRegister
        ? { ...form, rol: 'USER' }
        : { email: form.email, password: form.password };
      const result = isRegister
        ? await authService.register(payload)
        : await authService.login(payload);
      saveSession(result);
      navigate('/labs');
    } catch (requestError) {
      setError(requestError.status === 403
        ? 'Acceso restringido.'
        : requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-brand">
        <div className="brand-mark large">UTR</div>
        <h1>Sistema de Control de Laboratorios</h1>
        <p>Asignación, monitoreo y administración de estaciones de cómputo.</p>
      </section>
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-heading">
          <span className="eyebrow">{isRegister ? 'Nueva cuenta' : 'Acceso institucional'}</span>
          <h2>{isRegister ? 'Crear registro' : 'Iniciar sesión'}</h2>
        </div>
        {isRegister && (
          <>
            <label>Nombre completo<input name="nombre" value={form.nombre} onChange={handleChange} required /></label>
            <label>Matrícula<input name="matricula" value={form.matricula} onChange={handleChange} required /></label>
          </>
        )}
        <label>{isRegister ? 'Correo electrónico' : 'Correo electrónico o usuario'}<input name="email" type={isRegister ? 'email' : 'text'} value={form.email} onChange={handleChange} required /></label>
        <label>Contraseña<input name="password" type="password" minLength={isRegister ? 8 : 1} value={form.password} onChange={handleChange} required /></label>
        {error && <div className="alert error">{error}</div>}
        <button className="primary-button full" disabled={loading}>{loading ? 'Procesando...' : (isRegister ? 'Registrarme' : 'Entrar')}</button>
        <p className="auth-switch">
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
          <Link to={isRegister ? '/login' : '/register'}>{isRegister ? ' Iniciar sesión' : ' Registrarme'}</Link>
        </p>
      </form>
    </main>
  );
}

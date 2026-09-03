import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Lock, Mail, Store, Sparkles, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/mayluce" replace />;

  const translateError = (code: string) => {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found': return 'E-mail ou senha incorretos.';
      case 'auth/email-already-in-use': return 'Este e-mail já possui uma conta.';
      case 'auth/weak-password': return 'A senha deve ter no mínimo 6 caracteres.';
      case 'auth/invalid-email': return 'E-mail inválido.';
      default: return 'Ocorreu um erro. Tente novamente.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await signup(email.trim(), password, storeName);
      }
      navigate('/mayluce', { replace: true });
    } catch (err: any) {
      setError(translateError(err?.code || ''));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--store-bg-gradient, linear-gradient(180deg, #ffffff 0%, #f9fafb 100%))' }}>
      <div className="glass-card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="relative w-14 h-14 mx-auto mb-4 flex items-center justify-center overflow-hidden rounded-2xl">
            <div className="absolute inset-0 rounded-2xl" style={{ background: 'var(--store-gradient, linear-gradient(135deg, #4B5563, #111827))' }} />
            <span className="relative text-2xl select-none">🌸</span>
          </div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--color-primary, #8C4A5A)', fontFamily: 'Georgia, serif' }}>
            {mode === 'login' ? 'Bem-vindo(a) de volta' : 'Criar sua loja'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted, #9E8B92)' }}>
            {mode === 'login' ? 'Acesse o painel da sua loja' : 'Crie sua conta com catálogo exclusivo'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="relative">
              <Store size={18} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-muted, #9E8B92)' }} />
              <input
                type="text"
                required
                placeholder="Nome da sua loja"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="glass-input w-full p-3 pl-10 outline-none"
              />
            </div>
          )}

          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-muted, #9E8B92)' }} />
            <input
              type="email"
              required
              placeholder="Seu e-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="glass-input w-full p-3 pl-10 outline-none"
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-muted, #9E8B92)' }} />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Sua senha (mín. 6 caracteres)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="glass-input w-full p-3 pl-10 outline-none"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && (
            <p className="text-sm font-semibold px-3 py-2 rounded-lg" style={{ background: 'rgba(180,60,60,0.08)', color: '#B43C3C' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3.5 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
            style={{ background: 'var(--store-gradient, linear-gradient(135deg, #4B5563, #111827))', boxShadow: '0 4px 15px rgba(140,74,90,0.25)' }}
          >
            {busy ? <Loader2 size={18} className="animate-spin" /> : mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
            {busy ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            className="text-sm font-semibold flex items-center justify-center gap-1.5 mx-auto cursor-pointer hover:underline"
            style={{ color: 'var(--color-primary, #8C4A5A)' }}
          >
            <Sparkles size={14} />
            {mode === 'login' ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
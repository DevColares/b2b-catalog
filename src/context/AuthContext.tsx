import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updatePassword as fbUpdatePassword, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getProfile, updateProfile, subscribeToProfile, DEFAULT_PROFILE } from '../lib/db';
import type { BusinessModel, UserProfile } from '../lib/db';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, storeName: string, businessModel?: BusinessModel) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  saveProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ---------- Aplicação do tema via CSS custom properties ---------- */

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function darken(hex: string, amount = 0.12): string {
  const [r, g, b] = hexToRgb(hex);
  const f = (c: number) => Math.max(0, Math.round(c * (1 - amount)));
  return `#${[f(r), f(g), f(b)].map(c => c.toString(16).padStart(2, '0')).join('')}`;
}

function tint(hex: string, amount = 0.75): string {
  const [r, g, b] = hexToRgb(hex);
  const f = (c: number) => Math.round(c + (255 - c) * amount);
  return `#${[f(r), f(g), f(b)].map(c => c.toString(16).padStart(2, '0')).join('')}`;
}

export function applyTheme(profile: UserProfile | null) {
  const t = profile?.theme ?? DEFAULT_PROFILE.theme;
  const root = document.documentElement;
  root.style.setProperty('--color-primary', t.primary);
  root.style.setProperty('--color-primary-hover', darken(t.primary));
  root.style.setProperty('--color-accent', t.secondary);
  root.style.setProperty('--color-accent-soft', tint(t.secondary, 0.7));
  root.style.setProperty('--store-gradient', `linear-gradient(135deg, ${t.accent} 0%, ${darken(t.accent, 0.08)} 40%, ${darken(t.secondary, 0.15)} 100%)`);
  root.style.setProperty('--store-gradient-hover', `linear-gradient(135deg, ${darken(t.accent, 0.2)} 0%, ${darken(t.primary, 0.1)} 100%)`);
  root.style.setProperty('--store-bg-gradient', `linear-gradient(135deg, ${tint(t.secondary, 0.9)} 0%, ${tint(t.secondary, 0.82)} 50%, ${tint(t.primary, 0.8)} 100%)`);
  applyBranding(profile);
}

// Atualiza o título da aba e o favicon (ícone) conforme a loja
export function applyBranding(profile: UserProfile | null) {
  const storeName = profile?.title?.trim();
  document.title = storeName ? `${storeName} — Catálogo` : 'Catálogo';

  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  // Favicon = logo da loja (se houver) ou o ícone padrão
  link.href = profile?.logoUrl || '/favicon.svg';
}

/* ---------------------------------------------------------------- */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setProfile(null);
      if (u) {
        // Garante que o perfil exista (contas antigas ou criadas fora do app)
        try {
          const p = await getProfile(u.uid);
          if (!p.createdAt) await updateProfile(u.uid, { ownerEmail: u.email ?? undefined });
          setProfile(p);
          applyTheme(p);
          // Mantém o tema sincronizado em tempo real
          subscribeToProfile(u.uid, (fresh) => {
            setProfile(fresh);
            applyTheme(fresh);
          });
        } catch (e) {
          console.error('Erro ao carregar perfil:', e);
          setProfile(DEFAULT_PROFILE);
          applyTheme(DEFAULT_PROFILE);
        }
      } else {
        applyTheme(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signup = useCallback(async (email: string, password: string, storeName: string, businessModel: BusinessModel = 'general') => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user.uid, {
      ...DEFAULT_PROFILE,
      title: storeName.trim() || 'Minha Loja',
      businessModel,
      ownerEmail: email,
      createdAt: new Date(),
    });
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const changePassword = useCallback(async (newPassword: string) => {
    const u = auth.currentUser;
    if (!u) throw new Error('Usuário não autenticado');
    await fbUpdatePassword(u, newPassword);
  }, []);

  const saveProfile = useCallback(async (data: Partial<UserProfile>) => {
    const u = auth.currentUser;
    if (!u) throw new Error('Usuário não autenticado');
    await updateProfile(u.uid, data);
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signup, logout, changePassword, saveProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
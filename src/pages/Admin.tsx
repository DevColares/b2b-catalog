import { useState } from 'react';
import { Menu, X, Package, ShoppingCart, LogOut, Settings, ExternalLink } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Admin() {
  // Tema fixo: apenas claro (branco com tons de rosa)
  const isDarkMode = false;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen lg:flex transition-colors duration-300" style={{ background: isDarkMode ? 'linear-gradient(135deg, #12030d 0%, #1e0918 30%, #17041c 60%, #1c051a 100%)' : 'var(--store-bg-gradient, linear-gradient(180deg, #ffffff 0%, #f9fafb 100%))' }}>
      {/* Top Bar (apenas mobile) */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-16 shadow-md" style={{ background: 'var(--store-gradient, linear-gradient(90deg, #e2709d 0%, #d35a8e 40%, #8b74d8 100%))', color: '#fff' }}>
        <div className="flex items-center gap-2">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/10 cursor-pointer text-white" aria-label="Abrir menu">
            <Menu size={22} />
          </button>
          <span className="flex items-center gap-2 font-black text-white" style={{ fontFamily: 'Georgia, serif' }}>
            <span className="text-lg">🌸</span> Painel Admin
          </span>
        </div>
      </header>

      {/* Backdrop (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 flex flex-col shadow-xl border-r transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ background: 'var(--store-gradient, linear-gradient(180deg, #d96c9f 0%, #d35a8e 40%, #8b74d8 100%))', borderColor: 'rgba(255,255,255,0.1)' }}>
        {/* Botão fechar (mobile) */}
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 cursor-pointer text-white" aria-label="Fechar menu">
          <X size={20} />
        </button>
        {/* Logo / Branding */}
        <div className="p-6 pb-4 pr-14 lg:pr-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-11 h-11 flex items-center justify-center flex-shrink-0 overflow-hidden rounded-2xl">
              <div className="absolute inset-0 rounded-2xl" style={{ background: 'var(--store-gradient, linear-gradient(135deg, #f8c1de, #c9a5f2))' }}></div>
              {profile?.logoUrl ? (
                <img src={profile.logoUrl} alt="Logo" className="relative w-full h-full object-contain p-1" style={{ background: '#ffffff' }} />
              ) : (
                <span className="relative text-2xl select-none">🌸</span>
              )}
            </div>
            <div>
              <h1 className="font-black text-base leading-tight text-white truncate" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>{profile?.title || 'Minha Loja'}</h1>
              <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em' }}>PAINEL ADMIN</p>
            </div>
          </div>
          <div className="h-px w-full" style={{ background: 'linear-gradient(to right, transparent, rgba(249,168,212,0.4), transparent)' }}></div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-2">
          <NavLink to="/mayluce" end onClick={() => setSidebarOpen(false)} className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive ? 'shadow-lg' : 'hover:bg-white/10'}`} style={({ isActive }) => isActive ? { background: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(8px)' } : { color: 'rgba(255,255,255,0.8)' }}>
            <ShoppingCart size={20} />
            Pedidos
          </NavLink>
          <NavLink to="/mayluce/products" onClick={() => setSidebarOpen(false)} className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive ? 'shadow-lg' : 'hover:bg-white/10'}`} style={({ isActive }) => isActive ? { background: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(8px)' } : { color: 'rgba(255,255,255,0.8)' }}>
            <Package size={20} />
            Produtos
          </NavLink>
          <NavLink to="/mayluce/settings" onClick={() => setSidebarOpen(false)} className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive ? 'shadow-lg' : 'hover:bg-white/10'}`} style={({ isActive }) => isActive ? { background: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(8px)' } : { color: 'rgba(255,255,255,0.8)' }}>
            <Settings size={20} />
            Configurações
          </NavLink>
        </nav>

        {/* Link do catálogo público */}
        <div className="px-4 py-2">
          <a
            href={`/loja/${user?.uid}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.8)' }}
          >
            <ExternalLink size={20} />
            Ver minha loja
          </a>
        </div>

        {/* Decorative element */}
        <div className="px-6 py-2">
          <div className="h-px w-full" style={{ background: 'linear-gradient(to right, transparent, rgba(249,168,212,0.4), transparent)' }}></div>
        </div>

        <div className="p-4">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg cursor-pointer" style={{ color: 'rgba(255,255,255,0.9)', background: 'transparent' }} onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(239,68,68,0.2)' }} onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent' }}>
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 admin-main overflow-y-auto lg:h-screen transition-colors duration-300" style={{ background: isDarkMode ? 'linear-gradient(135deg, #1a0a14 0%, #1e0c1a 40%, #150a1e 100%)' : 'var(--store-bg-gradient, linear-gradient(180deg, #ffffff 0%, #f9fafb 100%))' }}>
        <Outlet />
      </main>
    </div>
  );
}

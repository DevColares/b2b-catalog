import { useState, useEffect } from 'react';
import { Package, ShoppingCart, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

export function Admin() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.body.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen flex transition-colors duration-300" style={{background: isDarkMode ? 'linear-gradient(135deg, #12030d 0%, #1e0918 30%, #17041c 60%, #1c051a 100%)' : 'linear-gradient(135deg, #fff0f6 0%, #fce7f3 30%, #fdf2f8 60%, #fff0fb 100%)'}}>
      {/* Sidebar */}
      <aside className="w-64 flex flex-col shadow-xl border-r" style={{background: 'linear-gradient(180deg, #9d174d 0%, #be185d 40%, #7e22ce 100%)', borderColor: 'rgba(255,255,255,0.1)'}}>
        {/* Logo / Branding */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-11 h-11 flex items-center justify-center flex-shrink-0">
              <div className="absolute inset-0 rounded-2xl" style={{background: 'linear-gradient(135deg, #f9a8d4, #e879f9)'}}></div>
              <span className="relative text-2xl select-none">🌸</span>
            </div>
            <div>
              <h1 className="font-black text-base leading-tight text-white" style={{fontFamily: 'Georgia, serif', letterSpacing: '-0.5px'}}>Super Ketlen Myluce</h1>
              <p className="text-xs font-semibold" style={{color: '#f9a8d4', letterSpacing: '0.05em'}}>PAINEL ADMIN</p>
            </div>
          </div>
          <div className="h-px w-full" style={{background: 'linear-gradient(to right, transparent, rgba(249,168,212,0.4), transparent)'}}></div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-2">
          <NavLink to="/admin" end className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive ? 'shadow-lg' : 'hover:bg-white/10'}`} style={({ isActive }) => isActive ? {background: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(8px)'} : {color: '#f9a8d4'}}>
            <ShoppingCart size={20} />
            Pedidos
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive ? 'shadow-lg' : 'hover:bg-white/10'}`} style={({ isActive }) => isActive ? {background: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(8px)'} : {color: '#f9a8d4'}}>
            <Package size={20} />
            Produtos
          </NavLink>
          <NavLink to="/admin/settings" className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive ? 'shadow-lg' : 'hover:bg-white/10'}`} style={({ isActive }) => isActive ? {background: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(8px)'} : {color: '#f9a8d4'}}>
            <Settings size={20} />
            Configurações
          </NavLink>
        </nav>

        {/* Theme Selector */}
        <div className="px-6 py-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold border transition-all hover:bg-white/10 text-white cursor-pointer"
            style={{borderColor: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.05)'}}
          >
            {isDarkMode ? (
              <>
                <Sun size={18} />
                <span>Modo Claro</span>
              </>
            ) : (
              <>
                <Moon size={18} />
                <span>Modo Escuro</span>
              </>
            )}
          </button>
        </div>

        {/* Decorative element */}
        <div className="px-6 py-2">
          <div className="h-px w-full" style={{background: 'linear-gradient(to right, transparent, rgba(249,168,212,0.4), transparent)'}}></div>
        </div>

        <div className="p-4">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg cursor-pointer" style={{color: '#fecdd3', background: 'transparent'}} onMouseEnter={e => {(e.target as HTMLElement).style.background = 'rgba(239,68,68,0.2)'}} onMouseLeave={e => {(e.target as HTMLElement).style.background = 'transparent'}}>
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto h-screen transition-colors duration-300" style={{background: isDarkMode ? 'linear-gradient(135deg, #1a0a14 0%, #1e0c1a 40%, #150a1e 100%)' : 'linear-gradient(135deg, #fff0f6 0%, #fce7f3 30%, #fdf2f8 60%, #fff0fb 100%)'}}>
        <Outlet />
      </main>
    </div>
  );
}

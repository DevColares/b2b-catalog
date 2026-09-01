import { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';
import { getCatalogSettings, updateCatalogSettings } from '../lib/db';

export function AdminSettings() {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getCatalogSettings().then(s => {
      setTitle(s.title);
      setSubtitle(s.subtitle || '');
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCatalogSettings({ title: title.trim(), subtitle: subtitle.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title font-bold flex items-center gap-3" style={{color:'#c2458f'}}>
            <Settings size={32} style={{color:'#e2569a'}} />
            Configurações do Catálogo
          </h1>
          <p className="mt-1" style={{color:'#b0658a'}}>Personalize o título exibido para as revendedoras</p>
        </div>
      </header>

      <div className="rounded-2xl shadow-lg border p-8 max-w-xl w-full" style={{background:'#ffffff', borderColor:'#1e293b'}}>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2" style={{color:'#c2458f'}}>
              Título Principal do Catálogo
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Promos Ciclo 15"
              className="w-full p-3 rounded-xl border outline-none text-lg font-bold transition-all"
              style={{background:'#fff9fc', borderColor:'#fbcfe8', color:'#1e293b'}}
            />
            <p className="text-xs mt-2" style={{color:'#b0658a'}}>Este título aparece em destaque no banner do catálogo público.</p>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2" style={{color:'#c2458f'}}>
              Subtítulo (opcional)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              placeholder="Ex: Aproveite as ofertas exclusivas!"
              className="w-full p-3 rounded-xl border outline-none transition-all"
              style={{background:'#fff9fc', borderColor:'#fbcfe8', color:'#1e293b'}}
            />
          </div>

          {/* Preview */}
          <div className="rounded-2xl overflow-hidden border" style={{borderColor:'#fbcfe8'}}>
            <p className="text-xs font-semibold px-4 pt-3 pb-1" style={{color:'#b0658a'}}>PRÉVIA</p>
            <div className="p-6 text-center" style={{background:'linear-gradient(135deg, #e2709d 0%, #d35a8e 40%, #8b74d8 100%)'}}>
              <p className="text-pink-200 text-xs font-semibold tracking-widest mb-1 uppercase">✨ Bem-vinda ✨</p>
              <h2 className="text-2xl font-black text-white" style={{fontFamily:'Georgia, serif'}}>
                {title || 'Seu título aqui'}
              </h2>
              {subtitle && <p className="text-pink-200 text-sm mt-1">{subtitle}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-60"
            style={{background:'linear-gradient(135deg, #e2709d, #8b74d8)', boxShadow:'0 4px 15px rgba(226,112,157,0.3)'}}
          >
            <Save size={18} />
            {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar Título'}
          </button>
        </form>
      </div>
    </>
  );
}

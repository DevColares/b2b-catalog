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
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{color:'#f9a8d4'}}>
          <Settings size={32} style={{color:'#ec4899'}} />
          Configurações do Catálogo
        </h1>
        <p className="mt-1" style={{color:'#9d5078'}}>Personalize o título exibido para as revendedoras</p>
      </header>

      <div className="rounded-2xl shadow-lg border p-8 max-w-xl" style={{background:'rgba(30,12,26,0.8)', borderColor:'rgba(190,24,93,0.2)'}}>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2" style={{color:'#f9a8d4'}}>
              Título Principal do Catálogo
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Promos Ciclo 15"
              className="w-full p-3 rounded-xl border outline-none text-lg font-bold transition-all"
              style={{background:'rgba(30,12,26,0.6)', borderColor:'rgba(190,24,93,0.3)', color:'#fce7f3'}}
            />
            <p className="text-xs mt-2" style={{color:'#9d5078'}}>Este título aparece em destaque no banner do catálogo público.</p>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2" style={{color:'#f9a8d4'}}>
              Subtítulo (opcional)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              placeholder="Ex: Aproveite as ofertas exclusivas!"
              className="w-full p-3 rounded-xl border outline-none transition-all"
              style={{background:'rgba(30,12,26,0.6)', borderColor:'rgba(190,24,93,0.3)', color:'#fce7f3'}}
            />
          </div>

          {/* Preview */}
          <div className="rounded-2xl overflow-hidden border" style={{borderColor:'rgba(190,24,93,0.3)'}}>
            <p className="text-xs font-semibold px-4 pt-3 pb-1" style={{color:'#9d5078'}}>PRÉVIA</p>
            <div className="p-6 text-center" style={{background:'linear-gradient(135deg, #be185d 0%, #9d174d 40%, #7e22ce 100%)'}}>
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
            style={{background:'linear-gradient(135deg, #be185d, #7e22ce)', boxShadow:'0 4px 15px rgba(190,24,93,0.3)'}}
          >
            <Save size={18} />
            {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar Título'}
          </button>
        </form>
      </div>
    </>
  );
}

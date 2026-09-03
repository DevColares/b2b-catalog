import { useState, useEffect } from 'react';
import { Settings, Save, Link2, Palette, Store, Copy, Check, ImagePlus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_PROFILE, compressLogo } from '../lib/db';
import type { BusinessModel, StoreTheme } from '../lib/db';

const BUSINESS_MODELS: { value: BusinessModel; label: string; icon: string; desc: string }[] = [
  { value: 'general', label: 'Geral', icon: '🛍️', desc: 'Só quantidade, sem variações' },
  { value: 'cosmetics', label: 'Cosméticos', icon: '🧴', desc: 'Só quantidade (frasco, unidade...)' },
  { value: 'clothing', label: 'Vestuário', icon: '👗', desc: 'Tamanho, cor e variações de roupa' },
];

const PRESETS: { name: string; theme: StoreTheme }[] = [
  { name: 'Branco (Padrão)', theme: { primary: '#111827', secondary: '#E5E7EB', accent: '#4B5563' } },
  { name: 'Rosa Original', theme: { primary: '#8C4A5A', secondary: '#C48B96', accent: '#E2709D' } },
  { name: 'Lavanda', theme: { primary: '#6D5A9E', secondary: '#A79BC8', accent: '#8B74D8' } },
  { name: 'Coral', theme: { primary: '#B05A4E', secondary: '#DE9C90', accent: '#E87361' } },
  { name: 'Esmeralda', theme: { primary: '#2E7D6B', secondary: '#7FB8A8', accent: '#3FA98D' } },
  { name: 'Azul Sereno', theme: { primary: '#3D6B9E', secondary: '#8FAECE', accent: '#5A93D4' } },
  { name: 'Dourado', theme: { primary: '#9A7B3F', secondary: '#CBB078', accent: '#D4A24E' } },
];

export function AdminSettings() {
  const { profile, saveProfile, user } = useAuth();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [theme, setTheme] = useState<StoreTheme>(DEFAULT_PROFILE.theme);
  const [businessModel, setBusinessModel] = useState<BusinessModel>('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [logoError, setLogoError] = useState('');

  const currentLogo = removeLogo ? null : (logoPreview || profile?.logoUrl || null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLogoError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLogoError('Selecione um arquivo de imagem (PNG, JPG, SVG...).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('A imagem deve ter no máximo 2 MB.');
      return;
    }
    setLogoFile(file);
    setRemoveLogo(false);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(true);
  };

  useEffect(() => {
    if (profile) {
      setTitle(profile.title);
      setSubtitle(profile.subtitle || '');
      setTheme(profile.theme ?? DEFAULT_PROFILE.theme);
      setBusinessModel(profile.businessModel || 'general');
    }
  }, [profile]);

  const storeUrl = `${window.location.origin}/loja/${user?.uid}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setLogoError('');
    let uploadFailed = false;
    try {
      let logoUrl: string | null | undefined = undefined;
      if (logoFile) {
        try {
          // Logo comprimido no navegador e salvo direto no Firestore (grátis, sem Storage)
          logoUrl = await compressLogo(logoFile);
        } catch (err: any) {
          uploadFailed = true;
          console.error('Falha ao processar o logo:', err);
          setLogoError(`Erro ao processar o logo: ${err?.message || 'tente novamente'}. Os demais dados foram salvos.`);
        }
      } else if (removeLogo) {
        logoUrl = '';
      }
      await saveProfile({ title: title.trim(), subtitle: subtitle.trim(), theme, businessModel, ...(logoUrl !== undefined ? { logoUrl } : {}) });
      setLogoFile(null);
      setLogoPreview(null);
      setRemoveLogo(false);
      if (!uploadFailed) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err: any) {
      console.error('Erro ao salvar configurações:', err);
      setLogoError('Erro ao salvar as configurações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const colorFields: { key: keyof StoreTheme; label: string; hint: string }[] = [
    { key: 'primary', label: 'Cor Principal', hint: 'Botões, títulos e destaques' },
    { key: 'accent', label: 'Cor de Destaque', hint: 'Gradientes e barra lateral do painel' },
    { key: 'secondary', label: 'Cor Secundária', hint: 'Detalhes e suportes visuais' },
  ];

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title font-bold flex items-center gap-3" style={{color:'var(--color-primary, #c2458f)'}}>
            <Settings size={32} style={{color:'var(--color-accent, #e2569a)'}} />
            Configurações da Loja
          </h1>
          <p className="mt-1" style={{color:'var(--color-accent, #b0658a)'}}>Personalize o nome, o link e a paleta de cores da sua loja</p>
        </div>
      </header>

      <div className="rounded-2xl shadow-lg border p-4 sm:p-8 max-w-xl w-full" style={{background:'#ffffff', borderColor:'#1e293b'}}>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2 flex items-center gap-1.5" style={{color:'var(--color-primary, #c2458f)'}}>
              <Store size={15} /> Nome da Loja
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Promos Ciclo 15"
              className="w-full p-3 rounded-xl border outline-none text-lg font-bold transition-all"
              style={{background:'var(--color-accent-soft, #fff9fc)', borderColor:'var(--color-accent-soft, #fbcfe8)', color:'#1e293b'}}
            />
            <p className="text-xs mt-2" style={{color:'var(--color-accent, #b0658a)'}}>Aparece no cabeçalho da sua loja e no banner do catálogo público.</p>
          </div>

          {/* Modelo de Negócio */}
          <div>
            <label className="block text-sm font-bold mb-2 flex items-center gap-1.5" style={{color:'var(--color-primary, #c2458f)'}}>
              <Store size={15} /> Modelo de Negócio
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {BUSINESS_MODELS.map(m => {
                const active = businessModel === m.value;
                return (
                  <button
                    type="button"
                    key={m.value}
                    onClick={() => setBusinessModel(m.value)}
                    className="rounded-2xl border p-3 text-left transition-all cursor-pointer"
                    style={{
                      borderColor: active ? 'var(--color-primary, #c2458f)' : 'var(--color-accent-soft, #fbcfe8)',
                      background: active ? 'var(--color-accent-soft, #fff9fc)' : '#ffffff',
                    }}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <p className="font-bold text-sm mt-1" style={{color:'var(--color-primary, #c2458f)'}}>{m.label}</p>
                    <p className="text-[11px] mt-0.5" style={{color:'var(--color-accent, #b0658a)'}}>{m.desc}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-xs mt-2" style={{color:'var(--color-accent, #b0658a)'}}>Isso define como as revendedoras escolhem as opções (ex.: vestuário com cor e tamanho).</p>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2" style={{color:'var(--color-primary, #c2458f)'}}>
              Subtítulo (opcional)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              placeholder="Ex: Aproveite as ofertas exclusivas!"
              className="w-full p-3 rounded-xl border outline-none transition-all"
              style={{background:'var(--color-accent-soft, #fff9fc)', borderColor:'var(--color-accent-soft, #fbcfe8)', color:'#1e293b'}}
            />
          </div>

          {/* Logo da loja */}
          <div>
            <label className="block text-sm font-bold mb-2 flex items-center gap-1.5" style={{color:'var(--color-primary, #c2458f)'}}>
              <ImagePlus size={15} /> Logo da Loja
            </label>
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-2xl border flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{background:'var(--color-accent-soft, #fff9fc)', borderColor:'var(--color-accent-soft, #fbcfe8)'}}
              >
                {currentLogo ? (
                  <img src={currentLogo} alt="Logo da loja" className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-2xl">🌸</span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold cursor-pointer transition-all"
                  style={{color:'var(--color-primary, #c2458f)', borderColor:'var(--color-accent-soft, #fbcfe8)', background:'var(--color-accent-soft, #fff9fc)'}}
                >
                  {currentLogo ? 'Trocar logo' : 'Enviar logo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </label>
                {currentLogo && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="ml-2 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold cursor-pointer transition-all"
                    style={{color:'#B43C3C', borderColor:'#f3c4c4', background:'#fdf3f3'}}
                  >
                    <Trash2 size={14} /> Remover
                  </button>
                )}
                <p className="text-xs" style={{color:'var(--color-accent, #b0658a)'}}>PNG, JPG ou SVG até 2 MB. Aparece no catálogo público.</p>
                {logoError && <p className="text-xs font-semibold" style={{color:'#B43C3C'}}>{logoError}</p>}
              </div>
            </div>
          </div>

          {/* Link público */}
          <div>
            <label className="block text-sm font-bold mb-2 flex items-center gap-1.5" style={{color:'var(--color-primary, #c2458f)'}}>
              <Link2 size={15} /> Link da sua loja
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={storeUrl}
                className="w-full p-3 rounded-xl border outline-none text-sm truncate"
                style={{background:'var(--color-accent-soft, #fff9fc)', borderColor:'var(--color-accent-soft, #fbcfe8)', color:'#6e5b62'}}
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 rounded-xl border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer"
                style={{color:'var(--color-primary, #c2458f)', borderColor:'var(--color-accent-soft, #fbcfe8)', background:'var(--color-accent-soft, #fff9fc)'}}
                title="Copiar link"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-xs mt-2" style={{color:'var(--color-accent, #b0658a)'}}>Compartilhe com suas revendedoras para verem o catálogo e fazerem pedidos.</p>
          </div>

          {/* Paleta de cores */}
          <div>
            <label className="block text-sm font-bold mb-2 flex items-center gap-1.5" style={{color:'var(--color-primary, #c2458f)'}}>
              <Palette size={15} /> Paleta de Cores
            </label>

            <div className="flex flex-wrap gap-2 mb-4">
              {PRESETS.map(p => {
                const active = p.theme.primary === theme.primary && p.theme.accent === theme.accent;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setTheme(p.theme)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer"
                    style={{
                      borderColor: active ? 'var(--color-primary, #c2458f)' : 'var(--color-accent-soft, #fbcfe8)',
                      background: active ? '#e5e7eb' : 'var(--color-accent-soft, #fff9fc)',
                      color: 'var(--color-primary, #c2458f)',
                    }}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-white/60" style={{ background: `linear-gradient(135deg, ${p.theme.accent}, ${p.theme.primary})` }} />
                    {p.name}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              {colorFields.map(f => (
                <div key={f.key} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme[f.key]}
                    onChange={e => setTheme({ ...theme, [f.key]: e.target.value })}
                    className="w-12 h-10 rounded-lg border cursor-pointer p-1"
                    style={{borderColor:'var(--color-accent-soft, #fbcfe8)', background:'var(--color-accent-soft, #fff9fc)'}}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold" style={{color:'var(--color-primary, #c2458f)'}}>{f.label}</p>
                    <p className="text-xs" style={{color:'var(--color-accent, #b0658a)'}}>{f.hint}</p>
                  </div>
                  <span className="text-xs font-mono px-2 py-1 rounded-lg" style={{background:'var(--color-accent-soft, #fff9fc)', color:'#6e5b62', border:'1px solid #fbcfe8'}}>
                    {theme[f.key].toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-2xl overflow-hidden border" style={{borderColor:'var(--color-accent-soft, #fbcfe8)'}}>
            <p className="text-xs font-semibold px-4 pt-3 pb-1" style={{color:'var(--color-accent, #b0658a)'}}>PRÉVIA</p>
            <div className="p-6 text-center" style={{background:`linear-gradient(135deg, ${theme.accent} 0%, ${theme.secondary} 40%, ${theme.primary} 100%)`}}>
              <p className="text-xs font-semibold tracking-widest mb-1 uppercase" style={{color:'rgba(255,255,255,0.8)'}}>Boas-vindas</p>
              <h2 className="text-2xl font-black text-white" style={{fontFamily:'Georgia, serif'}}>
                {title || 'Seu título aqui'}
              </h2>
              {subtitle && <p className="text-sm mt-1" style={{color:'rgba(255,255,255,0.85)'}}>{subtitle}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-60"
            style={{background:`linear-gradient(135deg, ${theme.accent}, ${theme.primary})`, boxShadow:'0 4px 15px rgba(226,112,157,0.3)'}}
          >
            <Save size={18} />
            {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar Personalização'}
          </button>
        </form>
      </div>
    </>
  );
}

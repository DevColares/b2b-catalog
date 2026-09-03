import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, ShoppingBag, CheckCircle2, XCircle, X } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { FeaturedCard } from '../components/FeaturedCard';
import { CartDrawer } from '../components/CartDrawer';
import { applyTheme } from '../context/AuthContext';
import { subscribeToProducts, createOrder, subscribeToProfile } from '../lib/db';
import type { Product, UserProfile } from '../lib/db';
import { makeVariantKey, parseVariantKey } from '../utils/whatsapp';
import type { OrderItem } from '../utils/whatsapp';

export function Catalog({ uid }: { uid: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  // Carrinho: chave = makeVariantKey(produtoId, cor, tamanho) → quantidade
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // Splash até os primeiros dados do perfil e dos produtos chegarem (evita flash do conteúdo padrão)
  const [loading, setLoading] = useState(true);
  const loaded = useRef({ profile: false, products: false });
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  // Tema fixo: apenas claro
  const isDarkMode = false;

  // Auto-dismiss do popup de notificação
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const unsubscribe = subscribeToProducts(uid, (data) => {
      setProducts(data);
      loaded.current.products = true;
      if (loaded.current.profile) setLoading(false);
    });
    return () => unsubscribe();
  }, [uid]);

  useEffect(() => {
    const unsubscribe = subscribeToProfile(uid, (p) => {
      setProfile(p);
      // Aplica o tema + branding da loja (título da aba, favicon, cores)
      applyTheme(p);
      loaded.current.profile = true;
      if (loaded.current.products) setLoading(false);
    });
    return () => unsubscribe();
  }, [uid]);

  // Segurança: se os dados demorarem demais, sai do splash mesmo assim
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 10000);
    return () => clearTimeout(timer);
  }, [uid]);

  // Tela de carregamento (splash neutro, sem conteúdo padrão piscando)
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#ffffff' }}>
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 animate-spin" style={{ borderTopColor: 'var(--color-primary, #111827)' }} />
        <p className="text-sm font-semibold" style={{ color: '#6b7280' }}>Carregando catálogo...</p>
      </div>
    );
  }

  const catalogTitle = profile?.title || 'Catálogo';
  const catalogSubtitle = profile?.subtitle || '';

  // Atualiza a quantidade de uma combinação específica (cor/tamanho)
  const handleUpdateQuantity = (variantKey: string, qty: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (qty <= 0) {
        delete newCart[variantKey];
      } else {
        newCart[variantKey] = qty;
      }
      return newCart;
    });
  };

  const cartItems: OrderItem[] = useMemo(() => {
    return Object.entries(cart).map(([key, quantity]) => {
      const { productId, color, size } = parseVariantKey(key);
      const p = products.find(prod => prod.id === productId);
      if (!p) return null;

      let price = (p.promoPrice > 0 && p.promoPrice < p.regularPrice) ? p.promoPrice : p.regularPrice;

      // Apply progressive discount if applicable
      if (p.progressiveDiscounts && p.progressiveDiscounts.length > 0) {
        const applicableTiers = p.progressiveDiscounts.filter(tier => quantity >= tier.minQuantity);
        if (applicableTiers.length > 0) {
          applicableTiers.sort((a, b) => b.minQuantity - a.minQuantity);
          const bestTier = applicableTiers[0];
          const basePrice = p.regularPrice;
          price = basePrice - (basePrice * bestTier.discountPercentage / 100);
        }
      }

      return {
        productId,
        title: p.title,
        sku: p.sku,
        color,
        size,
        variantKey: key,
        quantity,
        unitPrice: price
      };
    }).filter(Boolean) as OrderItem[];
  }, [cart, products]);

  // Soma de todas as combinações de um produto (para exibir no badge do card)
  const totalForProduct = useMemo(() => (productId: string) => {
    return Object.entries(cart).reduce((sum, [key, qty]) => {
      if (parseVariantKey(key).productId === productId) return sum + qty;
      return sum;
    }, 0);
  }, [cart]);

  const totalCartItems = Object.values(cart).reduce((a, b) => a + b, 0);

  const filteredProducts = products.filter(p => 
    p.isActive && p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Carrossel = apenas ofertas/destaques. A grade abaixo lista TODOS os produtos ativos.
  const featuredProducts = filteredProducts.filter(p => p.isFeatured);

  const handleSubmitOrder = async (name: string, phone: string, resellerCode: string) => {
    const totalAmount = cartItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    
    try {
      await createOrder(uid, {
        resellerName: name,
        resellerPhone: phone,
        resellerCode: resellerCode || undefined,
        totalAmount,
        items: cartItems,
        status: 'pending'
      });

      setToast({ type: 'success', message: 'Pedido enviado com sucesso para o painel de vendas!' });
      
      // Clear cart and close drawer
      setCart({});
      setIsCartOpen(false);
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      setToast({ type: 'error', message: 'Houve um erro ao enviar seu pedido. Tente novamente.' });
    }
  };

  return (
    <div className="min-h-screen pb-20 transition-colors duration-300" style={{background: 'var(--store-bg-gradient, linear-gradient(180deg, #ffffff 0%, #f9fafb 100%))'}}>
      {/* Header */}
      <header className="glass-header sticky top-0 z-30 border-b transition-colors duration-300" style={isDarkMode ? {background: 'rgba(30,9,24,0.85)', borderColor: '#831843'} : {borderColor: 'rgba(255,255,255,0.6)', boxShadow: '0 4px 20px 0 rgba(140,74,90,0.08)'}}>
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Feminine floral logo */}
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center flex-shrink-0">
              <div className="absolute inset-0 rounded-2xl glass overflow-hidden" style={{background: 'var(--store-gradient, linear-gradient(135deg, #4B5563, #111827))'}}>
                {profile?.logoUrl ? (
                  <img src={profile.logoUrl} alt="Logo" className="relative w-full h-full object-contain p-1.5" style={{ background: '#ffffff' }} />
                ) : (
                  <span className="relative w-full h-full flex items-center justify-center text-xl sm:text-2xl select-none">🌸</span>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="font-black text-base sm:text-lg leading-none truncate" style={{color: isDarkMode ? 'var(--color-accent-soft, #fbcfe8)' : 'var(--color-primary, #8C4A5A)', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.5px'}}>{catalogTitle}</h1>
              <p className="hidden sm:block text-xs font-semibold mt-1" style={{color: isDarkMode ? '#f472b6' : 'var(--color-accent, #C48B96)', letterSpacing: '0.05em'}}>CATÁLOGO EXCLUSIVO</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 rounded-xl transition-all border"
              style={{background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.92)', borderColor: isDarkMode ? '#831843' : 'rgba(255,255,255,0.7)', boxShadow: isDarkMode ? 'none' : '0 4px 14px 0 rgba(140,74,90,0.15)'}}
            >
              <ShoppingBag size={22} style={{color: isDarkMode ? 'var(--color-accent-soft, #fbcfe8)' : 'var(--color-primary, #8C4A5A)'}} />
              {totalCartItems > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold border-2 border-white shadow-sm" style={{background:'var(--color-primary, #8C4A5A)', color:'#fff'}}>
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Search */}
      <div className="glass-hero py-10 sm:py-14 px-4 mb-8 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -left-10 w-52 h-52 rounded-full opacity-40" style={{background:'radial-gradient(circle, var(--color-accent, #C48B96), transparent)'}}></div>
        <div className="absolute -bottom-16 -right-10 w-72 h-72 rounded-full opacity-40" style={{background:'radial-gradient(circle, var(--color-accent-soft, #F2D6DC), transparent)'}}></div>

        <div className="max-w-3xl mx-auto text-center relative">
          <p className="text-primary text-xs sm:text-sm font-semibold tracking-widest mb-2 uppercase">Boas-vindas</p>
          {/* Dynamic catalog title */}
          <h2 className="hero-title font-black mb-2" style={{color:'#2D1E23', fontFamily:"'Plus Jakarta Sans', sans-serif", textShadow:'0 2px 20px rgba(255,255,255,0.6)'}}>
            {catalogTitle}
          </h2>
          {catalogSubtitle && (
            <p className="text-ink-secondary text-sm sm:text-base mb-6">{catalogSubtitle}</p>
          )}
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="text-primary/60" size={22} />
            </div>
            <input 
              type="text" 
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-12 pr-4 py-4 text-lg outline-none"
            />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <main className="max-w-6xl mx-auto px-4">
        
        {/* Featured Marquee Carousel */}
        {featuredProducts.length > 0 && !searchQuery && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-black flex items-center gap-2" style={{color: isDarkMode ? 'var(--color-accent-soft, #fce7f3)' : '#2d1e23'}}>
                <span className="inline-block w-2 h-5 bg-primary rounded-full"></span>
                Destaques
              </h3>
            </div>

            {/* Overflow mask */}
            <div className="overflow-hidden w-full carousel-fade">
              {/* Duplicated track for seamless loop */}
              <div className="flex gap-4 marquee-track w-max">
                {[...featuredProducts, ...featuredProducts].map((product, idx) => (
                  <div key={`${product.id}-${idx}`} className="w-[200px] md:w-[230px] flex-shrink-0">
                    <FeaturedCard
                      product={product}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold" style={{color: isDarkMode ? 'var(--color-accent-soft, #fce7f3)' : '#2d1e23'}}>
            {searchQuery ? 'Resultados da Busca' : 'Todos os Produtos'}
          </h3>
          <span className="text-sm font-medium" style={{color: isDarkMode ? '#f472b6' : '#6b7280'}}>
            {filteredProducts.length} encontrados
          </span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={product.id ? totalForProduct(product.id) : 0}
                onUpdateQuantity={handleUpdateQuantity}
                onGetQuantity={(pid, color, size) => cart[makeVariantKey(pid, color, size)] || 0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20" style={{color: isDarkMode ? '#f472b6' : '#6b7280'}}>
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">Nenhum produto encontrado para "{searchQuery}"</p>
          </div>
        )}
      </main>

      {/* Popup de notificação (pedido enviado / erro) */}
      {toast && (
        <div 
          className="toast-pop fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-md"
          role="status"
          aria-live="polite"
        >
          <div 
            className="flex items-start gap-3 p-4 rounded-2xl border"
            style={{
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              borderColor: toast.type === 'success' ? 'rgba(17,24,39,0.15)' : 'rgba(180,60,60,0.25)',
              boxShadow: '0 12px 40px 0 rgba(17,24,39,0.18)'
            }}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 size={24} className="flex-shrink-0 mt-0.5" style={{color: 'var(--color-primary, #8C4A5A)'}} />
            ) : (
              <XCircle size={24} className="flex-shrink-0 mt-0.5" style={{color: '#B43C3C'}} />
            )}
            <div className="flex-1">
              <p className="font-bold text-sm" style={{color: toast.type === 'success' ? 'var(--color-primary, #8C4A5A)' : '#B43C3C'}}>
                {toast.type === 'success' ? 'Pedido confirmado' : 'Ops, algo deu errado'}
              </p>
              <p className="text-sm mt-0.5" style={{color: '#6E5B62'}}>{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast(null)}
              aria-label="Fechar notificação"
              className="p-1 rounded-full transition-colors hover:bg-white/70 flex-shrink-0"
              style={{color: '#6b7280'}}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onSubmitOrder={handleSubmitOrder}
      />
    </div>
  );
}

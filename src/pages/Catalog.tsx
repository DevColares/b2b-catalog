import { useState, useMemo, useEffect } from 'react';
import { Search, ShoppingBag, Sun, Moon } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { CartDrawer } from '../components/CartDrawer';
import { subscribeToProducts, createOrder } from '../lib/db';
import { subscribeToCatalogSettings } from '../lib/db';
import type { Product } from '../lib/db';
import type { OrderItem } from '../utils/whatsapp';

export function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [catalogTitle, setCatalogTitle] = useState('Ofertas do Ciclo');
  const [catalogSubtitle, setCatalogSubtitle] = useState('');
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

  useEffect(() => {
    const unsubscribe = subscribeToProducts((data) => {
      setProducts(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToCatalogSettings((s) => {
      setCatalogTitle(s.title);
      setCatalogSubtitle(s.subtitle || '');
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateQuantity = (id: string, qty: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (qty <= 0) {
        delete newCart[id];
      } else {
         newCart[id] = qty;
      }
      return newCart;
    });
  };

  const cartItems: OrderItem[] = useMemo(() => {
    return Object.entries(cart).map(([id, quantity]) => {
      const p = products.find(prod => prod.id === id);
      if (!p) return null;
      
      let price = (p.promoPrice > 0 && p.promoPrice < p.regularPrice) ? p.promoPrice : p.regularPrice;
      
      // Apply progressive discount if applicable
      if (p.progressiveDiscounts && p.progressiveDiscounts.length > 0) {
        // Find the best applicable discount tier based on quantity
        const applicableTiers = p.progressiveDiscounts.filter(tier => quantity >= tier.minQuantity);
        if (applicableTiers.length > 0) {
          // Sort by minQuantity descending to get the highest tier the user reached
          applicableTiers.sort((a, b) => b.minQuantity - a.minQuantity);
          const bestTier = applicableTiers[0];
          
          const basePrice = p.regularPrice; // Progressive discount applies to regular price usually
          price = basePrice - (basePrice * bestTier.discountPercentage / 100);
        }
      }

      return {
        productId: id,
        title: p.title,
        sku: p.sku,
        quantity,
        unitPrice: price
      };
    }).filter(Boolean) as OrderItem[];
  }, [cart, products]);

  const totalCartItems = Object.values(cart).reduce((a, b) => a + b, 0);

  const filteredProducts = products.filter(p => 
    p.isActive && p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredProducts = filteredProducts.filter(p => p.isFeatured);
  const regularProducts = filteredProducts.filter(p => !p.isFeatured);

  const handleSubmitOrder = async (name: string, phone: string, notes: string, resellerCode: string) => {
    const totalAmount = cartItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    
    try {
      await createOrder({
        resellerName: name,
        resellerPhone: phone,
        resellerCode: resellerCode || undefined,
        totalAmount,
        notes,
        items: cartItems,
        status: 'pending'
      });

      alert('Pedido enviado com sucesso para o painel de vendas!');
      
      // Clear cart and close drawer
      setCart({});
      setIsCartOpen(false);
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      alert('Houve um erro ao enviar seu pedido. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen pb-20 transition-colors duration-300" style={{background: isDarkMode ? 'linear-gradient(135deg, #12030d 0%, #1e0918 30%, #17041c 60%, #1c051a 100%)' : 'linear-gradient(135deg, #fff0f6 0%, #fce7f3 30%, #fdf2f8 60%, #fff0fb 100%)'}}>
      {/* Header */}
      <header className="sticky top-0 z-30 shadow-sm border-b transition-colors duration-300" style={{background: isDarkMode ? 'rgba(30,9,24,0.85)' : 'rgba(255,240,246,0.85)', backdropFilter: 'blur(14px)', borderColor: isDarkMode ? '#831843' : '#fbcfe8'}}>
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Feminine floral logo */}
            <div className="relative w-11 h-11 flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl" style={{background: 'linear-gradient(135deg, #f9a8d4, #e879f9)'}}></div>
              <span className="relative text-2xl select-none">🌸</span>
            </div>
            <div>
              <h1 className="font-black text-lg leading-none" style={{color: isDarkMode ? '#fbcfe8' : '#9d174d', fontFamily: 'Georgia, serif', letterSpacing: '-0.5px'}}>Super Ketlen Myluce</h1>
              <p className="text-xs font-semibold" style={{color: isDarkMode ? '#f472b6' : '#db2777', letterSpacing: '0.05em'}}>CATÁLOGO EXCLUSIVO</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-3 rounded-xl transition-colors border"
              style={{background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#fce7f3,#fdf4ff)', borderColor: isDarkMode ? '#831843' : '#fbcfe8'}}
            >
              {isDarkMode ? <Sun size={20} style={{color:'#fbcfe8'}} /> : <Moon size={20} style={{color:'#db2777'}} />}
            </button>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 rounded-xl transition-colors border"
              style={{background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#fce7f3,#fdf4ff)', borderColor: isDarkMode ? '#831843' : '#fbcfe8'}}
            >
              <ShoppingBag size={22} style={{color: isDarkMode ? '#fbcfe8' : '#db2777'}} />
              {totalCartItems > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold border-2 border-white shadow-sm" style={{background:'#ec4899', color:'#fff'}}>
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Search */}
      <div className="py-14 px-4 mb-8 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #be185d 0%, #9d174d 40%, #7e22ce 100%)'}}>
        {/* Decorative circles */}
        <div className="absolute -top-10 -left-10 w-52 h-52 rounded-full opacity-20" style={{background:'radial-gradient(circle, #f9a8d4, transparent)'}}></div>
        <div className="absolute -bottom-16 -right-10 w-72 h-72 rounded-full opacity-20" style={{background:'radial-gradient(circle, #d8b4fe, transparent)'}}></div>

        <div className="max-w-3xl mx-auto text-center relative">
          <p className="text-pink-200 text-sm font-semibold tracking-widest mb-2 uppercase">✨ Bem-vinda ✨</p>
          {/* Dynamic catalog title */}
          <h2 className="text-3xl md:text-5xl font-black text-white mb-2" style={{fontFamily:'Georgia, serif', textShadow:'0 2px 20px rgba(0,0,0,0.2)'}}>
            {catalogTitle}
          </h2>
          {catalogSubtitle && (
            <p className="text-pink-200 text-base mb-6">{catalogSubtitle}</p>
          )}
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="text-pink-400" size={22} />
            </div>
            <input 
              type="text" 
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 shadow-xl text-lg outline-none transition-shadow"
              style={{background:'rgba(255,255,255,0.97)', color:'#1e1b4b'}}
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
              <h3 className="text-xl font-black flex items-center gap-2" style={{color: isDarkMode ? '#fce7f3' : '#1e293b'}}>
                <span className="inline-block w-2 h-5 bg-pink-500 rounded-full"></span>
                Destaques
              </h3>
            </div>

            {/* Overflow mask */}
            <div className="overflow-hidden w-full carousel-fade">
              {/* Duplicated track for seamless loop */}
              <div className="flex gap-4 marquee-track w-max">
                {[...featuredProducts, ...featuredProducts].map((product, idx) => (
                  <div key={`${product.id}-${idx}`} className="w-[200px] md:w-[230px] flex-shrink-0">
                    <ProductCard
                      product={product}
                      quantity={product.id ? (cart[product.id] || 0) : 0}
                      onUpdateQuantity={handleUpdateQuantity}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold" style={{color: isDarkMode ? '#fce7f3' : '#1e293b'}}>
            {searchQuery ? 'Resultados da Busca' : 'Todos os Produtos'}
          </h3>
          <span className="text-sm font-medium" style={{color: isDarkMode ? '#f472b6' : '#64748b'}}>
            {searchQuery ? filteredProducts.length : regularProducts.length} encontrados
          </span>
        </div>

        {(searchQuery ? filteredProducts : regularProducts).length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {(searchQuery ? filteredProducts : regularProducts).map(product => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={product.id ? (cart[product.id] || 0) : 0}
                onUpdateQuantity={handleUpdateQuantity}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20" style={{color: isDarkMode ? '#f472b6' : '#64748b'}}>
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">Nenhum produto encontrado para "{searchQuery}"</p>
          </div>
        )}
      </main>

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

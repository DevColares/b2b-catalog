import { useState, useMemo, useEffect } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { FeaturedCard } from '../components/FeaturedCard';
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
  // Tema fixo: apenas claro (branco com tons de rosa)
  const isDarkMode = false;

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

  // Carrossel = apenas ofertas/destaques. A grade abaixo lista TODOS os produtos ativos.
  const featuredProducts = filteredProducts.filter(p => p.isFeatured);

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
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Feminine floral logo */}
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center flex-shrink-0">
              <div className="absolute inset-0 rounded-2xl" style={{background: 'linear-gradient(135deg, #f8c1de, #c9a5f2)'}}></div>
              <span className="relative text-xl sm:text-2xl select-none">🌸</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-black text-base sm:text-lg leading-none truncate" style={{color: isDarkMode ? '#fbcfe8' : '#c2458f', fontFamily: 'Georgia, serif', letterSpacing: '-0.5px'}}>Super Ketlen Myluce</h1>
              <p className="hidden sm:block text-xs font-semibold mt-1" style={{color: isDarkMode ? '#f472b6' : '#e2569a', letterSpacing: '0.05em'}}>CATÁLOGO EXCLUSIVO</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 rounded-xl transition-colors border"
              style={{background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#fce7f3,#fdf4ff)', borderColor: isDarkMode ? '#831843' : '#fbcfe8'}}
            >
              <ShoppingBag size={22} style={{color: isDarkMode ? '#fbcfe8' : '#e2569a'}} />
              {totalCartItems > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold border-2 border-white shadow-sm" style={{background:'#ef6aa5', color:'#fff'}}>
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Search */}
      <div className="py-10 sm:py-14 px-4 mb-8 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #e2709d 0%, #d35a8e 40%, #8b74d8 100%)'}}>
        {/* Decorative circles */}
        <div className="absolute -top-10 -left-10 w-52 h-52 rounded-full opacity-20" style={{background:'radial-gradient(circle, #f9a8d4, transparent)'}}></div>
        <div className="absolute -bottom-16 -right-10 w-72 h-72 rounded-full opacity-20" style={{background:'radial-gradient(circle, #d8b4fe, transparent)'}}></div>

        <div className="max-w-3xl mx-auto text-center relative">
          <p className="text-pink-200 text-xs sm:text-sm font-semibold tracking-widest mb-2 uppercase">✨ Bem-vinda ✨</p>
          {/* Dynamic catalog title */}
          <h2 className="hero-title font-black text-white mb-2" style={{fontFamily:'Georgia, serif', textShadow:'0 2px 20px rgba(0,0,0,0.2)'}}>
            {catalogTitle}
          </h2>
          {catalogSubtitle && (
            <p className="text-pink-200 text-sm sm:text-base mb-6">{catalogSubtitle}</p>
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
          <h3 className="text-xl font-bold" style={{color: isDarkMode ? '#fce7f3' : '#1e293b'}}>
            {searchQuery ? 'Resultados da Busca' : 'Todos os Produtos'}
          </h3>
          <span className="text-sm font-medium" style={{color: isDarkMode ? '#f472b6' : '#64748b'}}>
            {filteredProducts.length} encontrados
          </span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map(product => (
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

import { useState } from 'react';
import { Plus, Minus, ShoppingCart, Info, X } from 'lucide-react';

interface ProductCardProps {
  product: {
    id?: string;
    title: string;
    sku: string;
    imageUrl: string;
    regularPrice: number;
    promoPrice: number;
    resalePrice?: number;
    progressiveDiscounts?: { minQuantity: number; discountPercentage: number }[];
  };
  quantity: number;
  onUpdateQuantity: (id: string, qty: number) => void;
}

export function ProductCard({ product, quantity, onUpdateQuantity }: ProductCardProps) {
  const [showModal, setShowModal] = useState(false);
  let currentPrice = (product.promoPrice > 0 && product.promoPrice < product.regularPrice) 
    ? product.promoPrice 
    : product.regularPrice;
    
  let hasProgressive = false;
  let activeDiscount = 0;

  if (product.progressiveDiscounts && product.progressiveDiscounts.length > 0) {
    hasProgressive = true;
    const applicableTiers = product.progressiveDiscounts.filter(tier => quantity >= tier.minQuantity);
    if (applicableTiers.length > 0) {
      applicableTiers.sort((a, b) => b.minQuantity - a.minQuantity);
      const bestTier = applicableTiers[0];
      activeDiscount = bestTier.discountPercentage;
      currentPrice = product.regularPrice - (product.regularPrice * activeDiscount / 100);
    }
  }

  const hasPromo = (product.promoPrice < product.regularPrice && product.promoPrice > 0) || activeDiscount > 0;

  // Lucro potencial do revendedor = valor de revenda - preço de compra atual
  const hasResale = !!product.resalePrice && product.resalePrice > 0;
  const resaleProfit = hasResale ? product.resalePrice! - currentPrice : 0;
  const profitPercentage = hasResale && currentPrice > 0 ? (resaleProfit / currentPrice) * 100 : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.id) {
      onUpdateQuantity(product.id, 1);
      setShowModal(true); // Abre o popup ao clicar em Adicionar
    }
  };

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className="group relative flex flex-col bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-pink-100 dark:border-pink-900/30 hover:border-pink-300 dark:hover:border-pink-500/50 h-full cursor-pointer"
      >
        {activeDiscount > 0 ? (
          <div className="absolute top-3 right-3 z-10 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            -{activeDiscount}% APLICADO
          </div>
        ) : hasPromo ? (
          <div className="absolute top-3 right-3 z-10 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            EXCLUSIVO
          </div>
        ) : null}
        
        <div className="relative aspect-square overflow-hidden bg-pink-50 dark:bg-pink-950/20">
          <img 
            src={product.imageUrl || 'https://placehold.co/400x400/e2e8f0/64748b?text=Sem+Foto'} 
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="bg-white/90 dark:bg-pink-950/90 text-pink-600 dark:text-pink-200 px-4 py-2 rounded-xl font-bold text-sm shadow-md flex items-center gap-1.5 active:scale-95 transition-all">
              <Info size={16} /> Ver Detalhes
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="text-xs text-pink-500 dark:text-pink-400 font-medium tracking-wider mb-1">SKU: {product.sku}</div>
          <h3 className="font-bold text-slate-800 dark:text-pink-100 text-base leading-tight mb-2 line-clamp-2">
            {product.title}
          </h3>
          
          <div className="mt-auto mb-3">
            {hasPromo ? (
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-xl font-black text-pink-600 dark:text-pink-400">R$ {currentPrice.toFixed(2)}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 line-through">R$ {product.regularPrice.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-xl font-black text-slate-800 dark:text-pink-200">R$ {currentPrice.toFixed(2)}</span>
            )}
            
            {hasProgressive && quantity === 0 && (
              <div className="text-[10px] font-bold text-green-600 dark:text-green-400 mt-1 bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded inline-block">
                Desconto Progressivo
              </div>
            )}
          </div>

          {quantity === 0 ? (
            <button 
              onClick={handleAddToCart}
              className="w-full py-2.5 bg-pink-700 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-500 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <ShoppingCart size={16} />
              Adicionar
            </button>
          ) : (
            <div className="flex items-center justify-between bg-pink-50 dark:bg-pink-950/30 rounded-xl p-1" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => product.id && onUpdateQuantity(product.id, quantity - 1)}
                className="p-1.5 bg-white dark:bg-pink-900 rounded-lg shadow-sm hover:text-red-500 transition-colors cursor-pointer"
              >
                <Minus size={16} />
              </button>
              <span className="font-bold text-base w-10 text-center text-pink-900 dark:text-pink-200">{quantity}</span>
              <button 
                onClick={() => product.id && onUpdateQuantity(product.id, quantity + 1)}
                className="p-1.5 bg-white dark:bg-pink-900 rounded-lg shadow-sm hover:text-pink-600 dark:hover:text-pink-400 transition-colors cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Popup de Informações e Quantidade (flutuante com fundo glass) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-md" 
            onClick={() => setShowModal(false)}
          />
          <div 
            className="relative w-full sm:max-w-md bg-white/70 dark:bg-[#1a0815]/55 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl z-10 border border-white/50 dark:border-white/10 flex flex-col max-h-[88vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-pink-100 dark:border-pink-950/40">
              <span className="text-xs font-semibold text-pink-500 dark:text-pink-400">SKU: {product.sku}</span>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full hover:bg-pink-100 dark:hover:bg-pink-950/40 text-pink-900 dark:text-pink-200 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content (Scrollable on small devices) */}
            <div className="overflow-y-auto p-5 space-y-4 flex-1">
              {/* Product Image (1:1 proporcional, sem cortes) */}
              <div className="aspect-square w-full max-h-[300px] rounded-xl overflow-hidden bg-pink-50 dark:bg-pink-950/10 flex items-center justify-center">
                <img 
                  src={product.imageUrl || 'https://placehold.co/400x400/e2e8f0/64748b?text=Sem+Foto'} 
                  alt={product.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Title and Prices */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-pink-100 text-lg leading-snug">
                  {product.title}
                </h3>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-pink-600 dark:text-pink-400">
                    R$ {currentPrice.toFixed(2)}
                  </span>
                  {hasPromo && (
                    <span className="text-sm text-slate-400 dark:text-slate-500 line-through">
                      R$ {product.regularPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Revenda / Lucro Potencial do Revendedor */}
              {hasResale && (
                <div className="p-3.5 rounded-xl bg-white/70 dark:bg-pink-950/10 border border-pink-200/60 dark:border-pink-800/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-pink-700 dark:text-pink-300 uppercase tracking-wider">Valor de Revenda</span>
                    <span className="text-lg font-black text-pink-600 dark:text-pink-400">R$ {product.resalePrice!.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-pink-100 dark:border-pink-950/40">
                    <span className="text-xs font-bold text-pink-700 dark:text-pink-300 uppercase tracking-wider">Seu Lucro Potencial</span>
                    <span className="text-right">
                      <span className="block text-base font-black text-green-600 dark:text-green-400">+R$ {resaleProfit.toFixed(2)}</span>
                      <span className="block text-[11px] font-bold text-green-600/80 dark:text-green-400/80">({profitPercentage.toFixed(0)}% de margem)</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Progressive Discount Section */}
              {product.progressiveDiscounts && product.progressiveDiscounts.length > 0 && (
                <div className="p-3.5 rounded-xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100/30 space-y-2">
                  <h4 className="text-xs font-bold text-pink-700 dark:text-pink-300 uppercase tracking-wider">Tabela de Descontos Progressivos:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {product.progressiveDiscounts.map((tier, idx) => {
                      const isCurrent = quantity >= tier.minQuantity;
                      const tierUnitPrice = product.regularPrice - (product.regularPrice * tier.discountPercentage / 100);
                      return (
                        <div 
                          key={idx} 
                          className={`p-2 rounded-lg border transition-all ${
                            isCurrent 
                              ? 'bg-green-100/70 border-green-300 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300 font-bold' 
                              : 'bg-white dark:bg-pink-950/10 border-pink-100 dark:border-pink-900/20 text-slate-600 dark:text-pink-300/80'
                          }`}
                        >
                          <div>A partir de <strong className={isCurrent ? 'text-green-700 dark:text-green-300' : 'text-slate-800 dark:text-pink-100'}>{tier.minQuantity} un.</strong></div>
                          <div className="mt-1">
                            <strong className={isCurrent ? 'text-green-600 dark:text-green-400' : 'text-pink-600 dark:text-pink-400'}>{tier.discountPercentage}% OFF</strong>
                            <span className="text-slate-500 dark:text-pink-300/70"> · </span>
                            <span className="font-bold text-slate-800 dark:text-pink-100">R$ {tierUnitPrice.toFixed(2)}/un</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Fixed Bar (Sticky to bottom on mobile) */}
            <div className="p-4 border-t border-pink-100 dark:border-pink-950/40 bg-pink-50/30 dark:bg-pink-950/10 flex flex-col gap-3">
              {quantity === 0 ? (
                <button 
                  onClick={handleAddToCart}
                  className="w-full py-3.5 bg-pink-700 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart size={18} />
                  Adicionar ao Carrinho
                </button>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center bg-white dark:bg-pink-900 border border-pink-200 dark:border-pink-850 rounded-xl p-1 flex-1 max-w-[160px]">
                    <button 
                      onClick={() => product.id && onUpdateQuantity(product.id, quantity - 1)}
                      className="p-2 text-pink-900 dark:text-pink-200 hover:text-red-500 transition-colors flex-1 flex justify-center cursor-pointer"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="font-bold text-lg text-pink-900 dark:text-pink-200 w-10 text-center">{quantity}</span>
                    <button 
                      onClick={() => product.id && onUpdateQuantity(product.id, quantity + 1)}
                      className="p-2 text-pink-900 dark:text-pink-200 hover:text-pink-600 transition-colors flex-1 flex justify-center cursor-pointer"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3.5 bg-pink-700 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-500 text-white rounded-xl font-bold text-center cursor-pointer"
                  >
                    Confirmar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

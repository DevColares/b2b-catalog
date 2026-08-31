import { Plus, Minus, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: {
    id?: string;
    title: string;
    sku: string;
    imageUrl: string;
    regularPrice: number;
    promoPrice: number;
    progressiveDiscounts?: { minQuantity: number; discountPercentage: number }[];
  };
  quantity: number;
  onUpdateQuantity: (id: string, qty: number) => void;
}

export function ProductCard({ product, quantity, onUpdateQuantity }: ProductCardProps) {
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

  return (
    <div className="group relative flex flex-col bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-pink-100 dark:border-pink-900/30 hover:border-pink-300 dark:hover:border-pink-500/50 h-full">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs text-pink-500 dark:text-pink-400 font-medium tracking-wider mb-1">SKU: {product.sku}</div>
        <h3 className="font-bold text-slate-800 dark:text-pink-100 text-lg leading-tight mb-2 line-clamp-2">
          {product.title}
        </h3>
        
        <div className="mt-auto mb-4">
          {hasPromo ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-pink-600 dark:text-pink-400">R$ {currentPrice.toFixed(2)}</span>
              <span className="text-sm text-slate-400 dark:text-slate-500 line-through">R$ {product.regularPrice.toFixed(2)}</span>
            </div>
          ) : (
            <span className="text-2xl font-black text-slate-800 dark:text-pink-200">R$ {currentPrice.toFixed(2)}</span>
          )}
          
          {hasProgressive && quantity === 0 && (
            <div className="text-xs font-bold text-green-600 dark:text-green-400 mt-1 bg-green-50 dark:bg-green-950/20 p-1.5 rounded-lg inline-block">
              Desconto progressivo por quantidade!
            </div>
          )}
        </div>

        {quantity === 0 ? (
          <button 
            onClick={() => product.id && onUpdateQuantity(product.id, 1)}
            className="w-full py-3 bg-pink-700 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-500 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingCart size={18} />
            Adicionar
          </button>
        ) : (
          <div className="flex items-center justify-between bg-pink-50 dark:bg-pink-950/30 rounded-xl p-1">
            <button 
              onClick={() => product.id && onUpdateQuantity(product.id, quantity - 1)}
              className="p-2 bg-white dark:bg-pink-900 rounded-lg shadow-sm hover:text-red-500 transition-colors cursor-pointer"
            >
              <Minus size={18} />
            </button>
            <span className="font-bold text-lg w-10 text-center text-pink-900 dark:text-pink-200">{quantity}</span>
            <button 
              onClick={() => product.id && onUpdateQuantity(product.id, quantity + 1)}
              className="p-2 bg-white dark:bg-pink-900 rounded-lg shadow-sm hover:text-pink-600 dark:hover:text-pink-400 transition-colors cursor-pointer"
            >
              <Plus size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

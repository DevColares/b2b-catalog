interface FeaturedCardProps {
  product: {
    id?: string;
    title: string;
    imageUrl: string;
    regularPrice: number;
    promoPrice: number;
  };
}

export function FeaturedCard({ product }: FeaturedCardProps) {
  const currentPrice = (product.promoPrice > 0 && product.promoPrice < product.regularPrice)
    ? product.promoPrice
    : product.regularPrice;
  const hasPromo = product.promoPrice > 0 && product.promoPrice < product.regularPrice;

  return (
    <div className="relative flex flex-col bg-surface rounded-2xl overflow-hidden shadow-sm transition-all duration-300 border border-pink-100 dark:border-pink-900/30">
      {hasPromo && (
        <div className="absolute top-3 right-3 z-10 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          EXCLUSIVO
        </div>
      )}

      <div className="relative aspect-square overflow-hidden bg-pink-50 dark:bg-pink-950/20">
        <img
          src={product.imageUrl || 'https://placehold.co/400x400/e2e8f0/64748b?text=Sem+Foto'}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-3 flex items-center justify-between gap-2">
        <span className="font-bold text-slate-800 dark:text-pink-100 text-base leading-tight line-clamp-1 flex-1">
          {product.title}
        </span>
        <span className="font-black text-pink-600 dark:text-pink-400 whitespace-nowrap">
          R$ {currentPrice.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

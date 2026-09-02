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
    <div className="glass-card relative flex flex-col rounded-2xl overflow-hidden h-full cursor-pointer group">
      {hasPromo && (
        <div className="absolute top-3 right-3 z-10 glass-badge glass-badge--discount shadow-sm">
          EXCLUSIVO
        </div>
      )}

      <div className="relative aspect-square overflow-hidden bg-accent-soft/40">
        <img
          src={product.imageUrl || 'https://placehold.co/400x400/e2e8f0/64748b?text=Sem+Foto'}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-3 flex items-center justify-between gap-2" style={{paddingTop: 12, paddingBottom: 12}}>
        <span className="font-bold text-ink dark:text-pink-100 text-base leading-tight line-clamp-1 flex-1">
          {product.title}
        </span>
        <span className="font-black text-primary dark:text-pink-400 whitespace-nowrap">
          R$ {currentPrice.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Plus, Minus, ShoppingCart, Info, X, Check } from 'lucide-react';
import { makeVariantKey } from '../utils/whatsapp';

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
    colors?: string[];
    sizes?: string[];
  };
  quantity: number;
  onUpdateQuantity: (variantKey: string, qty: number) => void;
  onGetQuantity?: (productId: string, color: string, size: string) => number;
}

const sizeOrder = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG'];

export function ProductCard({ product, quantity, onUpdateQuantity, onGetQuantity }: ProductCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

  const hasColors = !!(product.colors && product.colors.length);
  const hasSizes = !!(product.sizes && product.sizes.length);
  const hasVariants = hasColors || hasSizes;

  const effectiveColor = hasColors ? (selectedColor || product.colors![0]) : '';
  const effectiveSize = hasSizes ? (selectedSize || product.sizes![0]) : '';

  let currentPrice = (product.promoPrice > 0 && product.promoPrice < product.regularPrice) 
    ? product.promoPrice 
    : product.regularPrice;
    
  let activeDiscount = 0;

  if (product.progressiveDiscounts && product.progressiveDiscounts.length > 0) {
    const applicableTiers = product.progressiveDiscounts.filter(tier => quantity >= tier.minQuantity);
    if (applicableTiers.length > 0) {
      applicableTiers.sort((a, b) => b.minQuantity - a.minQuantity);
      const bestTier = applicableTiers[0];
      activeDiscount = bestTier.discountPercentage;
      currentPrice = product.regularPrice - (product.regularPrice * activeDiscount / 100);
    }
  }

  const hasPromo = (product.promoPrice < product.regularPrice && product.promoPrice > 0) || activeDiscount > 0;

  const hasResale = !!product.resalePrice && product.resalePrice > 0;
  const resaleProfit = hasResale ? product.resalePrice! - currentPrice : 0;
  const profitPercentage = hasResale && currentPrice > 0 ? (resaleProfit / currentPrice) * 100 : 0;

  const selectedQty = hasVariants && product.id && onGetQuantity
    ? onGetQuantity(product.id, effectiveColor, effectiveSize)
    : quantity;

  const doUpdate = (color: string, size: string, qty: number) => {
    if (product.id) {
      const key = hasVariants ? makeVariantKey(product.id, color, size) : product.id;
      onUpdateQuantity(key, qty);
    }
  };

  const handleAddToCart = () => setShowModal(true);

  return (
    <>
      <div onClick={() => setShowModal(true)} className="group glass-card relative flex flex-col rounded-2xl overflow-hidden h-full cursor-pointer">
        {activeDiscount > 0 ? (
          <div className="absolute top-3 right-3 z-10 glass-badge glass-badge--category shadow-sm">-{activeDiscount}% APLICADO</div>
        ) : hasPromo ? (
          <div className="absolute top-3 right-3 z-10 glass-badge glass-badge--discount shadow-sm">EXCLUSIVO</div>
        ) : null}

        {hasVariants && product.colors!.length > 0 && (
          <div className="absolute top-3 left-3 z-10 glass-badge glass-badge--category shadow-sm">
            {product.colors!.length} cores{hasSizes ? ` · ${product.sizes!.length} tam` : ''}
          </div>
        )}

        <div className="relative aspect-square overflow-hidden bg-accent-soft/40 p-2">
          <img
            src={product.imageUrl || 'https://placehold.co/400x400/e2e8f0/64748b?text=Sem+Foto'}
            alt={product.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="bg-white/90 dark:bg-pink-950/90 text-primary dark:text-pink-200 px-4 py-2 rounded-xl font-bold text-sm shadow-md flex items-center gap-1.5">
              <Info size={16} /> Ver Detalhes
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="text-xs text-accent dark:text-pink-400 font-medium tracking-wider mb-1">SKU: {product.sku}</div>
          <h3 className="font-bold text-ink dark:text-pink-100 text-base leading-tight mb-2 line-clamp-2">{product.title}</h3>

          <div className="mt-auto mb-3">
            {hasPromo ? (
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-xl font-black text-primary dark:text-pink-400">R$ {currentPrice.toFixed(2)}</span>
                <span className="text-xs text-muted dark:text-slate-500 line-through">R$ {product.regularPrice.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-xl font-black text-ink dark:text-pink-200">R$ {currentPrice.toFixed(2)}</span>
            )}
          </div>

          {quantity === 0 ? (
            <button onClick={handleAddToCart} className="glass-action w-full text-sm flex items-center justify-center gap-2">
              <ShoppingCart size={16} /> {hasVariants ? 'Escolher opções' : 'Adicionar'}
            </button>
          ) : (
            <div className="glass-action w-full text-sm font-bold flex items-center justify-center gap-2">
              <ShoppingCart size={16} /> {quantity} no carrinho
            </div>
          )}
        </div>
      </div>

      {/* Popup de Informações e Variações */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full sm:max-w-md bg-white/70 dark:bg-[#1a0815]/55 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl z-10 border border-white/50 dark:border-white/10 flex flex-col max-h-[88vh]">
            <div className="flex items-center justify-between p-4 border-b border-accent-soft dark:border-pink-950/40">
              <span className="text-xs font-semibold text-accent dark:text-pink-400">SKU: {product.sku}</span>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-full hover:bg-accent-soft text-primary transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4 flex-1">
              <div className="aspect-square w-full max-h-[300px] rounded-xl overflow-hidden bg-accent-soft/40">
                <img src={product.imageUrl || 'https://placehold.co/400x400/e2e8f0/64748b?text=Sem+Foto'} alt={product.title} className="w-full h-full object-contain" />
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-ink dark:text-pink-100 text-lg leading-snug">{product.title}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-primary dark:text-pink-400">R$ {currentPrice.toFixed(2)}</span>
                  {hasPromo && <span className="text-sm text-muted line-through">R$ {product.regularPrice.toFixed(2)}</span>}
                </div>
              </div>
{hasVariants && (
                <div className="space-y-4">
                  {hasColors && (
                    <div>
                      <p className="text-xs font-bold text-primary dark:text-pink-300 uppercase tracking-wider mb-2">Cor</p>
                      <div className="flex flex-wrap gap-2">
                        {product.colors!.map((c) => {
                          const active = effectiveColor === c;
                          return (
                            <button key={c} onClick={() => setSelectedColor(c)}
                              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1"
                              style={{
                                borderColor: active ? 'var(--color-primary, #8C4A5A)' : 'var(--accent-soft, #fce7f3)',
                                background: active ? 'var(--color-primary, #8C4A5A)' : 'transparent',
                                color: active ? '#ffffff' : 'var(--color-primary, #8C4A5A)'
                              }}>
                              {c} {active && <Check size={12} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
{hasSizes && (
                    <div>
                      <p className="text-xs font-bold text-primary dark:text-pink-300 uppercase tracking-wider mb-2">Tamanho</p>
                      <div className="flex flex-wrap gap-2">
                        {[...product.sizes!].sort((a, b) => {
                          const ia = sizeOrder.indexOf(a); const ib = sizeOrder.indexOf(b);
                          if (ia !== -1 && ib !== -1) return ia - ib;
                          return a.localeCompare(b);
                        }).map((s) => {
                          const active = effectiveSize === s;
                          return (
                            <button key={s} onClick={() => setSelectedSize(s)}
                              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1"
                              style={{
                                borderColor: active ? 'var(--color-primary, #8C4A5A)' : 'var(--accent-soft, #fce7f3)',
                                background: active ? 'var(--color-primary, #8C4A5A)' : 'transparent',
                                color: active ? '#ffffff' : 'var(--color-primary, #8C4A5A)'
                              }}>
                              {s} {active && <Check size={12} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {onGetQuantity && (
                    <p className="text-xs text-muted">Já no carrinho desta opção: <strong>{selectedQty}</strong></p>
                  )}
                </div>
              )}
              {hasResale && (
                <div className="p-3.5 rounded-xl bg-white/60 border border-accent-soft space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Valor de Revenda</span>
                    <span className="text-lg font-black text-primary">R$ {product.resalePrice!.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-accent-soft">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Seu Lucro Potencial</span>
                    <span className="text-right">
                      <span className="block text-base font-black text-green-600">+R$ {resaleProfit.toFixed(2)}</span>
                      <span className="block text-[11px] font-bold text-green-600/80">({profitPercentage.toFixed(0)}% de margem)</span>
                    </span>
                  </div>
                </div>
              )}
{product.progressiveDiscounts && product.progressiveDiscounts.length > 0 && (
                <div className="p-3.5 rounded-xl bg-accent-soft/40 border border-white/60 space-y-2">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Tabela de Descontos Progressivos:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {product.progressiveDiscounts.map((tier, idx) => {
                      const isCurrent = selectedQty >= tier.minQuantity;
                      const tierUnitPrice = product.regularPrice - (product.regularPrice * tier.discountPercentage / 100);
                      return (
                        <div key={idx} className={`p-2 rounded-lg border ${isCurrent ? 'bg-green-100/70 border-green-300 text-green-800 font-bold' : 'bg-white/70 border-accent-soft text-ink-secondary'}`}>
                          <div>Desde <strong>{tier.minQuantity} un.</strong></div>
                          <div className="mt-1">
                            <strong className={isCurrent ? 'text-green-600' : 'text-primary'}>{tier.discountPercentage}% OFF</strong>
                            <span className="text-muted"> · </span>
                            <span className="font-bold">R$ {tierUnitPrice.toFixed(2)}/un</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-accent-soft dark:border-pink-950/40 bg-white/40 flex flex-col gap-3">
              {selectedQty === 0 ? (
                <button onClick={() => doUpdate(effectiveColor, effectiveSize, 1)} className="glass-action w-full py-3.5 text-base font-bold flex items-center justify-center gap-2">
                  <ShoppingCart size={18} />
                  {hasVariants ? `Adicionar (${[effectiveColor, effectiveSize].filter(Boolean).join(' / ') || 'padrão'})` : 'Adicionar ao Carrinho'}
                </button>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center bg-white/70 border border-accent-soft rounded-xl p-1 flex-1 max-w-[180px]">
                    <button onClick={() => doUpdate(effectiveColor, effectiveSize, selectedQty - 1)} className="p-2 text-primary hover:text-red-500 transition-colors flex-1 flex justify-center cursor-pointer">
                      <Minus size={18} />
                    </button>
                    <span className="font-bold text-lg text-primary w-10 text-center">{selectedQty}</span>
                    <button onClick={() => doUpdate(effectiveColor, effectiveSize, selectedQty + 1)} className="p-2 text-primary hover:text-accent transition-colors flex-1 flex justify-center cursor-pointer">
                      <Plus size={18} />
                    </button>
                  </div>
                  <button onClick={() => setShowModal(false)} className="glass-action flex-1 py-3.5 text-base font-bold text-center">Confirmar</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
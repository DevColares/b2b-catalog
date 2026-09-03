import { useState } from 'react';
import { X, ShoppingBag, Send } from 'lucide-react';
import type { OrderItem } from '../utils/whatsapp';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onSubmitOrder: (name: string, phone: string, resellerCode: string) => void;
}

export function CartDrawer({ isOpen, onClose, items, onUpdateQuantity, onSubmitOrder }: CartDrawerProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [resellerCode, setResellerCode] = useState('');
  const isDark = document.body.classList.contains('dark');

  const total = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && phone.trim() && items.length > 0) {
      onSubmitOrder(name, phone, resellerCode);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 backdrop-blur-sm z-40 transition-opacity"
        style={{background: isDark ? 'rgba(30,5,20,0.5)' : 'rgba(17,24,39,0.25)'}}
        onClick={onClose}
      />
      
      <div 
        className="fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col transition-colors duration-300 glass-drawer"
        style={isDark ? {background: '#1a0815', borderLeft: '1px solid #831843', boxShadow: 'none'} : undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b transition-colors duration-300" style={{borderColor: isDark ? '#831843' : 'rgba(255,255,255,0.6)'}}>
          <div className="flex items-center gap-3">
            <ShoppingBag size={24} style={{color: isDark ? '#f472b6' : 'var(--color-primary, #8C4A5A)'}} />
            <h2 className="text-xl font-bold" style={{color: isDark ? 'var(--color-accent-soft, #fce7f3)' : 'var(--color-primary, #8C4A5A)', fontFamily:"'Plus Jakarta Sans', sans-serif"}}>Meu Pedido 🛍️</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full transition-colors hover:bg-white/60 dark:hover:bg-pink-900/30"
          >
            <X size={24} style={{color: isDark ? '#f472b6' : 'var(--color-primary, #8C4A5A)'}} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 transition-colors duration-300">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center" style={{color: isDark ? '#9d5078' : '#6b7280'}}>
              <span className="text-6xl mb-4">🛒</span>
              <p className="font-medium">Seu carrinho está vazio.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div 
                  key={item.variantKey || item.productId} 
                  className="p-4 flex items-center justify-between border transition-colors duration-300"
                  style={{
                    background: isDark ? '#220b1c' : 'rgba(255,255,255,0.45)',
                    borderColor: isDark ? '#5c1032' : 'rgba(255,255,255,0.6)',
                    borderRadius: 16,
                    boxShadow: isDark ? 'none' : '0 8px 32px 0 rgba(17,24,39,0.08)'
                  }}
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm" style={{color: isDark ? 'var(--color-accent-soft, #fce7f3)' : '#1f2937'}}>{item.title}</h4>
                    {(item.color || item.size) && (
                      <p className="text-xs font-medium mt-0.5" style={{color: isDark ? '#f472b6' : 'var(--color-accent, #C48B96)'}}>
                        {[item.color, item.size].filter(Boolean).join(' / ')}
                      </p>
                    )}
                    <div className="font-bold mt-1" style={{color: isDark ? '#f472b6' : 'var(--color-primary, #8C4A5A)'}}>R$ {item.unitPrice.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-3 ml-4 p-1 rounded-xl" style={{background: isDark ? '#1a0815' : 'rgba(226,232,240,0.6)'}}>
                    <button 
                      onClick={() => onUpdateQuantity(item.variantKey || item.productId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white/70 dark:bg-pink-950 rounded-lg shadow-sm font-bold text-lg transition-colors hover:text-primary dark:text-pink-200"
                    >-</button>
                    <span className="font-bold w-5 text-center" style={{color: isDark ? '#f472b6' : 'var(--color-primary, #8C4A5A)'}}>{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.variantKey || item.productId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white/70 dark:bg-pink-950 rounded-lg shadow-sm font-bold text-lg transition-colors hover:text-primary dark:text-pink-200"
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Form */}
        <div className="p-6 border-t transition-colors duration-300" style={{background: isDark ? '#1a0815' : 'rgba(255,255,255,0.45)', borderColor: isDark ? '#831843' : 'rgba(255,255,255,0.6)'}}>
          <div className="flex items-center justify-between mb-5">
            <span className="font-semibold" style={{color: isDark ? 'var(--color-accent-soft, #fbcfe8)' : '#6b7280'}}>Total do Pedido</span>
            <span className="text-2xl font-black" style={{color: isDark ? '#f472b6' : '#1f2937'}}>R$ {total.toFixed(2)}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input 
                type="text" 
                placeholder="Seu nome *"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="glass-input w-full p-3 outline-none"
                style={isDark ? {background:'#260d20', borderColor:'#831843', color:'var(--color-accent-soft, #fce7f3)'} : undefined}
              />
            </div>

            <div>
              <input 
                type="tel"
                required
                placeholder="Seu número de WhatsApp *"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="glass-input w-full p-3 outline-none"
                inputMode="tel"
                style={isDark ? {background:'#260d20', borderColor:'#831843', color:'var(--color-accent-soft, #fce7f3)'} : undefined}
              />
            </div>
            
            <div>
              <input 
                type="text" 
                placeholder="CPF ou Código de Revendedor"
                value={resellerCode}
                onChange={e => setResellerCode(e.target.value)}
                className="glass-input w-full p-3 outline-none"
                style={isDark ? {background:'#260d20', borderColor:'#831843', color:'var(--color-accent-soft, #fce7f3)'} : undefined}
              />
            </div>
            
            <button 
              type="submit"
              disabled={items.length === 0}
              className="glass-action w-full py-4 text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={isDark ? {background:'linear-gradient(135deg, #8C4A5A, #A35C6E)', boxShadow:'none'} : undefined}
            >
              <Send size={20} />
              Finalizar Pedido
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

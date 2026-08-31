import { useState } from 'react';
import { X, ShoppingBag, Send } from 'lucide-react';
import type { OrderItem } from '../utils/whatsapp';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onSubmitOrder: (name: string, phone: string, notes: string, resellerCode: string) => void;
}

export function CartDrawer({ isOpen, onClose, items, onUpdateQuantity, onSubmitOrder }: CartDrawerProps) {
  const [name, setName] = useState('');
  const [resellerCode, setResellerCode] = useState('');
  const [notes, setNotes] = useState('');
  const isDark = document.body.classList.contains('dark');

  const total = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && items.length > 0) {
      onSubmitOrder(name, '', notes, resellerCode);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 backdrop-blur-sm z-40 transition-opacity"
        style={{background: isDark ? 'rgba(30,5,20,0.5)' : 'rgba(157,23,77,0.25)'}}
        onClick={onClose}
      />
      
      <div className="fixed top-0 right-0 h-full w-full max-w-md shadow-2xl z-50 flex flex-col transition-colors duration-300" style={{background: isDark ? '#1a0815' : '#fff9fc'}}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b transition-colors duration-300" style={{borderColor: isDark ? '#831843' : '#fbcfe8', background: isDark ? 'linear-gradient(to right, #1f0b1a, #2a0e23)' : 'linear-gradient(to right, #fdf2f8, #faf5ff)'}}>
          <div className="flex items-center gap-3">
            <ShoppingBag size={24} style={{color: isDark ? '#f472b6' : '#db2777'}} />
            <h2 className="text-xl font-bold" style={{color: isDark ? '#fce7f3' : '#9d174d', fontFamily:'Georgia, serif'}}>Meu Pedido 🛍️</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full transition-colors hover:bg-pink-900/30"
          >
            <X size={24} style={{color: isDark ? '#f472b6' : '#db2777'}} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 transition-colors duration-300" style={{background: isDark ? '#150611' : '#fff0f8'}}>
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center" style={{color: isDark ? '#9d5078' : '#f472b6'}}>
              <span className="text-6xl mb-4">🛒</span>
              <p className="font-medium">Seu carrinho está vazio.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.productId} className="p-4 rounded-2xl shadow-sm flex items-center justify-between border transition-colors duration-300" style={{background: isDark ? '#220b1c' : '#white', borderColor: isDark ? '#5c1032' : '#fce7f3'}}>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm" style={{color: isDark ? '#fce7f3' : '#831843'}}>{item.title}</h4>
                    <div className="font-bold mt-1" style={{color: isDark ? '#f472b6' : '#db2777'}}>R$ {item.unitPrice.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-3 ml-4 p-1 rounded-xl" style={{background: isDark ? '#1a0815' : '#fdf2f8'}}>
                    <button 
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white dark:bg-pink-950 rounded-lg shadow-sm font-bold text-lg transition-colors hover:text-pink-600 dark:text-pink-200"
                    >-</button>
                    <span className="font-bold w-5 text-center" style={{color: isDark ? '#f472b6' : '#9d174d'}}>{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white dark:bg-pink-950 rounded-lg shadow-sm font-bold text-lg transition-colors hover:text-pink-600 dark:text-pink-200"
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Form */}
        <div className="p-6 border-t transition-colors duration-300" style={{background: isDark ? '#1a0815' : '#white', borderColor: isDark ? '#831843' : '#fbcfe8'}}>
          <div className="flex items-center justify-between mb-5">
            <span className="font-semibold" style={{color: isDark ? '#fbcfe8' : '#9d174d'}}>Total do Pedido</span>
            <span className="text-2xl font-black" style={{color: isDark ? '#f472b6' : '#be185d'}}>R$ {total.toFixed(2)}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input 
                type="text" 
                placeholder="Seu nome de revendedora ✨ *"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-3 rounded-xl outline-none transition-all border"
                style={{borderColor: isDark ? '#831843' : '#fbcfe8', background: isDark ? '#260d20' : '#fff9fc', color: isDark ? '#fce7f3' : '#1e1b4b'}}
              />
            </div>
            
            <div>
              <input 
                type="text" 
                placeholder="CPF ou Código de Revendedor"
                value={resellerCode}
                onChange={e => setResellerCode(e.target.value)}
                className="w-full p-3 rounded-xl outline-none transition-all border"
                style={{borderColor: isDark ? '#831843' : '#fbcfe8', background: isDark ? '#260d20' : '#fff9fc', color: isDark ? '#fce7f3' : '#1e1b4b'}}
              />
            </div>
            
            <div>
              <textarea 
                placeholder="Observações (opcional)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-xl outline-none transition-all resize-none border"
                style={{borderColor: isDark ? '#831843' : '#fbcfe8', background: isDark ? '#260d20' : '#fff9fc', color: isDark ? '#fce7f3' : '#1e1b4b'}}
              />
            </div>
            
            <button 
              type="submit"
              disabled={items.length === 0}
              className="w-full py-4 font-bold text-lg text-white rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all active:scale-95 cursor-pointer"
              style={{background:'linear-gradient(135deg, #be185d, #7e22ce)', boxShadow: isDark ? 'none' : '0 8px 25px rgba(190,24,93,0.35)'}}
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

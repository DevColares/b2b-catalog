import { useState, useEffect } from 'react';
import { X, Phone, User, Hash, Receipt, ClipboardList } from 'lucide-react';
import { OrderTable } from '../components/OrderTable';
import { subscribeToOrders, updateOrderStatus } from '../lib/db';
import { useAuth } from '../context/AuthContext';
import type { Order } from '../lib/db';

const statusLabels: Record<Order['status'], string> = {
  pending: 'Pendente',
  processing: 'Processando',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export function AdminOrders() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToOrders(uid, (data) => {
      // Data contains Firestore Timestamps, we map them to Date objects for the UI
      const mappedOrders = data.map(o => ({
        ...o,
        createdAt: o.createdAt?.toDate() || new Date()
      }));
      setOrders(mappedOrders as Order[]);
    });
    return () => unsubscribe();
  }, [uid]);

  const handleStatusChange = async (id: string, status: Order['status']) => {
    if (uid) await updateOrderStatus(uid, id, status);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  return (
    <>
      <header className="page-header items-end">
        <div>
          <h1 className="page-title font-bold text-slate-800 dark:text-pink-200">Gestão de Pedidos</h1>
          <p className="mt-1 text-slate-500 dark:text-pink-400/70">Gerencie os pedidos recebidos via catálogo</p>
        </div>
      </header>

      <OrderTable 
        orders={orders as any}
        onStatusChange={handleStatusChange}
        onViewDetails={handleViewDetails}
      />

      {/* Popup de Detalhes do Pedido (glass, como na página inicial) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-md" 
            onClick={handleCloseModal}
          />
          <div className="relative w-full sm:max-w-md bg-white/80 dark:bg-[#1a0815]/60 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl z-10 border border-white/50 dark:border-white/10 flex flex-col max-h-[88vh]">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[var(--color-accent-soft)] dark:border-pink-900/40 flex items-center justify-between dark:from-pink-950/30 dark:to-purple-950/20">
              <div className="flex items-center gap-2">
                <Receipt size={20} style={{color:'var(--color-accent, #e2569a)'}} />
                <h2 className="font-bold text-[var(--color-primary)] dark:text-pink-300" style={{fontFamily:'Georgia, serif'}}>Detalhes do Pedido</h2>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-pink-900/40 text-[var(--color-primary)] dark:text-pink-200 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
{/* Content */}
            <div className="overflow-y-auto p-5 space-y-4 flex-1">
              {/* Cliente */}
              <div className="rounded-2xl p-4 border border-[var(--color-accent-soft)] dark:border-pink-900/30" style={{background:'rgba(255,255,255,0.7)'}}>
                <p className="text-xs font-bold text-[var(--color-accent)] dark:text-pink-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <User size={13} /> Cliente
                </p>
                <div className="font-bold text-slate-800 dark:text-pink-100 mb-1">{selectedOrder.resellerName}</div>
                <div className="text-sm text-slate-500 dark:text-pink-300/80 flex items-center gap-1.5">
                  <Phone size={13} /> {selectedOrder.resellerPhone}
                </div>
                {selectedOrder.resellerCode && (
                  <div className="text-sm text-[var(--color-accent)] dark:text-pink-400 mt-1 flex items-center gap-1">
                    <Hash size={13} /> CPF/Cód: {selectedOrder.resellerCode}
                  </div>
                )}
              </div>

              {/* Itens */}
              <div className="rounded-2xl p-4 border border-[var(--color-accent-soft)] dark:border-pink-900/30" style={{background:'rgba(255,255,255,0.7)'}}>
                <p className="text-xs font-bold text-[var(--color-accent)] dark:text-pink-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <ClipboardList size={13} /> Itens do Pedido
                </p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={`${item.variantKey || idx}`} className="flex flex-col gap-1 pb-2 border-b border-black/5 dark:border-pink-900/20 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex-shrink-0 px-2 py-0.5 rounded-lg text-xs font-bold text-white" style={{background:'var(--store-gradient, linear-gradient(135deg, #e2709d, #8b74d8))'}}>
                            {item.quantity}x
                          </span>
                          <span className="text-sm font-medium text-slate-700 dark:text-pink-200 truncate">{item.title}</span>
                        </div>
                        <span className="text-sm font-bold text-[var(--color-accent)] dark:text-pink-400 whitespace-nowrap ml-3">
                          R$ {(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      {(item.color || item.size) && (
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <span className="font-semibold text-[var(--color-primary)]">Opção:</span>
                          {[item.color, item.size].filter(Boolean).join(' / ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Observações */}
              {selectedOrder.notes && (
                <div className="rounded-2xl p-4 border border-[var(--color-accent-soft)] dark:border-pink-900/30" style={{background:'rgba(255,255,255,0.7)'}}>
                  <p className="text-xs font-bold text-[var(--color-accent)] dark:text-pink-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <ClipboardList size={13} /> Observações
                  </p>
                  <p className="text-sm text-slate-600 dark:text-pink-200/80">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Total */}
              <div className="rounded-2xl p-4 text-white flex items-center justify-between" style={{background:'var(--store-gradient, linear-gradient(135deg, #e2709d, #8b74d8))'}}>
                <div>
                  <div className="text-xs font-semibold opacity-80 uppercase tracking-wider">Total do Pedido</div>
                  <div className="text-[11px] mt-0.5 opacity-70">Status: {statusLabels[selectedOrder.status]}</div>
                </div>
                <div className="text-2xl font-black">R$ {selectedOrder.totalAmount.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

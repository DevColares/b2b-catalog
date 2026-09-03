import { useState, useEffect } from 'react';
import { Eye, ChevronDown, Check } from 'lucide-react';

export interface Order {
  id: string;
  resellerName: string;
  resellerPhone: string;
  resellerCode?: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: Date;
  items: any[];
  notes?: string;
}

interface OrderTableProps {
  orders: Order[];
  onStatusChange: (id: string, status: Order['status']) => void;
  onViewDetails: (order: Order) => void;
}

const statusMeta = {
  pending:    { label: 'Pendente',    dot: 'bg-yellow-400',   chip: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  processing: { label: 'Processando', dot: 'bg-blue-400',     chip: 'bg-blue-100 text-blue-800 border-blue-200' },
  completed:  { label: 'ConcluÃ­do',   dot: 'bg-green-400',    chip: 'bg-green-100 text-green-800 border-green-200' },
  cancelled:  { label: 'Cancelado',   dot: 'bg-red-400',      chip: 'bg-red-100 text-red-800 border-red-200' },
} as const;

const statusOrder: Order['status'][] = ['pending', 'processing', 'completed', 'cancelled'];

export function OrderTable({ orders, onStatusChange, onViewDetails }: OrderTableProps) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<{ top: number; left: number; openUp: boolean } | null>(null);

  // Fecha o menu ao clicar fora, rolar ou redimensionar
  useEffect(() => {
    if (!openDropdownId) return;
    const close = () => setOpenDropdownId(null);
    window.addEventListener('click', close);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [openDropdownId]);

  const toggleDropdown = (orderId: string, e: React.MouseEvent) => {
    if (openDropdownId === orderId) {
      setOpenDropdownId(null);
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (rect) {
      const DROPDOWN_H = 190; // altura aproximada das 4 opÃ§Ãµes
      const openUp = rect.bottom + DROPDOWN_H + 8 > window.innerHeight && rect.top > DROPDOWN_H;
      setAnchor({ top: openUp ? rect.top - DROPDOWN_H - 4 : rect.bottom + 4, left: rect.left, openUp });
    }
    setOpenDropdownId(orderId);
  };

  return (
    <>
    {/* Desktop: tabela */}
    <div className="hidden md:block w-full rounded-2xl shadow-lg overflow-hidden border transition-all duration-300" style={{background: '#ffffff', borderColor: 'var(--color-accent-soft, #fce7f3)'}}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-sm" style={{background: 'var(--color-accent-soft, #fff9fc)', borderColor: 'var(--color-accent-soft, #fce7f3)', color: 'var(--color-accent, #b0658a)'}}>
              <th className="p-4 font-semibold">ID / Data</th>
              <th className="p-4 font-semibold">Cliente</th>
              <th className="p-4 font-semibold">Valor</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">AÃ§Ãµes</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{borderColor: 'var(--color-accent-soft, #fce7f3)'}}>
            {orders.map(order => {
              const isOpen = openDropdownId === order.id;
              const meta = statusMeta[order.status];
              return (
              <tr key={order.id} className="transition-colors" style={{borderColor: 'var(--color-accent-soft, #fce7f3)'}} onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-soft, #fff9fc)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td className="p-4">
                  <div className="font-mono text-xs mb-1" style={{color: 'var(--color-accent, #b0658a)'}}>#{order.id.slice(0,8).toUpperCase()}</div>
                  <div className="text-sm font-medium" style={{color: '#334155'}}>
                    {order.createdAt.toLocaleDateString()}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-bold" style={{color: '#1e293b'}}>{order.resellerName}</div>
                  {order.resellerCode && (
                    <div className="text-xs font-medium mt-0.5" style={{color: 'var(--color-accent, #e2569a)'}}>CPF/CÃ³d: {order.resellerCode}</div>
                  )}
                  <div className="text-sm" style={{color: '#64748b'}}>{order.resellerPhone}</div>
                </td>
                <td className="p-4 font-bold" style={{color: 'var(--color-primary, #c2458f)'}}>
                  R$ {order.totalAmount.toFixed(2)}
                </td>
                <td className="p-4">
                  <div className="relative inline-block">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleDropdown(order.id, e); }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${meta.chip}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${meta.dot}`}></span>
                      {meta.label}
                      <ChevronDown size={14} className={`opacity-60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="fixed w-44 rounded-xl shadow-xl border overflow-hidden z-50" style={{background: 'var(--color-accent-soft, #fff9fc)', borderColor: 'var(--color-accent-soft, #fce7f3)', top: anchor?.top ?? 0, left: anchor?.left ?? 0}}>
                        {statusOrder.map((status) => {
                          const item = statusMeta[status];
                          const isCurrent = status === order.status;
                          return (
                            <button
                              key={status}
                              onClick={() => {
                                if (status !== order.status) onStatusChange(order.id, status);
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors cursor-pointer"
                              style={{color: '#475569', background: isCurrent ? 'var(--color-accent-soft, #fff0f6)' : 'transparent'}}
                              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-soft, #fdf2f8)')}
                              onMouseLeave={e => (e.currentTarget.style.background = isCurrent ? 'var(--color-accent-soft, #fff0f6)' : 'transparent')}
                            >
                              <span className={`w-2 h-2 rounded-full ${item.dot}`}></span>
                              <span className={`flex-1 text-left ${isCurrent ? 'font-bold' : ''}`}>{item.label}</span>
                              {isCurrent && <Check size={14} style={{color: 'var(--color-accent, #e2569a)'}} />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => onViewDetails(order)}
                    className="p-2 rounded-lg transition-colors inline-flex cursor-pointer"
                    title="Ver Detalhes"
                    style={{color: '#94a3b8'}}
                    onMouseEnter={e => {e.currentTarget.style.color = 'var(--color-accent, #e2569a)'; e.currentTarget.style.background = 'var(--color-accent-soft, #fdf2f8)';}}
                    onMouseLeave={e => {e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent';}}
                  >
                    <Eye size={20} />
                  </button>
                </td>
              </tr>
              );
            })}

            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center" style={{color: '#94a3b8'}}>
                  Nenhum pedido encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

    {/* Mobile: cards */}
    <div className="md:hidden space-y-3">
      {orders.map(order => {
        const meta = statusMeta[order.status];
        const isOpen = openDropdownId === order.id;
        return (
          <div key={order.id} className="rounded-2xl border p-4 shadow-sm" style={{background: '#ffffff', borderColor: 'var(--color-accent-soft, #fce7f3)'}}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-bold truncate" style={{color: '#1e293b'}}>{order.resellerName}</div>
                <div className="text-xs font-mono mt-0.5" style={{color: 'var(--color-accent, #b0658a)'}}>#{order.id.slice(0,8).toUpperCase()} Â· {order.createdAt.toLocaleDateString()}</div>
              </div>
              <div className="font-bold text-right whitespace-nowrap" style={{color: 'var(--color-primary, #c2458f)'}}>
                R$ {order.totalAmount.toFixed(2)}
              </div>
            </div>

            <div className="mt-2 text-xs space-y-0.5" style={{color: '#64748b'}}>
              {order.resellerPhone && <div>ðŸ“ž {order.resellerPhone}</div>}
              {order.resellerCode && <div>CPF/CÃ³d: {order.resellerCode}</div>}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleDropdown(order.id, e); }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${meta.chip}`}
                >
                  <span className={`w-2 h-2 rounded-full ${meta.dot}`}></span>
                  {meta.label}
                  <ChevronDown size={14} className={`opacity-60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="fixed w-44 rounded-xl shadow-xl border overflow-hidden z-50" style={{background: '#ffffff', borderColor: 'var(--color-accent-soft, #fce7f3)', top: anchor?.top ?? 0, left: anchor?.left ?? 0}}>
                    {statusOrder.map((status) => {
                      const item = statusMeta[status];
                      const isCurrent = status === order.status;
                      return (
                        <button
                          key={status}
                          onClick={() => {
                            if (status !== order.status) onStatusChange(order.id, status);
                            setOpenDropdownId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors cursor-pointer"
                          style={{color: '#475569', background: isCurrent ? 'var(--color-accent-soft, #fff0f6)' : 'transparent'}}
                        >
                          <span className={`w-2 h-2 rounded-full ${item.dot}`}></span>
                          <span className={`flex-1 text-left ${isCurrent ? 'font-bold' : ''}`}>{item.label}</span>
                          {isCurrent && <Check size={14} style={{color: 'var(--color-accent, #e2569a)'}} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={() => onViewDetails(order)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold border transition-colors cursor-pointer"
                style={{color: 'var(--color-primary, #c2458f)', borderColor: 'var(--color-accent-soft, #fce7f3)'}}
              >
                <Eye size={16} /> Ver detalhes
              </button>
            </div>
          </div>
        );
      })}

      {orders.length === 0 && (
        <div className="rounded-2xl border p-8 text-center" style={{color: '#94a3b8', borderColor: 'var(--color-accent-soft, #fce7f3)'}}>
          Nenhum pedido encontrado.
        </div>
      )}
    </div>
    </>
  );
}

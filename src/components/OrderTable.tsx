import { useState } from 'react';
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
  completed:  { label: 'Concluído',   dot: 'bg-green-400',    chip: 'bg-green-100 text-green-800 border-green-200' },
  cancelled:  { label: 'Cancelado',   dot: 'bg-red-400',      chip: 'bg-red-100 text-red-800 border-red-200' },
} as const;

const statusOrder: Order['status'][] = ['pending', 'processing', 'completed', 'cancelled'];

export function OrderTable({ orders, onStatusChange, onViewDetails }: OrderTableProps) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  return (
    <div className="w-full rounded-2xl shadow-lg overflow-hidden border transition-all duration-300" style={{background: '#ffffff', borderColor: '#fce7f3'}}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-sm" style={{background: '#fff9fc', borderColor: '#fce7f3', color: '#b0658a'}}>
              <th className="p-4 font-semibold">ID / Data</th>
              <th className="p-4 font-semibold">Cliente</th>
              <th className="p-4 font-semibold">Valor</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{borderColor: '#fce7f3'}}>
            {orders.map(order => {
              const isOpen = openDropdownId === order.id;
              const meta = statusMeta[order.status];
              return (
              <tr key={order.id} className="transition-colors" style={{borderColor: '#fce7f3'}} onMouseEnter={e => (e.currentTarget.style.background = '#fff9fc')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td className="p-4">
                  <div className="font-mono text-xs mb-1" style={{color: '#b0658a'}}>#{order.id.slice(0,8).toUpperCase()}</div>
                  <div className="text-sm font-medium" style={{color: '#334155'}}>
                    {order.createdAt.toLocaleDateString()}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-bold" style={{color: '#1e293b'}}>{order.resellerName}</div>
                  {order.resellerCode && (
                    <div className="text-xs font-medium mt-0.5" style={{color: '#e2569a'}}>CPF/Cód: {order.resellerCode}</div>
                  )}
                  <div className="text-sm" style={{color: '#64748b'}}>{order.resellerPhone}</div>
                </td>
                <td className="p-4 font-bold" style={{color: '#c2458f'}}>
                  R$ {order.totalAmount.toFixed(2)}
                </td>
                <td className="p-4">
                  <div className="relative inline-block">
                    <button
                      onClick={() => setOpenDropdownId(prev => (prev === order.id ? null : order.id))}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${meta.chip}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${meta.dot}`}></span>
                      {meta.label}
                      <ChevronDown size={14} className={`opacity-60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="absolute top-full left-0 mt-1 w-44 rounded-xl shadow-xl border overflow-hidden z-10" style={{background: '#fff9fc', borderColor: '#fce7f3'}}>
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
                              style={{color: '#475569', background: isCurrent ? '#fff0f6' : 'transparent'}}
                              onMouseEnter={e => (e.currentTarget.style.background = '#fdf2f8')}
                              onMouseLeave={e => (e.currentTarget.style.background = isCurrent ? '#fff0f6' : 'transparent')}
                            >
                              <span className={`w-2 h-2 rounded-full ${item.dot}`}></span>
                              <span className={`flex-1 text-left ${isCurrent ? 'font-bold' : ''}`}>{item.label}</span>
                              {isCurrent && <Check size={14} style={{color: '#e2569a'}} />}
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
                    onMouseEnter={e => {e.currentTarget.style.color = '#e2569a'; e.currentTarget.style.background = '#fdf2f8';}}
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
  );
}

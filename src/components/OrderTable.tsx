import { Eye, ChevronDown } from 'lucide-react';

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

const statusColors = (isDark: boolean) => ({
  pending: isDark ? 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50' : 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: isDark ? 'bg-blue-900/40 text-blue-300 border-blue-700/50' : 'bg-blue-100 text-blue-800 border-blue-200',
  completed: isDark ? 'bg-green-900/40 text-green-300 border-green-700/50' : 'bg-green-100 text-green-800 border-green-200',
  cancelled: isDark ? 'bg-red-900/40 text-red-300 border-red-700/50' : 'bg-red-100 text-red-800 border-red-200',
});

const statusLabels = {
  pending: 'Pendente',
  processing: 'Processando',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export function OrderTable({ orders, onStatusChange, onViewDetails }: OrderTableProps) {
  const isDark = document.body.classList.contains('dark');
  const activeStatusColors = statusColors(isDark);

  return (
    <div className="w-full rounded-2xl shadow-lg overflow-hidden border transition-all duration-300" style={{background: isDark ? 'rgba(30,12,26,0.8)' : '#ffffff', borderColor: isDark ? 'rgba(190,24,93,0.2)' : '#e2e8f0'}}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-sm transition-colors duration-300" style={{background: isDark ? 'rgba(157,23,77,0.15)' : '#f8fafc', borderColor: isDark ? 'rgba(190,24,93,0.2)' : '#e2e8f0', color: isDark ? '#f9a8d4' : '#64748b'}}>
              <th className="p-4 font-semibold">ID / Data</th>
              <th className="p-4 font-semibold">Cliente</th>
              <th className="p-4 font-semibold">Valor</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-900/20">
            {orders.map(order => (
              <tr key={order.id} className="transition-colors group" style={{borderColor: isDark ? 'rgba(190,24,93,0.1)' : '#f1f5f9'}} onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(157,23,77,0.1)' : '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td className="p-4">
                  <div className="font-mono text-xs mb-1" style={{color: isDark ? '#9d5078' : '#64748b'}}>#{order.id.slice(0,8).toUpperCase()}</div>
                  <div className="text-sm font-medium" style={{color: isDark ? '#f0abfc' : '#334155'}}>
                    {order.createdAt.toLocaleDateString()}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-bold" style={{color: isDark ? '#fce7f3' : '#1e293b'}}>{order.resellerName}</div>
                  {order.resellerCode && (
                    <div className="text-xs font-medium mt-0.5" style={{color: isDark ? '#ec4899' : '#e2569a'}}>CPF/Cód: {order.resellerCode}</div>
                  )}
                  <div className="text-sm" style={{color: isDark ? '#9d5078' : '#64748b'}}>{order.resellerPhone}</div>
                </td>
                <td className="p-4 font-bold" style={{color: isDark ? '#f9a8d4' : '#0f172a'}}>
                  R$ {order.totalAmount.toFixed(2)}
                </td>
                <td className="p-4">
                  <div className="relative inline-block group/dropdown">
                    <button className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${activeStatusColors[order.status]}`}>
                      {statusLabels[order.status]}
                      <ChevronDown size={14} className="opacity-50" />
                    </button>
                    
                    <div className="absolute top-full left-0 mt-1 w-36 rounded-xl shadow-xl opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all z-10 border" style={{background: isDark ? '#2a1020' : '#ffffff', borderColor: isDark ? 'rgba(190,24,93,0.3)' : '#e2e8f0'}}>
                      {Object.keys(statusLabels).map((status) => (
                        <button
                          key={status}
                          onClick={() => onStatusChange(order.id, status as Order['status'])}
                          className="w-full text-left px-4 py-2 text-sm first:rounded-t-xl last:rounded-b-xl transition-colors cursor-pointer"
                          style={{color: isDark ? '#f9a8d4' : '#475569'}}
                          onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(157,23,77,0.3)' : '#f1f5f9')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          {statusLabels[status as Order['status']]}
                        </button>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => onViewDetails(order)}
                    className="p-2 rounded-lg transition-colors inline-flex cursor-pointer"
                    title="Ver Detalhes"
                    style={{color: isDark ? '#9d5078' : '#94a3b8'}}
                    onMouseEnter={e => {e.currentTarget.style.color = '#e2569a'; e.currentTarget.style.background = isDark ? 'rgba(236,72,153,0.1)' : '#fdf2f8';}}
                    onMouseLeave={e => {e.currentTarget.style.color = isDark ? '#9d5078' : '#94a3b8'; e.currentTarget.style.background = 'transparent';}}
                  >
                    <Eye size={20} />
                  </button>
                </td>
              </tr>
            ))}
            
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center" style={{color: isDark ? '#9d5078' : '#94a3b8'}}>
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

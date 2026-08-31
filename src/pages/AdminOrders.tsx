import { useState, useEffect } from 'react';
import { OrderTable } from '../components/OrderTable';
import { subscribeToOrders, updateOrderStatus } from '../lib/db';
import type { Order } from '../lib/db';

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToOrders((data) => {
      // Data contains Firestore Timestamps, we map them to Date objects for the UI
      const mappedOrders = data.map(o => ({
        ...o,
        createdAt: o.createdAt?.toDate() || new Date()
      }));
      setOrders(mappedOrders as Order[]);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (id: string, status: Order['status']) => {
    await updateOrderStatus(id, status);
  };

  const handleViewDetails = (order: Order) => {
    // Basic alert for now, could be replaced with a full modal
    alert(`Pedido de ${order.resellerName}${order.resellerCode ? `\nCPF/Cód Revendedor: ${order.resellerCode}` : ''}\nTelefone: ${order.resellerPhone}\nTotal: R$ ${order.totalAmount}\n\nItens:\n${order.items.map(i => `${i.quantity}x ${i.title}`).join('\n')}`);
  };

  return (
    <>
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-pink-200">Gestão de Pedidos</h1>
          <p className="mt-1 text-slate-500 dark:text-pink-400/70">Gerencie os pedidos recebidos via catálogo</p>
        </div>
      </header>

      <OrderTable 
        orders={orders as any}
        onStatusChange={handleStatusChange}
        onViewDetails={handleViewDetails}
      />
    </>
  );
}

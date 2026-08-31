export interface OrderItem {
  productId: string;
  title: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

export function formatWhatsAppMessage(
  resellerName: string,
  resellerPhone: string,
  items: OrderItem[],
  totalAmount: number,
  notes: string
): string {
  let message = `*Novo Pedido de ${resellerName}*\n`;
  message += `Telefone: ${resellerPhone}\n\n`;
  message += `*Itens do Pedido:*\n`;

  items.forEach((item) => {
    message += `- ${item.quantity}x ${item.title} (SKU: ${item.sku}) - R$ ${item.unitPrice.toFixed(2)}\n`;
  });

  message += `\n*Total: R$ ${totalAmount.toFixed(2)}*\n`;
  
  if (notes) {
    message += `\n*Observações:*\n${notes}`;
  }

  return message;
}

export function getWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

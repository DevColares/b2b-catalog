export interface OrderItem {
  productId: string;
  title: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  color?: string;
  size?: string;
  variantKey?: string;
}

// Chave composta do carrinho: identifica uma combinação específica (cor/tamanho).
export function makeVariantKey(pid: string, color = '', size = '') {
  return `${pid}|${color || ''}|${size || ''}`;
}

export function parseVariantKey(key: string): { productId: string; color?: string; size?: string } {
  const [pid, color, size] = key.split('|');
  return { productId: pid, color: color || undefined, size: size || undefined };
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
    const variant = [item.color, item.size].filter(Boolean).join(' / ');
    message += `- ${item.quantity}x ${item.title} (SKU: ${item.sku})${variant ? ` - ${variant}` : ''} - R$ ${item.unitPrice.toFixed(2)}\n`;
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

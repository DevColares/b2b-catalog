import { collection, addDoc, getDocs, updateDoc, doc, onSnapshot, query, where, orderBy, serverTimestamp, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface Product {
  id?: string;
  title: string;
  sku: string;
  imageUrl: string;
  regularPrice: number;
  promoPrice: number;
  resalePrice?: number;
  progressiveDiscounts?: { minQuantity: number; discountPercentage: number }[];
  isActive: boolean;
  isFeatured?: boolean;
  // Vestuário: variações disponíveis (cor e/ou tamanho)
  colors?: string[];
  sizes?: string[];
}

export interface CatalogSettings {
  title: string;
  subtitle?: string;
}

export interface StoreTheme {
  primary: string;
  secondary: string;
  accent: string;
}

export type BusinessModel = 'cosmetics' | 'clothing' | 'general';

export interface UserProfile extends CatalogSettings {
  theme: StoreTheme;
  logoUrl?: string;
  businessModel?: BusinessModel;
  ownerEmail?: string;
  createdAt?: any;
}

export interface Order {
  id?: string;
  resellerName: string;
  resellerPhone: string;
  resellerCode?: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: any;
  items: any[];
  notes?: string;
}

// Tema padrão aplicado ao criar uma nova conta: branco/minimalista
export const DEFAULT_PROFILE: UserProfile = {
  title: 'Ofertas do Ciclo',
  subtitle: '',
  businessModel: 'general',
  theme: {
    primary: '#111827',
    secondary: '#E5E7EB',
    accent: '#4B5563',
  },
};

/* =========================================================
   Multi-tenant: todos os dados ficam em subcoleções por uid
   users/{uid}/products · users/{uid}/orders · users/{uid}/profile
   ========================================================= */

export const productsCol = (uid: string) => collection(db, 'users', uid, 'products');
export const ordersCol = (uid: string) => collection(db, 'users', uid, 'orders');
export const profileDoc = (uid: string) => doc(db, 'users', uid, 'profile', 'store');

// Products
export const getActiveProducts = async (uid: string) => {
  const q = query(productsCol(uid), where('isActive', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
};

export const subscribeToProducts = (uid: string, callback: (products: Product[]) => void) => {
  const q = productsCol(uid);
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
  }, (err) => {
    // Nunca deixa a tela travar em "carregando": loga e segue com lista vazia
    console.error('Erro ao carregar produtos:', err.code, err.message);
    callback([]);
  });
};

export const addProduct = async (uid: string, product: Omit<Product, 'id'>) => {
  return addDoc(productsCol(uid), { ...product, createdAt: serverTimestamp() });
};

export const updateProduct = async (uid: string, id: string, data: Partial<Product>) => {
  return updateDoc(doc(productsCol(uid), id), data);
};

export const deleteProduct = async (uid: string, id: string) => {
  return deleteDoc(doc(productsCol(uid), id));
};

// Orders
export const createOrder = async (uid: string, order: Omit<Order, 'id' | 'createdAt'>) => {
  return addDoc(ordersCol(uid), { ...order, createdAt: serverTimestamp() });
};

export const subscribeToOrders = (uid: string, callback: (orders: Order[]) => void) => {
  const q = query(ordersCol(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
  }, (err) => {
    console.error('Erro ao carregar pedidos:', err.code, err.message);
    callback([]);
  });
};

export const updateOrderStatus = async (uid: string, id: string, status: Order['status']) => {
  return updateDoc(doc(ordersCol(uid), id), { status });
};

// Store Profile (nome da loja + paleta de cores)
export const getProfile = async (uid: string): Promise<UserProfile> => {
  const snap = await getDoc(profileDoc(uid));
  if (snap.exists()) return { ...DEFAULT_PROFILE, ...snap.data() } as UserProfile;
  return DEFAULT_PROFILE;
};

export const updateProfile = async (uid: string, profile: Partial<UserProfile>) => {
  return setDoc(profileDoc(uid), profile, { merge: true });
};

// Upload do logo da loja SEM Firebase Storage (plano grátis):
// a imagem é comprimida no navegador e salva como data URL no doc do perfil.
// Firestore aceita docs até 1 MB; comprimimos para caber com folga.
export const compressLogo = (file: File, maxSide = 256, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.size > 2 * 1024 * 1024) {
      reject(new Error('A imagem deve ter no máximo 2 MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Arquivo de imagem inválido.'));
      img.onload = () => {
        // Mantém proporção, limitando o maior lado a maxSide
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));

        // Canvas 1: desenha SEM fundo para preservar a transparência do PNG
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas não suportado.')); return; }
        ctx.drawImage(img, 0, 0, w, h);

        // Detecta se a imagem tem transparência (pixels com alpha < 255)
        const data = ctx.getImageData(0, 0, w, h).data;
        let hasAlpha = false;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 255) { hasAlpha = true; break; }
        }

        let dataUrl = canvas.toDataURL('image/png');

        // Sem transparência e PNG pesado → converte para JPEG (com fundo branco)
        if (!hasAlpha && dataUrl.length > 60 * 1024) {
          const jCanvas = document.createElement('canvas');
          jCanvas.width = w;
          jCanvas.height = h;
          const jCtx = jCanvas.getContext('2d');
          if (jCtx) {
            jCtx.fillStyle = '#ffffff';
            jCtx.fillRect(0, 0, w, h);
            jCtx.drawImage(img, 0, 0, w, h);
            dataUrl = jCanvas.toDataURL('image/jpeg', quality);
          }
        }

        // Limites de segurança para o Firestore (doc máx. 1 MB)
        if (dataUrl.length > 700 * 1024 && !hasAlpha) {
          const jCanvas = document.createElement('canvas');
          jCanvas.width = w;
          jCanvas.height = h;
          const jCtx = jCanvas.getContext('2d');
          if (jCtx) {
            jCtx.fillStyle = '#ffffff';
            jCtx.fillRect(0, 0, w, h);
            jCtx.drawImage(img, 0, 0, w, h);
            dataUrl = jCanvas.toDataURL('image/jpeg', 0.7);
          }
        }
        if (dataUrl.length > 900 * 1024) {
          reject(new Error('Imagem muito grande mesmo comprimida. Envie um logo mais simples.'));
          return;
        }
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const subscribeToProfile = (uid: string, callback: (p: UserProfile) => void) => {
  return onSnapshot(profileDoc(uid), (snap) => {
    if (snap.exists()) callback({ ...DEFAULT_PROFILE, ...snap.data() } as UserProfile);
    else callback(DEFAULT_PROFILE);
  }, (err) => {
    console.error('Erro ao carregar perfil da loja:', err.code, err.message);
    callback(DEFAULT_PROFILE);
  });
};

import { collection, addDoc, getDocs, updateDoc, doc, onSnapshot, query, where, orderBy, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
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
}

export interface CatalogSettings {
  title: string;
  subtitle?: string;
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

// Products
export const getActiveProducts = async () => {
  const q = query(collection(db, 'products'), where('isActive', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  const q = collection(db, 'products');
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
  });
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  return addDoc(collection(db, 'products'), { ...product, createdAt: serverTimestamp() });
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
  const docRef = doc(db, 'products', id);
  return updateDoc(docRef, data);
};

// Orders
export const createOrder = async (order: Omit<Order, 'id' | 'createdAt'>) => {
  return addDoc(collection(db, 'orders'), { ...order, createdAt: serverTimestamp() });
};

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
  });
};

export const updateOrderStatus = async (id: string, status: Order['status']) => {
  const docRef = doc(db, 'orders', id);
  return updateDoc(docRef, { status });
};

// Catalog Settings
const SETTINGS_DOC = doc(db, 'settings', 'catalog');

export const getCatalogSettings = async (): Promise<CatalogSettings> => {
  const snap = await getDoc(SETTINGS_DOC);
  if (snap.exists()) return snap.data() as CatalogSettings;
  return { title: 'Ofertas do Ciclo', subtitle: '' };
};

export const updateCatalogSettings = async (settings: CatalogSettings) => {
  return setDoc(SETTINGS_DOC, settings, { merge: true });
};

export const subscribeToCatalogSettings = (callback: (s: CatalogSettings) => void) => {
  return onSnapshot(SETTINGS_DOC, (snap) => {
    if (snap.exists()) callback(snap.data() as CatalogSettings);
    else callback({ title: 'Ofertas do Ciclo', subtitle: '' });
  });
};

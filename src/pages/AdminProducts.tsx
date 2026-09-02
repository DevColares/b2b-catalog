import { useState, useEffect } from 'react';
import { Package, Plus, Pencil, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { subscribeToProducts, addProduct, updateProduct } from '../lib/db';
import type { Product } from '../lib/db';

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [regularPrice, setRegularPrice] = useState('');
  const [promoPrice, setPromoPrice] = useState('');
  const [resalePrice, setResalePrice] = useState('');
  const [progressiveDiscounts, setProgressiveDiscounts] = useState<{minQuantity: number, discountPercentage: number}[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToProducts((data) => {
      setProducts(data);
    });
    return () => unsubscribe();
  }, []);

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setTitle(product.title);
      setSku(product.sku);
      setImageUrl(product.imageUrl);
      setRegularPrice(product.regularPrice.toString());
      setPromoPrice(product.promoPrice.toString());
      setResalePrice(product.resalePrice !== undefined ? product.resalePrice.toString() : '');
      setProgressiveDiscounts(product.progressiveDiscounts || []);
      setIsActive(product.isActive);
      setIsFeatured(product.isFeatured || false);
    } else {
      setEditingProduct(null);
      setTitle('');
      setSku('');
      setImageUrl('');
      setRegularPrice('');
      setPromoPrice('');
      setResalePrice('');
      setProgressiveDiscounts([]);
      setIsActive(true);
      setIsFeatured(false);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      title,
      sku,
      imageUrl,
      regularPrice: parseFloat(regularPrice) || 0,
      promoPrice: parseFloat(promoPrice) || 0,
      resalePrice: parseFloat(resalePrice) || 0,
      progressiveDiscounts: progressiveDiscounts
        .filter(d => typeof d.minQuantity === 'number' && typeof d.discountPercentage === 'number' && !isNaN(d.minQuantity) && !isNaN(d.discountPercentage))
        .sort((a,b) => a.minQuantity - b.minQuantity),
      isActive,
      isFeatured
    };

    if (editingProduct && editingProduct.id) {
      await updateProduct(editingProduct.id, productData);
    } else {
      await addProduct(productData);
    }
    setIsModalOpen(false);
  };

  const toggleActive = async (product: Product) => {
    if (product.id) {
      await updateProduct(product.id, { isActive: !product.isActive });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title font-bold flex items-center gap-3" style={{color:'#c2458f'}}>
            <Package size={32} style={{color:'#e2569a'}} />
            Produtos
          </h1>
          <p className="mt-1" style={{color:'#b0658a'}}>Gerencie o catálogo de produtos do B2B</p>
        </div>
        <div className="page-header-actions">
          <button 
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg w-full sm:w-auto"
            style={{background:'linear-gradient(135deg, #e2709d, #8b74d8)', boxShadow:'0 4px 15px rgba(226,112,157,0.3)'}}
          >
            <Plus size={20} />
            Novo Produto
          </button>
        </div>
      </div>

      <div className="table-scroll rounded-2xl shadow-lg overflow-hidden border" style={{background: '#ffffff', borderColor: '#fce7f3'}}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-sm" style={{background: '#fff9fc', borderColor: '#fce7f3', color: '#c2458f'}}>
              <th className="p-4 font-semibold">Produto</th>
              <th className="p-4 font-semibold">SKU</th>
              <th className="p-4 font-semibold">Preços</th>
              <th className="p-4 font-semibold text-center">Destaque</th>
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-100">
            {products.map(product => (
              <tr key={product.id} className="transition-colors" style={{borderColor: '#fce7f3'}} onMouseEnter={e => (e.currentTarget.style.background = '#fff9fc')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td className="p-4 flex items-center gap-3">
                  <img 
                    src={product.imageUrl || 'https://placehold.co/100x100?text=Sem+Foto'} 
                    alt={product.title} 
                    className="w-12 h-12 rounded-lg object-cover"
                    style={{background:'#fff0f6'}}
                  />
                  <span className="font-bold line-clamp-1" style={{color:'#1e293b'}}>{product.title}</span>
                </td>
                <td className="p-4 text-sm font-mono" style={{color:'#b0658a'}}>{product.sku}</td>
                <td className="p-4">
                  <div className="font-bold" style={{color:'#c2458f'}}>R$ {product.regularPrice.toFixed(2)}</div>
                  {product.promoPrice > 0 && (
                    <div className="text-xs font-bold" style={{color:'#e2569a'}}>Promo: R$ {product.promoPrice.toFixed(2)}</div>
                  )}
                  {product.progressiveDiscounts && product.progressiveDiscounts.length > 0 && (
                    <div className="text-xs font-bold mt-1" style={{color:'#a78bfa'}}>
                      Desc. Prog: {product.progressiveDiscounts.length} níveis
                    </div>
                  )}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${product.isFeatured ? 'bg-amber-900/40 text-amber-300' : 'text-slate-500'}`} style={!product.isFeatured ? {background:'#fff9fc'} : {}}>
                    {product.isFeatured ? 'Sim' : 'Não'}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => toggleActive(product)} className="inline-flex items-center justify-center p-1 rounded-full transition-transform hover:scale-110">
                    {product.isActive ? (
                      <CheckCircle size={24} className="text-green-400" />
                    ) : (
                      <XCircle size={24} style={{color:'#b0658a'}} />
                    )}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => openModal(product)}
                    className="p-2 transition-colors rounded-lg"
                    style={{color:'#b0658a'}}
                    onMouseEnter={e => {e.currentTarget.style.color = '#e2569a';}}
                    onMouseLeave={e => {e.currentTarget.style.color = '#b0658a';}}
                  >
                    <Pencil size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center" style={{color:'#b0658a'}}>Nenhum produto cadastrado ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{background:'rgba(26,10,20,0.7)'}}>
          <div className="rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border" style={{background:'#ffffff', borderColor:'#fce7f3'}}>
            <div className="p-6 border-b flex justify-between items-center" style={{background:'#fff9fc', borderColor:'#fce7f3'}}>
              <h2 className="text-xl font-bold" style={{color:'#c2458f'}}>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{color:'#b0658a'}}><XCircle size={24}/></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold mb-1" style={{color:'#c2458f'}}>Título</label>
                  <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2.5 rounded-xl border outline-none transition-all" style={{background:'#ffffff', borderColor:'#fbcfe8', color:'#1e293b'}} />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{color:'#c2458f'}}>SKU</label>
                  <input required type="text" value={sku} onChange={e => setSku(e.target.value)} className="w-full p-2.5 rounded-xl border outline-none transition-all" style={{background:'#ffffff', borderColor:'#fbcfe8', color:'#1e293b'}} />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1" style={{color:'#c2458f'}}>URL da Imagem</label>
                  <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full p-2.5 rounded-xl border outline-none transition-all" style={{background:'#ffffff', borderColor:'#fbcfe8', color:'#1e293b'}} placeholder="https://..." />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1" style={{color:'#c2458f'}}>Preço Normal (R$)</label>
                  <input required type="number" step="0.01" min="0" value={regularPrice} onChange={e => setRegularPrice(e.target.value)} className="w-full p-2.5 rounded-xl border outline-none transition-all" style={{background:'#ffffff', borderColor:'#fbcfe8', color:'#1e293b'}} />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1" style={{color:'#c2458f'}}>Preço Promocional (R$)</label>
                  <input type="number" step="0.01" min="0" value={promoPrice} onChange={e => setPromoPrice(e.target.value)} className="w-full p-2.5 rounded-xl border outline-none transition-all" style={{background:'#ffffff', borderColor:'#fbcfe8', color:'#1e293b'}} placeholder="Opcional" />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1" style={{color:'#c2458f'}}>Valor de Revenda (R$)</label>
                  <input type="number" step="0.01" min="0" value={resalePrice} onChange={e => setResalePrice(e.target.value)} className="w-full p-2.5 rounded-xl border outline-none transition-all" style={{background:'#ffffff', borderColor:'#fbcfe8', color:'#1e293b'}} placeholder="Ex: 29,90" />
                  <p className="text-[11px] mt-1" style={{color:'#b0658a'}}>Preço sugerido de revenda. Usado para calcular o lucro do revendedor.</p>
                </div>

                <div className="col-span-2 mt-2 p-4 rounded-xl border" style={{background:'#fff5f9', borderColor:'#fce7f3'}}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-bold" style={{color:'#c2458f'}}>Desconto Progressivo</label>
                    <button 
                      type="button"
                      onClick={() => setProgressiveDiscounts([...progressiveDiscounts, { minQuantity: 5, discountPercentage: 5 }])}
                      className="text-xs flex items-center gap-1 border px-2 py-1 rounded-lg font-bold transition-colors"
                      style={{background:'#fff9fc', borderColor:'#fbcfe8', color:'#e2569a'}}
                    >
                      <Plus size={14} /> Adicionar Nível
                    </button>
                  </div>
                  
                  {progressiveDiscounts.length === 0 ? (
                    <p className="text-xs" style={{color:'#b0658a'}}>Nenhum desconto progressivo configurado. Adicione níveis para conceder descontos por quantidade.</p>
                  ) : (
                    <div className="space-y-2">
                      {progressiveDiscounts.map((discount, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-xs font-semibold w-24" style={{color:'#b0658a'}}>A partir de</span>
                            <input 
                              type="number" 
                              min="2" 
                              value={discount.minQuantity} 
                              onChange={e => {
                                const newDiscounts = [...progressiveDiscounts];
                                const val = e.target.value;
                                newDiscounts[index].minQuantity = val === '' ? ('' as any) : parseInt(val);
                                setProgressiveDiscounts(newDiscounts);
                              }}
                              className="w-full p-2 rounded-lg border outline-none text-sm"
                              style={{background:'#ffffff', borderColor:'#fbcfe8', color:'#1e293b'}}
                            />
                            <span className="text-xs font-semibold" style={{color:'#b0658a'}}>un.</span>
                          </div>
                          
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-xs font-semibold" style={{color:'#b0658a'}}>Desconto</span>
                            <input 
                              type="number" 
                              step="0.1"
                              min="0"
                              max="100"
                              value={discount.discountPercentage} 
                              onChange={e => {
                                const newDiscounts = [...progressiveDiscounts];
                                const val = e.target.value;
                                newDiscounts[index].discountPercentage = val === '' ? ('' as any) : parseFloat(val);
                                setProgressiveDiscounts(newDiscounts);
                              }}
                              className="w-full p-2 rounded-lg border outline-none text-sm"
                              style={{background:'#ffffff', borderColor:'#fbcfe8', color:'#1e293b'}}
                            />
                            <span className="text-xs font-semibold" style={{color:'#b0658a'}}>%</span>
                          </div>
                          
                          <button 
                            type="button" 
                            onClick={() => {
                              const newDiscounts = [...progressiveDiscounts];
                              newDiscounts.splice(index, 1);
                              setProgressiveDiscounts(newDiscounts);
                            }}
                            className="p-2 border rounded-lg transition-colors"
                            style={{color:'#b0658a', borderColor:'#fbcfe8', background:'#fff9fc'}}
                            onMouseEnter={e => {e.currentTarget.style.color = '#ef4444';}}
                            onMouseLeave={e => {e.currentTarget.style.color = '#b0658a';}}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="col-span-2 flex flex-col gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-5 h-5 rounded accent-pink-500" />
                    <label htmlFor="isActive" className="font-medium cursor-pointer" style={{color:'#c2458f'}}>Produto visível no catálogo público?</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="isFeatured" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-5 h-5 rounded accent-pink-500" />
                    <label htmlFor="isFeatured" className="font-medium cursor-pointer" style={{color:'#c2458f'}}>Exibir no Carrossel de Destaques?</label>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t mt-6" style={{borderColor:'#fce7f3'}}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 font-bold rounded-xl transition-colors" style={{color:'#b0658a'}} onMouseEnter={e => (e.currentTarget.style.background = '#fff9fc')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>Cancelar</button>
                <button type="submit" className="px-5 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95" style={{background:'linear-gradient(135deg, #e2709d, #8b74d8)', boxShadow:'0 4px 15px rgba(226,112,157,0.3)'}}>Salvar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

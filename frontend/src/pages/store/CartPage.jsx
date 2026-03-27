import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Package, Truck, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

const BACKEND = process.env.REACT_APP_BACKEND_URL_IMAGE || '';
const FREE_SHIPPING_THRESHOLD = 90;
const SHIPPING_COST = 5.99;

const CartPage = () => {
  const { cart, cartLoading, updateItem, removeItem, emptyCart, fetchCart } = useCart();
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuantityChange = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return handleRemove(item._id);
    try {
      setUpdatingId(item._id);
      await updateItem(item._id, newQty);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Errore aggiornamento quantità');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      setUpdatingId(itemId);
      await removeItem(itemId);
      toast.info('Prodotto rimosso dal carrello');
    } catch {
      toast.error('Errore nella rimozione');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Svuotare il carrello?')) return;
    await emptyCart();
    toast.info('Carrello svuotato');
  };

  const subtotal = cart.subtotal || 0;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;
  
  // Calcolo per la barra di progresso della spedizione gratuita
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  if (cartLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF3E0]">
        <div className="animate-spin h-14 w-14 border-4 border-[#EDE7D6] border-t-[#228B22] rounded-full mb-4" />
        <p className="text-[#2B2B2B]/50 font-medium">Caricamento carrello...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF3E0] min-h-screen py-12 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Header Carrello */}
        <div className="mb-10">
          <Link to="/store" className="inline-flex items-center text-sm font-semibold text-[#2B2B2B]/50 hover:text-[#228B22] transition-colors mb-6">
            ← Continua lo shopping
          </Link>
          <h1 className="text-4xl font-black text-[#2B2B2B] flex items-center gap-4 tracking-tight">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-[#EDE7D6]/50">
              <ShoppingCart size={32} className="text-[#228B22]" />
            </div>
            Il tuo carrello
          </h1>
        </div>

        {cart.items?.length === 0 ? (
          /* Empty State */
          <div className="text-center py-32 bg-white rounded-3xl shadow-sm border border-[#EDE7D6]/50 max-w-2xl mx-auto">
            <div className="inline-flex p-6 bg-[#FAF3E0] rounded-full mb-6">
              <Package size={64} className="text-[#556B2F]" />
            </div>
            <h3 className="text-3xl font-black text-[#2B2B2B] mb-3">Il carrello è vuoto</h3>
            <p className="text-[#2B2B2B]/60 mb-8 text-lg">Sembra che tu non abbia ancora aggiunto nessun kit.</p>
            <Link
              to="/store"
              className="inline-flex items-center gap-2 bg-[#228B22] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#228B22]/20 hover:bg-[#1a6b1a] hover:shadow-xl active:scale-95 transition-all"
            >
              Scopri i nostri kit <ArrowRight size={20} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Lista Prodotti */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#EDE7D6]/50">
                <div className="flow-root">
                  <ul className="divide-y divide-[#EDE7D6]/60 -my-6">
                    {cart.items.map((item) => {
                      const imgSrc = item.kit?.images?.[0]
                        ? `${BACKEND}${item.kit.images[0]}`
                        : 'https://placehold.co/120x90/EDE7D6/556B2F?text=Kit';
                      const isUpdating = updatingId === item._id;

                      return (
                        <li
                          key={item._id}
                          className={`flex py-6 transition-opacity duration-300 ${isUpdating ? 'opacity-50' : ''}`}
                        >
                          {/* Immagine */}
                          <div className="h-28 w-28 sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-2xl border border-[#EDE7D6] bg-[#FAF3E0] group">
                            <Link to={`/store/kits/${item.kit?._id}`}>
                              <img
                                src={imgSrc}
                                alt={item.kit?.name}
                                onError={(e) => { e.target.src = 'https://placehold.co/120x90/EDE7D6/556B2F?text=Kit'; }}
                                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                              />
                            </Link>
                          </div>

                          {/* Info Prodotto */}
                          <div className="ml-4 sm:ml-6 flex flex-1 flex-col">
                            <div>
                              <div className="flex justify-between text-base font-bold text-[#2B2B2B]">
                                <h4 className="line-clamp-2 hover:text-[#228B22] transition-colors">
                                  <Link to={`/store/kits/${item.kit?._id}`}>{item.kit?.name || 'Kit'}</Link>
                                </h4>
                                <p className="ml-4 text-xl font-black text-[#228B22]">€{item.lineTotal.toFixed(2)}</p>
                              </div>
                              <p className="mt-1 text-sm text-[#2B2B2B]/50 font-medium">€{item.priceSnapshot.toFixed(2)} / pz</p>
                            </div>

                            <div className="flex flex-1 items-end justify-between text-sm">
                              
                              {/* Stepper Quantità */}
                              <div className="flex items-center bg-[#FAF3E0] border border-[#EDE7D6] rounded-xl p-1 shadow-sm">
                                <button
                                  onClick={() => handleQuantityChange(item, -1)}
                                  disabled={isUpdating}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-[#2B2B2B] transition-colors disabled:opacity-50"
                                >
                                  <Minus size={16} />
                                </button>
                                <span className="w-10 text-center font-bold text-[#2B2B2B] text-base">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item, 1)}
                                  disabled={isUpdating}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-[#2B2B2B] transition-colors disabled:opacity-50"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>

                              {/* Rimuovi */}
                              <button
                                onClick={() => handleRemove(item._id)}
                                disabled={isUpdating}
                                className="flex items-center gap-1.5 font-semibold text-red-500 hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg"
                              >
                                <Trash2 size={16} />
                                <span className="hidden sm:inline">Rimuovi</span>
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Azioni Carrello */}
              <div className="flex justify-end">
                <button
                  onClick={handleClear}
                  className="text-sm font-semibold text-[#2B2B2B]/40 hover:text-red-500 transition-colors underline underline-offset-4"
                >
                  Svuota tutto il carrello
                </button>
              </div>
            </div>

            {/* Riepilogo Ordine */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="bg-white rounded-3xl shadow-sm border border-[#EDE7D6]/50 p-6 sm:p-8 sticky top-24">
                <h3 className="text-2xl font-black text-[#2B2B2B] mb-6">Riepilogo</h3>

                {/* Progress Bar Spedizione */}
                <div className="mb-6 bg-[#FAF3E0] p-4 rounded-2xl border border-[#EDE7D6]">
                  <div className="flex items-center gap-3 mb-2">
                    <Truck size={20} className={shippingCost === 0 ? 'text-[#228B22]' : 'text-[#556B2F]'} />
                    <span className="text-sm font-bold text-[#2B2B2B]">
                      {shippingCost === 0 
                        ? 'Spedizione gratuita sbloccata! 🎉' 
                        : `Mancano €${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} per la spedizione gratuita`}
                    </span>
                  </div>
                  {shippingCost > 0 && (
                    <div className="w-full bg-[#EDE7D6] rounded-full h-2 mt-3 overflow-hidden">
                      <div 
                        className="bg-[#228B22] h-2 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${shippingProgress}%` }} 
                      />
                    </div>
                  )}
                </div>

                {/* Dettagli Costi */}
                <div className="space-y-4 text-[15px] font-medium text-[#2B2B2B]/70">
                  <div className="flex justify-between items-center">
                    <span>Subtotale articoli</span>
                    <span className="text-[#2B2B2B] font-bold">€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Costi di spedizione</span>
                    <span className={shippingCost === 0 ? 'text-[#228B22] font-black' : 'text-[#2B2B2B] font-bold'}>
                      {shippingCost === 0 ? 'Gratis' : `€${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div className="h-px w-full bg-[#EDE7D6] my-4" />
                  
                  <div className="flex justify-between items-center text-xl">
                    <span className="font-bold text-[#2B2B2B]">Totale</span>
                    <span className="font-black text-[#228B22] text-2xl tracking-tight">€{total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-[#2B2B2B]/40 text-right mt-1">IVA inclusa, ove applicabile</p>
                </div>

                {/* CTA Pagamento */}
                <div className="mt-8">
                  {user ? (
                    <button
                      onClick={() => navigate('/store/checkout')}
                      className="w-full flex items-center justify-center gap-2 bg-[#228B22] text-white py-4 rounded-xl font-bold text-lg shadow-md shadow-[#228B22]/20 hover:bg-[#1a6b1a] hover:shadow-lg active:scale-95 transition-all"
                    >
                      Vai alla Cassa <ArrowRight size={20} />
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        to={`/login?redirect=/store/checkout`}
                        className="flex items-center justify-center w-full bg-[#228B22] text-white py-4 rounded-xl font-bold text-lg shadow-md shadow-[#228B22]/20 hover:bg-[#1a6b1a] hover:shadow-lg active:scale-95 transition-all"
                      >
                        Accedi e Paga
                      </Link>
                      <button
                        onClick={() => navigate('/store/checkout')}
                        className="w-full text-center bg-white border-2 border-[#EDE7D6] text-[#2B2B2B] py-3.5 rounded-xl font-bold hover:bg-[#FAF3E0] hover:border-[#228B22] hover:text-[#228B22] active:scale-95 transition-all"
                      >
                        Continua come ospite
                      </button>
                    </div>
                  )}
                </div>

                {/* Trust Badge */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-[#2B2B2B]/40">
                  <ShieldCheck size={16} /> Pagamenti sicuri e crittografati
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
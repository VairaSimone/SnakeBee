import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getKitById } from '../../services/storeApi';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, ArrowLeft, Tag, Check, Minus, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

const BACKEND = process.env.REACT_APP_BACKEND_URL_IMAGE || '';

const KitDetailPage = () => {
  const { id } = useParams();
  const [kit, setKit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getKitById(id);
        setKit(data);
      } catch {
        toast.error('Kit non trovato');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleAdd = async () => {
    try {
      setAdding(true);
      await addToCart(kit._id, quantity);
      toast.success(`${quantity}x "${kit.name}" aggiunto al carrello! 🛒`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Errore durante l\'aggiunta');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FAF3E0]">
        <div className="animate-spin h-12 w-12 border-4 border-[#228B22] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!kit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF3E0] gap-4">
        <p className="text-xl font-bold text-[#2B2B2B]/60">Kit non trovato</p>
        <Link to="/store" className="text-[#228B22] underline">← Torna allo store</Link>
      </div>
    );
  }

  const images = kit.images?.length > 0
    ? kit.images.map((img) => `${BACKEND}${img}`)
    : ['https://placehold.co/600x400/EDE7D6/556B2F?text=Kit'];

  const outOfStock = kit.quantity === 0;

  return (
    <div className="bg-[#FAF3E0] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <Link to="/store" className="inline-flex items-center gap-2 text-sm text-[#2B2B2B]/50 hover:text-[#228B22] transition mb-6">
          <ArrowLeft size={16} /> Torna allo store
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Galleria */}
          <div>
            <div className="rounded-2xl overflow-hidden bg-white shadow-lg aspect-square">
              <img
                src={images[activeImg]}
                alt={kit.name}
                onError={(e) => { e.target.src = 'https://placehold.co/600x400/EDE7D6/556B2F?text=Kit'; }}
                className="w-full h-full object-contain"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      i === activeImg ? 'border-[#228B22] shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dettagli */}
          <div className="flex flex-col gap-5">
            <div>
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 ${
                outOfStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800'
              }`}>
                {outOfStock ? 'Esaurito' : `Disponibile – ${kit.quantity} rimasti`}
              </span>
              <h1 className="text-3xl font-extrabold text-[#2B2B2B] leading-tight">{kit.name}</h1>
            </div>

            <div className="flex items-end gap-2">
              <span className="text-4xl font-extrabold text-[#228B22]">€{kit.price.toFixed(2)}</span>
              <span className="text-sm text-[#2B2B2B]/40 pb-1">IVA {kit.vatRate}% inclusa</span>
            </div>

            <p className="text-[#2B2B2B]/70 leading-relaxed">{kit.description}</p>

            {/* Prodotti inclusi */}
            {kit.includedProducts?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-[#2B2B2B] mb-3 flex items-center gap-2">
                  <Tag size={16} className="text-[#228B22]" /> Cosa include il kit
                </h3>
                <ul className="space-y-2">
                  {kit.includedProducts.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#2B2B2B]/80">
                      <Check size={16} className="text-[#228B22] mt-0.5 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantità + CTA */}
            {!outOfStock && (
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-0 bg-white rounded-xl shadow-sm border border-[#EDE7D6] overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-3 hover:bg-[#EDE7D6] transition text-[#2B2B2B]"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-5 py-3 font-bold text-[#2B2B2B] min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(kit.quantity, q + 1))}
                    className="px-4 py-3 hover:bg-[#EDE7D6] transition text-[#2B2B2B]"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={adding}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#228B22] text-white py-3 rounded-xl font-bold text-base hover:bg-[#556B2F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={20} />
                  {adding ? 'Aggiunta in corso…' : 'Aggiungi al carrello'}
                </button>
              </div>
            )}

            {/* Info spedizione */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-black">
              🚚 <strong>Spedizione standard 5,99€</strong> · Gratuita per ordini ≥ 60€ · Solo Italia
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitDetailPage;
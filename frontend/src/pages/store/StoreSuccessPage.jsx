import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getStoreSessionDetails } from '../../services/storeApi';
import { CheckCircle, Package, MapPin, ArrowRight, Loader } from 'lucide-react';

const BACKEND = process.env.REACT_APP_BACKEND_URL_IMAGE || '';

const StoreSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError('Sessione non trovata');
      setLoading(false);
      return;
    }
    const fetch = async () => {
      // Piccolo delay per dare tempo al webhook Stripe di completare
      await new Promise((r) => setTimeout(r, 2500));
      try {
        const { data } = await getStoreSessionDetails(sessionId);
        setOrder(data);
      } catch {
        setError('Impossibile recuperare i dettagli dell\'ordine.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF3E0] gap-4">
        <Loader size={48} className="text-[#228B22] animate-spin" />
        <p className="text-[#2B2B2B]/60 font-medium">Conferma ordine in corso…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF3E0] gap-4 text-center px-4">
        <Package size={56} className="text-[#228B22]/30" />
        <h1 className="text-2xl font-bold text-[#2B2B2B]">Pagamento ricevuto!</h1>
        <p className="text-[#2B2B2B]/50 max-w-md">
          Il tuo ordine è in elaborazione. Riceverai una email di conferma a breve.
          {error && <span className="block mt-2 text-sm text-red-400">{error}</span>}
        </p>
        <Link to="/store" className="mt-4 bg-[#228B22] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#556B2F] transition">
          Torna allo store
        </Link>
      </div>
    );
  }

  const { orderNumber, items, subtotal, shippingCost, total, shippingAddress, status } = order;

  return (
    <div className="bg-[#FAF3E0] min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header successo */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={44} className="text-[#228B22]" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-[#2B2B2B] mb-2">Ordine confermato!</h1>
          <p className="text-[#2B2B2B]/60">
            Grazie per il tuo acquisto. Riceverai un'email di conferma a breve.
          </p>
          <div className="inline-block mt-3 bg-[#228B22]/10 text-[#228B22] font-mono font-bold px-4 py-1.5 rounded-full text-sm">
            {orderNumber}
          </div>
        </div>

        {/* Dettaglio prodotti */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-bold text-[#2B2B2B] mb-4 flex items-center gap-2">
            <Package size={18} className="text-[#228B22]" /> Prodotti ordinati
          </h2>
          <div className="space-y-3">
            {items?.map((item, i) => {
              const imgSrc = item.kit?.images?.[0]
                ? `${BACKEND}${item.kit.images[0]}`
                : null;
              return (
                <div key={i} className="flex items-center gap-4">
                  {imgSrc && (
                    <img src={imgSrc} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-[#EDE7D6]" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-[#2B2B2B] text-sm">{item.name}</p>
                    <p className="text-xs text-[#2B2B2B]/40">Qtà: {item.quantity} × €{item.unitPrice?.toFixed(2)}</p>
                  </div>
                  <p className="font-bold text-[#228B22]">
                    €{(item.unitPrice * item.quantity).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Totali */}
          <div className="border-t border-[#EDE7D6] mt-5 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-[#2B2B2B]/60">
              <span>Subtotale</span>
              <span>€{subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#2B2B2B]/60">
              <span>Spedizione</span>
              <span>{shippingCost === 0 ? 'Gratuita' : `€${shippingCost?.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-extrabold text-[#2B2B2B] text-base pt-2 border-t border-[#EDE7D6]">
              <span>Totale pagato</span>
              <span>€{total?.toFixed(2)}</span>
            </div>
            <p className="text-xs text-[#2B2B2B]/30"></p>
          </div>
        </div>

        {/* Indirizzo spedizione */}
        {shippingAddress && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="font-bold text-[#2B2B2B] mb-3 flex items-center gap-2">
              <MapPin size={18} className="text-[#228B22]" /> Spedizione a
            </h2>
            <p className="text-[#2B2B2B]/80 text-sm leading-relaxed">
              <strong>{shippingAddress.fullName}</strong><br />
              {shippingAddress.address}<br />
              {shippingAddress.postalCode} {shippingAddress.city} ({shippingAddress.province})
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
              <Package size={12} /> Riceverai un tracking via email quando spediamo
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/store/orders"
            className="flex-1 text-center bg-[#228B22] text-white py-3 rounded-xl font-semibold hover:bg-[#556B2F] transition flex items-center justify-center gap-2"
          >
            I miei ordini <ArrowRight size={18} />
          </Link>
          <Link
            to="/store"
            className="flex-1 text-center border-2 border-[#228B22] text-[#228B22] py-3 rounded-xl font-semibold hover:bg-[#228B22]/5 transition"
          >
            Continua lo shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StoreSuccessPage;
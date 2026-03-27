import React, { useState, useEffect } from 'react';
import { getUserOrders, getOrderById } from '../../services/storeApi';
import { Package, ChevronDown, ChevronUp, MapPin, Truck } from 'lucide-react';
import { toast } from 'react-toastify';

const BACKEND = process.env.REACT_APP_BACKEND_URL_IMAGE || '';

const STATUS_CONFIG = {
  PENDING:   { label: 'In attesa',    color: 'bg-yellow-100 text-yellow-800' },
  PAID:      { label: 'Pagato',       color: 'bg-blue-100 text-blue-700' },
  SHIPPED:   { label: 'Spedito',      color: 'bg-purple-100 text-purple-700' },
  CANCELLED: { label: 'Annullato',    color: 'bg-red-100 text-red-700' },
};

const OrderCard = ({ order }) => {
  const [open, setOpen] = useState(false);
  const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 text-left hover:bg-[#FAF3E0] transition"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-[#228B22] text-sm">{order.orderNumber}</span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${s.color}`}>
              {s.label}
            </span>
          </div>
          <p className="text-xs text-[#2B2B2B]/40">
            {new Date(order.createdAt).toLocaleDateString('it-IT', {
              day: '2-digit', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-extrabold text-[#228B22] text-lg">€{order.total?.toFixed(2)}</span>
          {open ? <ChevronUp size={18} className="text-[#2B2B2B]/40" /> : <ChevronDown size={18} className="text-[#2B2B2B]/40" />}
        </div>
      </button>

      {/* Dettaglio espandibile */}
      {open && (
        <div className="border-t border-[#EDE7D6] p-5 space-y-5">
          {/* Prodotti */}
          <div>
            <h4 className="font-bold text-sm text-[#2B2B2B] mb-3 flex items-center gap-1.5">
              <Package size={15} className="text-[#228B22]" /> Prodotti
            </h4>
            <div className="space-y-3">
              {order.items?.map((item, i) => {
                const imgSrc = item.kit?.images?.[0] ? `${BACKEND}${item.kit.images[0]}` : null;
                return (
                  <div key={i} className="flex items-center gap-3">
                    {imgSrc && (
                      <img src={imgSrc} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-[#EDE7D6]" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#2B2B2B]">{item.name}</p>
                      <p className="text-xs text-[#2B2B2B]/40">Qtà: {item.quantity} × €{item.unitPrice?.toFixed(2)}</p>
                    </div>
                    <p className="font-bold text-sm text-[#228B22]">
                      €{(item.quantity * item.unitPrice).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totali */}
          <div className="bg-[#FAF3E0] rounded-xl p-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-[#2B2B2B]/60">
              <span>Subtotale</span><span>€{order.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#2B2B2B]/60">
              <span>Spedizione</span>
              <span>{order.shippingCost === 0 ? 'Gratuita' : `€${order.shippingCost?.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-[#2B2B2B] border-t border-[#EDE7D6] pt-2 mt-1">
              <span>Totale</span><span>€{order.total?.toFixed(2)}</span>
            </div>
          </div>

          {/* Indirizzo */}
          {order.shippingAddress && (
            <div>
              <h4 className="font-bold text-sm text-[#2B2B2B] mb-2 flex items-center gap-1.5">
                <MapPin size={15} className="text-[#228B22]" /> Consegnato a
              </h4>
              <p className="text-sm text-[#2B2B2B]/70 leading-relaxed">
                {order.shippingAddress.fullName}, {order.shippingAddress.address},&nbsp;
                {order.shippingAddress.postalCode} {order.shippingAddress.city}&nbsp;
                ({order.shippingAddress.province})
              </p>
            </div>
          )}

          {/* Tracking */}
          {order.trackingCode && (
            <div className="flex items-center gap-2 text-sm bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
              <Truck size={16} className="text-purple-600 flex-shrink-0" />
              <span className="text-purple-800">
                Codice tracking: <strong className="font-mono">{order.trackingCode}</strong>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await getUserOrders({ page, limit: 10 });
        setOrders(data.orders || []);
        setTotalPages(data.pages || 1);
      } catch {
        toast.error('Errore nel caricamento degli ordini');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [page]);

  return (
    <div className="bg-[#FAF3E0] min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-extrabold text-[#2B2B2B] mb-2">I miei ordini</h1>
        <p className="text-sm text-[#2B2B2B]/50 mb-8">Storico acquisti e dettaglio spedizioni</p>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin h-12 w-12 border-4 border-[#228B22] border-t-transparent rounded-full" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm">
            <Package size={56} className="text-[#228B22]/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#2B2B2B]/50">Nessun ordine ancora</h3>
            <a href="/store" className="mt-6 inline-block bg-[#228B22] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#556B2F] transition">
              Scopri i kit
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}

        {/* Paginazione */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-lg bg-white border border-[#EDE7D6] hover:bg-[#EDE7D6] disabled:opacity-30 transition">
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${p === page ? 'bg-[#228B22] text-white' : 'bg-white border border-[#EDE7D6] hover:bg-[#EDE7D6]'}`}>
                {p}
              </button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg bg-white border border-[#EDE7D6] hover:bg-[#EDE7D6] disabled:opacity-30 transition">
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
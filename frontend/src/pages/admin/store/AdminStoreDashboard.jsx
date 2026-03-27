import React, { useState, useEffect, useRef } from 'react';
import {
  getKitsAdmin, createKit, updateKit, deleteKit, toggleKitStatus,
  getAllOrders, updateOrderStatus, updateOrderTracking
} from '../../../services/storeApi';
import { toast } from 'react-toastify';
import {
  Package, Plus, Pencil, Trash2, Eye, EyeOff, Truck,
  ChevronDown, ChevronUp, ShoppingBag, X, Upload, Check
} from 'lucide-react';

const BACKEND = process.env.REACT_APP_BACKEND_URL_IMAGE || '';

const STATUS_CONFIG = {
  PENDING:   { label: 'In attesa',  color: 'bg-yellow-100 text-yellow-700' },
  PAID:      { label: 'Pagato',     color: 'bg-blue-100 text-blue-700' },
  SHIPPED:   { label: 'Spedito',    color: 'bg-purple-100 text-purple-700' },
  CANCELLED: { label: 'Annullato',  color: 'bg-red-100 text-red-700' },
};

// ─── Kit Form Modal ───────────────────────────────────────────────────────────
const KitModal = ({ kit, onClose, onSaved }) => {
  const isEdit = !!kit;
  const [form, setForm] = useState({
    name: kit?.name || '',
    description: kit?.description || '',
    price: kit?.price || '',
    quantity: kit?.quantity ?? '',
    active: kit?.active ?? true,
    vatRate: kit?.vatRate || 22,
    includedProducts: kit?.includedProducts?.join('\n') || '',
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState(kit?.images || []);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    const quantity = parseInt(form.quantity, 10);
    if (isNaN(price) || price < 0) return toast.error('Prezzo non valido');
    if (isNaN(quantity) || quantity < 0) return toast.error('Quantità non valida');

    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('description', form.description.trim());
    fd.append('price', price);
    fd.append('quantity', quantity);
    fd.append('active', form.active);
    fd.append('vatRate', form.vatRate);
    const products = form.includedProducts
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    fd.append('includedProducts', JSON.stringify(products));
    images.forEach((img) => fd.append('images', img));

    try {
      setSaving(true);
      if (isEdit) {
        await updateKit(kit._id, fd);
        toast.success('Kit aggiornato ✓');
      } else {
        await createKit(fd);
        toast.success('Kit creato ✓');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Errore salvataggio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-[#EDE7D6]">
          <h2 className="font-bold text-xl text-[#2B2B2B]">
            {isEdit ? 'Modifica Kit' : 'Nuovo Kit'}
          </h2>
          <button onClick={onClose} className="text-[#2B2B2B]/40 hover:text-[#2B2B2B]"><X size={22} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[#2B2B2B]/70 mb-1">Nome *</label>
              <input name="name" value={form.name} onChange={handleChange} required
                className="w-full border border-[#EDE7D6] rounded-xl px-4 py-2.5 bg-[#FAF3E0] focus:outline-none focus:ring-2 focus:ring-[#228B22] text-[#2B2B2B]" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[#2B2B2B]/70 mb-1">Descrizione *</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} required
                className="w-full border border-[#EDE7D6] rounded-xl px-4 py-2.5 bg-[#FAF3E0] focus:outline-none focus:ring-2 focus:ring-[#228B22] text-[#2B2B2B] resize-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2B2B2B]/70 mb-1">Prezzo (€) *</label>
              <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required
                className="w-full border border-[#EDE7D6] rounded-xl px-4 py-2.5 bg-[#FAF3E0] focus:outline-none focus:ring-2 focus:ring-[#228B22] text-[#2B2B2B]" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2B2B2B]/70 mb-1">Quantità *</label>
              <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} required
                className="w-full border border-[#EDE7D6] rounded-xl px-4 py-2.5 bg-[#FAF3E0] focus:outline-none focus:ring-2 focus:ring-[#228B22] text-[#2B2B2B]" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2B2B2B]/70 mb-1">IVA %</label>
              <input name="vatRate" type="number" value={form.vatRate} onChange={handleChange}
                className="w-full border border-[#EDE7D6] rounded-xl px-4 py-2.5 bg-[#FAF3E0] focus:outline-none focus:ring-2 focus:ring-[#228B22] text-[#2B2B2B]" />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <input type="checkbox" name="active" id="active" checked={form.active} onChange={handleChange}
                className="h-5 w-5 rounded border-[#EDE7D6] text-[#228B22] focus:ring-[#228B22]" />
              <label htmlFor="active" className="text-sm font-semibold text-[#2B2B2B]">Kit attivo (visibile nello store)</label>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[#2B2B2B]/70 mb-1">
                Prodotti inclusi (uno per riga)
              </label>
              <textarea name="includedProducts" value={form.includedProducts} onChange={handleChange} rows={4}
                placeholder="Igrometro&#10;Liana Reptizoo 200cm&#10;..."
                className="w-full border border-[#EDE7D6] rounded-xl px-4 py-2.5 bg-[#FAF3E0] focus:outline-none focus:ring-2 focus:ring-[#228B22] text-[#2B2B2B] resize-none text-sm" />
            </div>

            {/* Upload immagini */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[#2B2B2B]/70 mb-2">
                Immagini (max 5, sostituiscono quelle esistenti se caricate)
              </label>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 border-2 border-dashed border-[#228B22]/40 rounded-xl px-4 py-3 text-sm text-[#228B22] hover:border-[#228B22] hover:bg-[#228B22]/5 transition">
                <Upload size={16} /> Seleziona immagini
              </button>
              <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleFiles} className="hidden" />
              {previews.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {previews.map((src, i) => (
                    <img key={i}
                      src={src.startsWith('blob:') ? src : `${BACKEND}${src}`}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover border border-[#EDE7D6]" />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border-2 border-[#EDE7D6] text-[#2B2B2B]/60 py-2.5 rounded-xl font-semibold hover:bg-[#EDE7D6] transition">
              Annulla
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-[#228B22] text-white py-2.5 rounded-xl font-bold hover:bg-[#556B2F] transition disabled:opacity-50">
              {saving ? 'Salvataggio…' : isEdit ? 'Salva modifiche' : 'Crea kit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Order Row (admin) ────────────────────────────────────────────────────────
const AdminOrderRow = ({ order, onUpdated }) => {
  const [open, setOpen] = useState(false);
  const [trackingInput, setTrackingInput] = useState(order.trackingCode || '');
  const [statusVal, setStatusVal] = useState(order.status);
  const [saving, setSaving] = useState(false);

  const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;

  const handleStatusSave = async () => {
    try {
      setSaving(true);
      await updateOrderStatus(order._id, statusVal, trackingInput || undefined);
      toast.success('Ordine aggiornato');
      onUpdated();
    } catch {
      toast.error('Errore aggiornamento');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 hover:bg-[#FAF3E0] transition text-left"
      >
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-[#228B22] text-sm">{order.orderNumber}</span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
          </div>
          <p className="text-xs text-[#2B2B2B]/40">
            {order.user?.name || order.guestEmail || 'Guest'} · {new Date(order.createdAt).toLocaleDateString('it-IT')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-[#228B22]">€{order.total?.toFixed(2)}</span>
          {open ? <ChevronUp size={16} className="text-[#2B2B2B]/40" /> : <ChevronDown size={16} className="text-[#2B2B2B]/40" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-[#EDE7D6] p-4 space-y-4 bg-[#FAF3E0]">
          {/* Prodotti */}
          <div className="space-y-1 text-sm">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-[#2B2B2B]/70">{item.name} ×{item.quantity}</span>
                <span className="font-semibold text-[#2B2B2B]">€{(item.unitPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Indirizzo */}
          {order.shippingAddress && (
            <p className="text-xs text-[#2B2B2B]/50">
              📦 {order.shippingAddress.fullName}, {order.shippingAddress.address},&nbsp;
              {order.shippingAddress.postalCode} {order.shippingAddress.city} ({order.shippingAddress.province})
            </p>
          )}

          {/* Controlli admin */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#2B2B2B]/60 mb-1">Stato</label>
              <select value={statusVal} onChange={(e) => setStatusVal(e.target.value)}
                className="w-full border border-[#EDE7D6] rounded-lg px-3 py-2 text-sm bg-white text-[#2B2B2B] focus:outline-none focus:ring-2 focus:ring-[#228B22]">
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#2B2B2B]/60 mb-1">Tracking code</label>
              <input value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="es. GD123456789IT"
                className="w-full border border-[#EDE7D6] rounded-lg px-3 py-2 text-sm bg-white text-[#2B2B2B] focus:outline-none focus:ring-2 focus:ring-[#228B22]" />
            </div>
            <div className="flex items-end">
              <button onClick={handleStatusSave} disabled={saving}
                className="w-full flex items-center justify-center gap-1.5 bg-[#228B22] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#556B2F] transition disabled:opacity-50">
                <Check size={14} /> {saving ? '…' : 'Salva'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const AdminStoreDashboard = () => {
  const [tab, setTab] = useState('kits');
  const [kits, setKits] = useState([]);
  const [kitsLoading, setKitsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [modalKit, setModalKit] = useState(undefined); // undefined = chiuso, null = nuovo, kit = edit
  const [deletingId, setDeletingId] = useState(null);

  const fetchKits = async () => {
    try {
      setKitsLoading(true);
      const { data } = await getKitsAdmin();
      setKits(data.kits || []);
    } catch { toast.error('Errore caricamento kit'); }
    finally { setKitsLoading(false); }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const params = { limit: 50 };
      if (orderStatusFilter) params.status = orderStatusFilter;
      const { data } = await getAllOrders(params);
      setOrders(data.orders || []);
    } catch { toast.error('Errore caricamento ordini'); }
    finally { setOrdersLoading(false); }
  };

  useEffect(() => { fetchKits(); }, []);
  useEffect(() => { fetchOrders(); }, [orderStatusFilter]);

  const handleToggle = async (id) => {
    await toggleKitStatus(id);
    fetchKits();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Eliminare "${name}"? L'operazione è irreversibile.`)) return;
    try {
      setDeletingId(id);
      await deleteKit(id);
      toast.success('Kit eliminato');
      fetchKits();
    } catch { toast.error('Errore eliminazione'); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="bg-[#FAF3E0] min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-extrabold text-[#2B2B2B] mb-6">
          🛒 Admin Store
        </h1>

        {/* Tabs */}
        <div className="flex border-b border-[#EDE7D6] mb-8">
          {[
            { key: 'kits', label: 'Kit', icon: <Package size={16} /> },
            { key: 'orders', label: 'Ordini', icon: <ShoppingBag size={16} /> },
          ].map(({ key, label, icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 py-3 px-6 font-semibold transition-all ${
                tab === key
                  ? 'border-b-2 border-[#228B22] text-[#228B22]'
                  : 'text-[#2B2B2B]/50 hover:text-[#2B2B2B]'
              }`}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* ── TAB KIT ── */}
        {tab === 'kits' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-[#2B2B2B]/50">{kits.length} kit totali</p>
              <button onClick={() => setModalKit(null)}
                className="flex items-center gap-2 bg-[#228B22] text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-[#556B2F] transition">
                <Plus size={18} /> Nuovo kit
              </button>
            </div>

            {kitsLoading ? (
              <div className="flex justify-center py-16"><div className="animate-spin h-10 w-10 border-4 border-[#228B22] border-t-transparent rounded-full" /></div>
            ) : (
              <div className="space-y-3">
                {kits.map((kit) => {
                  const img = kit.images?.[0] ? `${BACKEND}${kit.images[0]}` : null;
                  return (
                    <div key={kit._id}
                      className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
                      {img
                        ? <img src={img} alt={kit.name} className="w-16 h-16 rounded-xl object-cover bg-[#EDE7D6] flex-shrink-0" />
                        : <div className="w-16 h-16 rounded-xl bg-[#EDE7D6] flex-shrink-0 flex items-center justify-center"><Package size={24} className="text-[#228B22]/30" /></div>
                      }

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#2B2B2B] truncate">{kit.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="font-semibold text-[#228B22] text-sm">€{kit.price.toFixed(2)}</span>
                          <span className="text-xs text-[#2B2B2B]/40">·</span>
                          <span className="text-xs text-[#2B2B2B]/50">Qtà: {kit.quantity}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${kit.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {kit.active ? 'Attivo' : 'Inattivo'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => handleToggle(kit._id)}
                          title={kit.active ? 'Disattiva' : 'Attiva'}
                          className="p-2 rounded-lg text-[#2B2B2B]/40 hover:text-[#228B22] hover:bg-[#228B22]/10 transition">
                          {kit.active ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button onClick={() => setModalKit(kit)} title="Modifica"
                          className="p-2 rounded-lg text-[#2B2B2B]/40 hover:text-blue-600 hover:bg-blue-50 transition">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(kit._id, kit.name)} disabled={deletingId === kit._id}
                          title="Elimina"
                          className="p-2 rounded-lg text-[#2B2B2B]/40 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-30">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── TAB ORDINI ── */}
        {tab === 'orders' && (
          <>
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <label className="text-sm font-semibold text-[#2B2B2B]/60">Filtra per stato:</label>
              <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="border border-[#EDE7D6] rounded-xl px-4 py-2 text-sm bg-white text-[#2B2B2B] focus:outline-none focus:ring-2 focus:ring-[#228B22]">
                <option value="">Tutti</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <span className="text-sm text-[#2B2B2B]/40">{orders.length} ordini</span>
            </div>

            {ordersLoading ? (
              <div className="flex justify-center py-16"><div className="animate-spin h-10 w-10 border-4 border-[#228B22] border-t-transparent rounded-full" /></div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <ShoppingBag size={48} className="text-[#228B22]/20 mx-auto mb-3" />
                <p className="text-[#2B2B2B]/40 font-medium">Nessun ordine trovato</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <AdminOrderRow key={order._id} order={order} onUpdated={fetchOrders} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal kit */}
      {modalKit !== undefined && (
        <KitModal
          kit={modalKit}
          onClose={() => setModalKit(undefined)}
          onSaved={fetchKits}
        />
      )}
    </div>
  );
};

export default AdminStoreDashboard;
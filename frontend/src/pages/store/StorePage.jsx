import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getKits } from '../../services/storeApi';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Search, Package, Tag, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import CartBadge from '../../components/store/CartBadge';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BACKEND = process.env.REACT_APP_BACKEND_URL_IMAGE || '';

const KitCard = ({ kit, onAddToCart, adding }) => {
  const mainImg = kit.images?.[0]
    ? `${BACKEND}${kit.images[0]}`
    : 'https://placehold.co/400x300/EDE7D6/556B2F?text=Kit';

  const isAdding = adding === kit._id;
  const isOutOfStock = kit.quantity === 0;

  return (
    <div className="bg-white rounded-3xl shadow-sm hover:shadow-2xl border border-[#EDE7D6]/60 overflow-hidden flex flex-col group transition-all duration-300 transform hover:-translate-y-2 h-full">
      
      {/* Immagine con Badge Sovrapposto */}
      <Link to={`/store/kits/${kit._id}`} className="block relative overflow-hidden aspect-[4/3] bg-[#FAF3E0]">
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 z-10" />
        <img
          src={mainImg}
          alt={kit.name}
          onError={(e) => { e.target.src = 'https://placehold.co/400x300/EDE7D6/556B2F?text=Kit'; }}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Badge Disponibilità */}
        <div className="absolute top-4 left-4 z-20">
          <span className={`inline-flex items-center text-xs font-black px-3 py-1.5 rounded-full shadow-sm ${
            !isOutOfStock
              ? 'bg-white/95 text-[#228B22] backdrop-blur-sm'
              : 'bg-red-500/95 text-white backdrop-blur-sm'
          }`}>
            {!isOutOfStock ? `${kit.quantity} Disp.` : 'Esaurito'}
          </span>
        </div>
      </Link>

      {/* Corpo della Card */}
      <div className="p-6 flex flex-col flex-1">
        <Link to={`/store/kits/${kit._id}`} className="no-underline group">
          <h3 className="font-extrabold text-[#2B2B2B] text-xl leading-snug mb-2 group-hover:text-[#228B22] transition-colors line-clamp-2">
            {kit.name}
          </h3>
        </Link>
        
        <p className="text-sm text-[#2B2B2B]/60 line-clamp-2 mb-5 leading-relaxed flex-1">
          {kit.description}
        </p>

        {/* Prodotti Inclusi (Tags) */}
        {kit.includedProducts?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {kit.includedProducts.slice(0, 3).map((p, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-[#FAF3E0] border border-[#EDE7D6]/50 text-[#556B2F] px-2.5 py-1.5 rounded-lg">
                <Tag size={12} className="opacity-70" /> 
                {p.length > 20 ? p.slice(0, 18) + '…' : p}
              </span>
            ))}
            {kit.includedProducts.length > 3 && (
              <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-[#2B2B2B]/40 px-1 py-1.5">
                +{kit.includedProducts.length - 3} altri
              </span>
            )}
          </div>
        )}

        {/* Footer: Prezzo e Bottone */}
        <div className="pt-5 border-t border-[#EDE7D6]/60 flex items-center justify-between gap-3 mt-auto">
          <div>
            <p className="text-2xl font-black text-[#228B22] tracking-tight">€{kit.price.toFixed(2)}</p>
            <p className="text-[10px] font-bold text-[#2B2B2B]/40 mt-0.5 uppercase tracking-wider">IVA inc.</p>
          </div>
          
          <button
            onClick={() => onAddToCart(kit._id)}
            disabled={isOutOfStock || isAdding}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
              isOutOfStock 
                ? 'bg-[#EDE7D6] text-[#2B2B2B]/40 cursor-not-allowed'
                : isAdding
                  ? 'bg-[#1a6b1a] text-white cursor-wait'
                  : 'bg-[#228B22] text-white shadow-lg shadow-[#228B22]/20 hover:bg-[#1a6b1a] hover:shadow-xl'
            }`}
          >
            {isAdding ? (
              /* Spinner animato CSS puro */
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ShoppingCart size={18} />
            )}
            <span className="hidden sm:inline-block">
              {isAdding ? 'Aggiungo...' : isOutOfStock ? 'Finito' : 'Aggiungi'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
// ─── Page ─────────────────────────────────────────────────────────────────────

const StorePage = () => {
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [adding, setAdding] = useState(null);

  const { addToCart, cartCount } = useCart();

  // Debounce ricerca
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchKits = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (debouncedSearch) params.q = debouncedSearch;
      const { data } = await getKits(params);
      setKits(data.kits || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch {
      toast.error('Errore nel caricamento dei kit');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchKits();
  }, [fetchKits]);

  // Reset pagina quando cambia la ricerca
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleAddToCart = async (kitId) => {
    try {
      setAdding(kitId);
      await addToCart(kitId, 1);
      toast.success('Aggiunto al carrello! 🛒');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Errore nell\'aggiunta al carrello');
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="bg-[#FAF3E0] min-h-screen relative font-sans">
      
      {/* Carrello Fluttuante */}
      <div className="fixed bottom-6 right-6 z-50 transition-transform duration-300 hover:scale-110 drop-shadow-2xl">
        <CartBadge />
      </div>

      {/* Hero Section Premium */}
      <div className="relative bg-[#228B22] overflow-hidden">
        {/* Sfondo sfumato e decorazioni */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#228B22] to-[#165a16] opacity-95" />
        <div className="absolute top-0 left-10 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-[#556B2F] opacity-40 rounded-full blur-3xl translate-y-1/3" />
        
        <div className="relative max-w-4xl mx-auto pt-20 pb-28 px-6 text-center z-10">
          <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm mb-6 border border-white/20 shadow-xl">
            <Package size={44} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight drop-shadow-sm">
            Kit per Rettili
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium leading-relaxed">
            Kit completi selezionati per te — tutto ciò che serve per il tuo terrario, in un unico e comodo acquisto.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        
        {/* Barra ricerca + contatore (sovrapposta alla hero) */}
{/* Trova questa sezione in StorePage.js e modificala così */}
<div className="relative z-20 flex flex-col sm:flex-row gap-4 items-center justify-between -mt-10 mb-12">
  <div className="relative w-full max-w-lg shadow-xl shadow-[#2B2B2B]/5 rounded-2xl">
    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2B2B2B]/40" />
    <input
      type="text"
      placeholder="Cerca il kit perfetto..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 ring-1 ring-[#EDE7D6] bg-white focus:outline-none focus:ring-2 focus:ring-[#228B22] text-[#2B2B2B] placeholder-[#2B2B2B]/40 font-medium transition-shadow"
    />
  </div>

  <div className="flex items-center gap-3"> {/* Contenitore per badge e carrello */}
    <div className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-xl shadow-sm border border-[#EDE7D6]">
      <p className="text-sm font-bold text-[#2B2B2B]/70 shrink-0">
        {loading ? 'Caricamento...' : `${total} kit disponibili`}
      </p>
    </div>
    
{/* NUOVO TASTO CARRELLO VISIBILE */}
<Link to="/store/cart" className="bg-[#228B22] text-white p-4 rounded-xl shadow-lg hover:bg-[#1a6b1a] transition-all flex items-center gap-2">
  <div className="relative">
    <ShoppingCart size={24} />
    
    {/* Badge visibile solo se c'è almeno 1 elemento */}
    {cartCount > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#228B22] shadow-sm">
        {cartCount > 99 ? '99+' : cartCount}
      </span>
    )}
  </div>
  
  <span className="font-bold hidden md:block">Il mio Carrello</span>
</Link>
  </div>
</div>
        {/* Griglia */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="animate-spin h-14 w-14 border-4 border-[#EDE7D6] border-t-[#228B22] rounded-full mb-4" />
            <p className="text-[#2B2B2B]/50 font-medium">Ricerca in corso...</p>
          </div>
        ) : kits.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-[#EDE7D6]/50 max-w-2xl mx-auto">
            <div className="inline-flex p-5 bg-[#FAF3E0] rounded-full mb-4">
              <AlertCircle size={48} className="text-[#556B2F]" />
            </div>
            <h3 className="text-2xl font-black text-[#2B2B2B] mb-2">Nessun kit trovato</h3>
            <p className="text-[#2B2B2B]/60 mb-6">Prova a cercare usando termini diversi.</p>
            {search && (
              <button 
                onClick={() => setSearch('')} 
                className="px-6 py-2 bg-[#EDE7D6] hover:bg-[#e4dbca] text-[#2B2B2B] font-bold rounded-lg transition-colors"
              >
                Resetta la ricerca
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {kits.map((kit) => (
              <KitCard key={kit._id} kit={kit} onAddToCart={handleAddToCart} adding={adding} />
            ))}
          </div>
        )}

        {/* Paginazione */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-16">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-[#EDE7D6] text-[#2B2B2B]/70 hover:bg-[#EDE7D6] hover:text-[#2B2B2B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold transition-all shadow-sm ${
                  p === page
                    ? 'bg-[#228B22] text-white ring-2 ring-[#228B22] ring-offset-2 ring-offset-[#FAF3E0]'
                    : 'bg-white border border-[#EDE7D6] text-[#2B2B2B]/70 hover:bg-[#EDE7D6] hover:text-[#2B2B2B]'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-[#EDE7D6] text-[#2B2B2B]/70 hover:bg-[#EDE7D6] hover:text-[#2B2B2B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorePage;
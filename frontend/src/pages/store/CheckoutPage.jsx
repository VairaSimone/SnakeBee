import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';
import { createStoreCheckout } from '../../services/storeApi';
import { MapPin, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';

const FREE_THRESHOLD = 60;
const SHIPPING = 5.99;

const InputField = ({ label, id, required, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-[#2B2B2B]/70 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={id}
      required={required}
      {...props}
      className="w-full border border-[#EDE7D6] rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#228B22] text-[#2B2B2B] transition"
    />
  </div>
);

const CheckoutPage = () => {
  const { cart, fetchCart } = useCart();
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: user?.name || '',
    address: user?.address || '',
    city: '',
    postalCode: '',
    province: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect se carrello vuoto
  useEffect(() => {
    if (!cart.items?.length && !loading) {
      navigate('/store/cart');
    }
  }, [cart.items, loading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Nome richiesto';
    if (!form.address.trim()) newErrors.address = 'Indirizzo richiesto';
    if (!form.city.trim()) newErrors.city = 'Città richiesta';
    if (!/^\d{5}$/.test(form.postalCode.trim())) newErrors.postalCode = 'CAP non valido (5 cifre)';
    if (!form.province.trim() || form.province.trim().length < 2) newErrors.province = 'Provincia richiesta (es. MI)';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    try {
      setLoading(true);
      const shippingAddress = {
        fullName: form.fullName.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        postalCode: form.postalCode.trim(),
        province: form.province.trim().toUpperCase(),
        country: 'IT',
      };
      const { data } = await createStoreCheckout(shippingAddress);
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Errore durante il checkout');
      setLoading(false);
    }
  };

  const subtotal = cart.subtotal || 0;
  const shippingCost = subtotal >= FREE_THRESHOLD ? 0 : SHIPPING;
  const total = subtotal + shippingCost;

  return (
    <div className="bg-[#FAF3E0] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-extrabold text-[#2B2B2B] mb-2">Checkout</h1>
        <p className="text-sm text-[#2B2B2B]/50 mb-8">Inserisci i dati di spedizione per completare l'ordine</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-lg text-[#2B2B2B] flex items-center gap-2">
                <MapPin size={20} className="text-[#228B22]" /> Indirizzo di spedizione
              </h2>

              <InputField
                label="Nome e cognome"
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Mario Rossi"
                required
              />
              {errors.fullName && <p className="text-xs text-red-500 -mt-3">{errors.fullName}</p>}

              <InputField
                label="Indirizzo"
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Via Roma 1, Interno 3"
                required
              />
              {errors.address && <p className="text-xs text-red-500 -mt-3">{errors.address}</p>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <InputField
                    label="Città"
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Milano"
                    required
                  />
                  {errors.city && <p className="text-xs text-red-500 mt-0.5">{errors.city}</p>}
                </div>
                <div>
                  <InputField
                    label="CAP"
                    id="postalCode"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    placeholder="20100"
                    maxLength={5}
                    required
                  />
                  {errors.postalCode && <p className="text-xs text-red-500 mt-0.5">{errors.postalCode}</p>}
                </div>
              </div>

              <InputField
                label="Provincia (sigla)"
                id="province"
                name="province"
                value={form.province}
                onChange={handleChange}
                placeholder="MI"
                maxLength={4}
                required
              />
              {errors.province && <p className="text-xs text-red-500 -mt-3">{errors.province}</p>}

              {/* Note legali */}
              <div className="bg-[#FAF3E0] rounded-xl p-4 space-y-2 text-xs text-[#2B2B2B]/50">
                <p className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#228B22]" /> Pagamento sicuro tramite Stripe</p>
                <p className="flex items-center gap-1.5"><Truck size={14} className="text-[#228B22]" /> Spedizione solo in Italia (5,99€ · gratuita ≥60€)</p>
                <p>Completando l'ordine accetti la nostra <a href="/it/privacyPolicy" className="underline text-[#228B22]">Privacy Policy</a>.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#228B22] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#556B2F] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <CreditCard size={22} />
                {loading ? 'Reindirizzamento a Stripe…' : `Paga €${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Riepilogo ordine */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h3 className="font-bold text-[#2B2B2B] mb-4">Il tuo ordine</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cart.items?.map((item) => (
                  <div key={item._id} className="flex justify-between gap-2 text-sm">
                    <span className="text-[#2B2B2B]/80 truncate flex-1">
                      {item.kit?.name || 'Kit'} <span className="text-[#2B2B2B]/40">×{item.quantity}</span>
                    </span>
                    <span className="font-semibold text-[#2B2B2B] shrink-0">
                      €{item.lineTotal?.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#EDE7D6] mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-[#2B2B2B]/60">
                  <span>Subtotale</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#2B2B2B]/60">
                  <span>Spedizione</span>
                  <span className={shippingCost === 0 ? 'text-[#228B22] font-semibold' : ''}>
                    {shippingCost === 0 ? 'Gratuita' : `€${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between font-extrabold text-[#2B2B2B] text-base pt-2 border-t border-[#EDE7D6]">
                  <span>Totale</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-[#2B2B2B]/30"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
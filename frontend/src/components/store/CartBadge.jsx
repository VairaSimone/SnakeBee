import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const CartBadge = ({ mobile = false }) => {
  const { cartCount } = useCart();

  return (
    <Link
      to="/store/cart"
      className={`relative flex items-center gap-2 transition-colors hover:text-[#228B22] ${mobile ? 'px-4 py-2' : ''}`}
      aria-label="Carrello"
    >
      <ShoppingCart size={22} />
      {cartCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-[#FAF3E0]">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
      {mobile && <span className="font-medium">Carrello</span>}
    </Link>
  );
};

export default CartBadge;
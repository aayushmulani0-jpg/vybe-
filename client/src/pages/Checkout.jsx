import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { API_URL } from '../config';
import Button from '../components/ui/Button';
import { useUIStore } from '../store/useUIStore';
import AnimatedSection from '../components/ui/AnimatedSection';
import { FiCheck, FiEdit2, FiPlus, FiMapPin, FiPhone } from 'react-icons/fi';

export default function Checkout() {
  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);
  const { items, getCartTotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const { alert } = useUIStore();

  // Redirect if not logged in
  if (!user || !token) {
    return <Navigate to="/login" state={{ from: '/checkout' }} replace />;
  }

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [addressForm, setAddressForm] = useState({ _id: '', address: '', city: '', state: '', zipCode: '', phone: '' });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Order State
  const [pricingRules, setPricingRules] = useState([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    if (user && token) {
      fetchAddresses();
      fetchGlobalPricing();
    }
  }, [user, token]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);

        if (data.length > 0) {
          // If we don't have one selected, pick the default or the first one
          if (!selectedAddressId || !data.find(a => a._id === selectedAddressId)) {
            const defaultAddr = data.find(a => a.isDefault) || data[0];
            setSelectedAddressId(defaultAddr._id);
          }
          setIsEditing(false);
        } else {
          // No addresses, force them to add one
          setIsEditing(true);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGlobalPricing = async () => {
    try {
      const res = await fetch(`${API_URL}/pricing`);
      if (res.ok) {
        const data = await res.json();
        setPricingRules(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNew = () => {
    setAddressForm({ _id: '', address: '', city: '', state: '', zipCode: '', phone: '' });
    setIsEditing(true);
  };

  const handleEdit = (addr) => {
    setAddressForm({ _id: addr._id, address: addr.street || '', city: addr.city || '', state: addr.state || '', zipCode: addr.zipCode || '', phone: addr.phone || '' });
    setIsEditing(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.address.trim() || !addressForm.city.trim() || !addressForm.state.trim() || !addressForm.zipCode.trim() || !addressForm.phone.trim()) {
      alert("Please fill in all address fields.", "error", "Missing Details");
      return;
    }

    setIsSavingAddress(true);
    try {
      const url = addressForm._id
        ? `${API_URL}/auth/me/addresses/${addressForm._id}`
        : `${API_URL}/auth/me/addresses`;
      const method = addressForm._id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          street: addressForm.address,
          city: addressForm.city,
          state: addressForm.state,
          zipCode: addressForm.zipCode,
          phone: addressForm.phone,
          isDefault: addresses.length === 0
        })
      });

      if (!res.ok) {
        if (res.status === 401) {
          alert("Your session has expired. Please log in again.", "error", "Session Expired");
          useAuthStore.getState().logout();
          navigate('/login');
          return;
        }
        const errText = await res.text();
        throw new Error(`Failed to save address: ${errText}`);
      }

      const updatedAddresses = await res.json();
      setAddresses(updatedAddresses);

      if (method === 'POST') {
        setSelectedAddressId(updatedAddresses[updatedAddresses.length - 1]._id);
      } else {
        setSelectedAddressId(addressForm._id);
      }

      setIsEditing(false);
      alert("Address saved successfully!", "success", "Saved");
    } catch (err) {
      console.error(err);
      alert("Error saving address: " + (err.message || 'Unknown error'), "error", "Error");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (isEditing) {
      alert("Please save your address first before placing the order.", "error", "Save Address");
      return;
    }
    if (!selectedAddressId) {
      alert("Please select a delivery address.", "error", "Select Address");
      return;
    }

    const selectedAddress = addresses.find(a => a._id === selectedAddressId);
    if (!selectedAddress) return;

    setIsPlacingOrder(true);

    try {
      const fullAddress = selectedAddress.street;
      const orderPhone = selectedAddress.phone;

      // Group items by orderType
      const retailItems = items.filter(i => i.orderType === 'Retail' || !i.orderType);
      const wholesaleItems = items.filter(i => i.orderType === 'Wholesale');
      const customItems = items.filter(i => i.orderType === 'CustomPrint');

      const orderPromises = [];

      // Retail order
      if (retailItems.length > 0) {
        orderPromises.push(
          fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              orderType: 'Retail',
              customer: user.name,
              email: user.email,
              phone: orderPhone,
              shippingAddress: fullAddress,
              paymentMethod: 'Cash on Delivery',
              itemsList: retailItems.map(item => ({
                name: item.name,
                qty: item.quantity,
                price: item.price || item.pricePerPiece,
                image: item.image || '',
                selectedSize: item.selectedSize,
                selectedColor: item.selectedColor
              }))
            })
          })
        );
      }

      // Wholesale order
      if (wholesaleItems.length > 0) {
        orderPromises.push(
          fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              orderType: 'Wholesale',
              customer: user.name,
              email: user.email,
              phone: orderPhone,
              shippingAddress: fullAddress,
              paymentMethod: 'Cash on Delivery',
              itemsList: wholesaleItems.map(item => ({
                productId: item.productId || item.id || item._id,
                name: item.name,
                qty: item.quantity,
                price: item.price || item.pricePerPiece,
                image: item.image || '',
                selectedPrints: item.selectedPrints || [],
                uploadedImages: item.uploadedImages || null,
                selectedSize: item.selectedSize,
                selectedColor: item.selectedColor
              }))
            })
          })
        );
      }

      // Custom Print order
      if (customItems.length > 0) {
        orderPromises.push(
          fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              orderType: 'CustomPrint',
              customer: user.name,
              email: user.email,
              phone: orderPhone,
              shippingAddress: fullAddress,
              paymentMethod: 'Cash on Delivery',
              itemsList: customItems.map(item => ({
                name: item.name,
                qty: item.quantity,
                price: item.price || item.pricePerPiece,
                image: item.image || (item.uploadedImages && Object.values(item.uploadedImages)[0]) || '',
                uploadedImages: item.uploadedImages || null,
                selectedPrints: item.selectedPrints || [],
                selectedSize: item.selectedSize,
                selectedColor: item.selectedColor,
                selectedColorHex: item.selectedColorHex,
                printingInstructions: item.printingInstructions
              }))
            })
          })
        );
      }

      const results = await Promise.all(orderPromises);
      const allOk = results.every(r => r.ok);

      if (allOk) {
        const createdOrders = await Promise.all(results.map(r => r.json()));
        const finalOrders = createdOrders.map(data => data.order || data);
        clearCart();
        navigate('/order-success', { state: { orders: finalOrders } });
      } else {
        const failed = results.find(r => !r.ok);
        const errData = await failed.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to place order');
      }
    } catch (err) {
      console.error(err);
      alert("Error placing order: " + (err.message || 'Unknown error'), "error", "Error");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 px-4 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4 text-white">Your Cart is Empty</h2>
        <Button onClick={() => navigate('/shop')}>Go Shopping</Button>
      </div>
    );
  }

  const subtotal = getCartTotal();
  let total = subtotal;

  const applicableRules = pricingRules.filter(rule => !rule.minSubtotal || subtotal >= rule.minSubtotal);

  applicableRules.forEach(rule => {
    let computedValue = rule.value;
    if (rule.type === 'percentage') {
      computedValue = (subtotal * rule.value) / 100;
    }

    if (rule.action === 'subtract') {
      total -= computedValue;
    } else {
      total += computedValue;
    }
  });

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 bg-primary relative overflow-hidden">
      <div className="gradient-orb gradient-orb-accent w-[300px] h-[300px] -top-20 -right-20 animate-float" />
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">

        <AnimatedSection direction="left">
          <h2 className="text-3xl font-heading font-bold text-secondary uppercase tracking-wider mb-8">Checkout</h2>

          <div className="glass-card p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-6">Delivery Details</h3>

            <AnimatePresence mode="wait">
              {!isEditing && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`relative p-5 rounded-xl border transition-all cursor-pointer flex gap-4 ${selectedAddressId === addr._id
                        ? 'bg-accent/10 border-accent'
                        : 'bg-neutral-900 border-white/10 hover:border-white/30'
                        }`}
                    >
                      <div className="pt-1">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedAddressId === addr._id ? 'border-accent' : 'border-gray-500'
                          }`}>
                          {selectedAddressId === addr._id && <div className="w-2.5 h-2.5 bg-accent rounded-full" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FiMapPin className={selectedAddressId === addr._id ? 'text-accent' : 'text-gray-400'} />
                          <span className="font-semibold text-white">{addr.label || 'Home'}</span>
                          {addr.isDefault && (
                            <span className="text-[10px] uppercase tracking-wider bg-white/10 text-gray-300 px-2 py-0.5 rounded-full ml-2">Default</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 mb-1 leading-relaxed">{addr.street}</p>
                        {(addr.city && addr.city !== '-') && (
                          <p className="text-xs text-gray-400 mb-2">{addr.city}{addr.state && addr.state !== '-' ? `, ${addr.state}` : ''}{addr.zipCode && addr.zipCode !== '-' ? ` - ${addr.zipCode}` : ''}</p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <FiPhone className="w-3.5 h-3.5" />
                          <span>{addr.phone}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(addr); }}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        title="Edit Address"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={handleAddNew}
                    className="w-full py-4 mt-4 border-2 border-dashed border-white/20 rounded-xl text-gray-300 hover:text-white hover:border-white/50 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                  >
                    <FiPlus /> Add New Address
                  </button>
                </motion.div>
              )}

              {/* FORM MODE */}
              {isEditing && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <form onSubmit={handleSaveAddress} className="space-y-5 bg-neutral-900/50 p-5 rounded-xl border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-white font-medium">{addressForm._id ? 'Edit Address' : 'New Address'}</h4>
                      {addresses.length > 0 && (
                        <button type="button" onClick={() => setIsEditing(false)} className="text-sm text-gray-400 hover:text-white">
                          Cancel
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Street Address</label>
                      <textarea
                        required
                        placeholder="House no, Building, Street, Area..."
                        value={addressForm.address}
                        onChange={e => setAddressForm({ ...addressForm, address: e.target.value })}
                        rows={2}
                        className="w-full bg-neutral-900 border border-white/20 rounded-md p-3 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none custom-scrollbar resize-none transition-all text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">City</label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. Mumbai"
                          value={addressForm.city}
                          onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="w-full bg-neutral-900 border border-white/20 rounded-md p-3 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">State</label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. Maharashtra"
                          value={addressForm.state}
                          onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                          className="w-full bg-neutral-900 border border-white/20 rounded-md p-3 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">PIN Code</label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. 400001"
                          value={addressForm.zipCode}
                          onChange={e => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                          className="w-full bg-neutral-900 border border-white/20 rounded-md p-3 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Mobile Number</label>
                        <input
                          required
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={addressForm.phone}
                          onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                          className="w-full bg-neutral-900 border border-white/20 rounded-md p-3 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="accent"
                        className="w-full py-3"
                        disabled={isSavingAddress}
                      >
                        {isSavingAddress ? 'Saving...' : 'Save Address'}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </AnimatedSection>

        {/* Right Column: Order Summary */}
        <AnimatedSection direction="right" delay={0.15}>
          <div className="glass-card p-6 sticky top-32">
            <h3 className="text-xl font-semibold text-white mb-6">Order Summary</h3>

            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
              {items.map(item => (
                <div key={item.cartId} className="flex justify-between items-center bg-neutral-950 p-3 rounded-md border border-white/5">
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 bg-neutral-900 rounded overflow-hidden">
                      <img src={item.image || 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400'} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-white">₹{(item.price || item.pricePerPiece) * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {applicableRules.map((rule, idx) => {
                let computedValue = rule.value;
                if (rule.type === 'percentage') {
                  computedValue = (subtotal * rule.value) / 100;
                }

                return (
                  <div key={rule._id || idx} className={`flex justify-between ${rule.action === 'subtract' ? 'text-accent font-medium' : 'text-gray-400'}`}>
                    <span>{rule.name} {rule.type === 'percentage' && `(${rule.value}%)`}</span>
                    <span>{rule.action === 'subtract' ? '-' : '+'}₹{computedValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                  </div>
                );
              })}
              <div className="flex justify-between text-xl font-bold text-accent pt-3 border-t border-white/10">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            <Button
              variant={isEditing ? 'outline' : 'accent'}
              className={`w-full mt-6 py-4 text-lg uppercase tracking-wide font-bold ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || isEditing}
            >
              {isPlacingOrder ? 'Processing...' : (isEditing ? 'Save Address to Proceed' : 'Place Order')}
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { API_URL } from '../config';
import Button from '../components/ui/Button';

export default function Checkout() {
  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);
  const { items, getCartTotal, clearCart } = useCartStore();
  const navigate = useNavigate();

  // Redirect if not logged in
  if (!user || !token) {
    return <Navigate to="/login" state={{ from: '/checkout' }} replace />;
  }

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zipCode: '' });
  const [showNewAddress, setShowNewAddress] = useState(false);
  
  const [globalPricing, setGlobalPricing] = useState({ handling: 0, shipping: 0, fee: 0 });
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
        const defaultAddr = data.find(a => a.isDefault);
        if (defaultAddr) setSelectedAddressId(defaultAddr._id);
        else if (data.length > 0) setSelectedAddressId(data[0]._id);
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
        const handling = data.find(p => p.name === 'Handling Charge')?.value || 0;
        const shipping = data.find(p => p.name === 'Shipping Charge')?.value || 0;
        const fee = data.find(p => p.name === 'Additional Fee')?.value || 0;
        setGlobalPricing({ handling, shipping, fee });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/me/addresses`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ ...newAddress, isDefault: addresses.length === 0 })
      });
      if (res.ok) {
        const updated = await res.json();
        setAddresses(updated);
        setShowNewAddress(false);
        setNewAddress({ street: '', city: '', state: '', zipCode: '' });
        const added = updated[updated.length - 1];
        if (added) setSelectedAddressId(added._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert("Please select a shipping address.");
      return;
    }
    setIsPlacingOrder(true);
    
    const selectedAddress = addresses.find(a => a._id === selectedAddressId);
    const fullAddress = `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.zipCode}`;
    
    try {
      // Group items by orderType so we send properly formatted orders
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
              phone: user.phone || 'N/A',
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
              phone: user.phone || 'N/A',
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
              phone: user.phone || 'N/A',
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
                selectedColor: item.selectedColor
              }))
            })
          })
        );
      }

      const results = await Promise.all(orderPromises);
      const allOk = results.every(r => r.ok);
      
      if (allOk) {
        alert("Order Placed Successfully!");
        clearCart();
        navigate('/');
      } else {
        // Try to read error from first failed response
        const failed = results.find(r => !r.ok);
        const errData = await failed.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to place order');
      }
    } catch (err) {
      console.error(err);
      alert("Error placing order: " + (err.message || 'Unknown error'));
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 px-4 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4 text-white">Your Cart is Empty</h2>
        <Button onClick={() => navigate('/shop')}>Go Shopping</Button>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const total = subtotal + globalPricing.handling + globalPricing.shipping + globalPricing.fee;

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 bg-primary">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Shipping details */}
        <div>
          <h2 className="text-3xl font-heading font-bold text-secondary uppercase tracking-wider mb-8">Checkout</h2>
          
          <div className="bg-neutral-900 rounded-xl p-6 border border-white/10 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Shipping Address</h3>
            
            {addresses.length > 0 && (
              <div className="space-y-3 mb-6">
                {addresses.map(addr => (
                  <label key={addr._id} className={`block p-4 rounded-lg border cursor-pointer transition-colors ${selectedAddressId === addr._id ? 'border-accent bg-accent/10' : 'border-white/10 bg-neutral-950 hover:border-white/20'}`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="address" 
                        checked={selectedAddressId === addr._id}
                        onChange={() => setSelectedAddressId(addr._id)}
                        className="text-accent focus:ring-accent bg-neutral-900 border-white/20"
                      />
                      <div>
                        <span className="font-semibold text-white mr-2">{addr.label}</span>
                        {addr.isDefault && <span className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded">Default</span>}
                        <p className="text-gray-400 text-sm mt-1">{addr.street}, {addr.city}, {addr.state} - {addr.zipCode}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {!showNewAddress ? (
              <Button variant="outline" onClick={() => setShowNewAddress(true)}>+ Add New Address</Button>
            ) : (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handleSaveAddress}
                className="space-y-4 bg-neutral-950 p-4 rounded-lg border border-white/5"
              >
                <input 
                  required type="text" placeholder="Street Address" 
                  value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})}
                  className="w-full bg-neutral-900 border border-white/20 rounded-md p-3 text-white focus:border-accent outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    required type="text" placeholder="City" 
                    value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                    className="w-full bg-neutral-900 border border-white/20 rounded-md p-3 text-white focus:border-accent outline-none"
                  />
                  <input 
                    required type="text" placeholder="State" 
                    value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                    className="w-full bg-neutral-900 border border-white/20 rounded-md p-3 text-white focus:border-accent outline-none"
                  />
                </div>
                <input 
                  required type="text" placeholder="Zip Code" 
                  value={newAddress.zipCode} onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})}
                  className="w-full bg-neutral-900 border border-white/20 rounded-md p-3 text-white focus:border-accent outline-none"
                />
                <div className="flex gap-2">
                  <Button type="submit" variant="accent">Save Address</Button>
                  <Button type="button" variant="outline" onClick={() => setShowNewAddress(false)}>Cancel</Button>
                </div>
              </motion.form>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <div className="bg-neutral-900 rounded-xl p-6 border border-white/10 sticky top-32">
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
              {globalPricing.shipping > 0 && (
                <div className="flex justify-between text-gray-400">
                  <span>Shipping Charge</span>
                  <span>+₹{globalPricing.shipping.toLocaleString()}</span>
                </div>
              )}
              {globalPricing.handling > 0 && (
                <div className="flex justify-between text-gray-400">
                  <span>Handling Charge</span>
                  <span>+₹{globalPricing.handling.toLocaleString()}</span>
                </div>
              )}
              {globalPricing.fee > 0 && (
                <div className="flex justify-between text-gray-400">
                  <span>Additional Fees</span>
                  <span>+₹{globalPricing.fee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-accent pt-3 border-t border-white/10">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            <Button 
              variant="accent" 
              className="w-full mt-6 py-4 text-lg"
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || !selectedAddressId}
            >
              {isPlacingOrder ? 'Processing...' : 'Place Order'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

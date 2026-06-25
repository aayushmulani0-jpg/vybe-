import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { API_URL } from '../config';
import Button from '../components/ui/Button';

export default function Profile() {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchMyOrders();
  }, [user, navigate, token]);

  const fetchMyOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders/myorders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-32 pb-24 bg-primary px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Profile Sidebar */}
        <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 h-fit">
          <div className="flex flex-col items-center mb-8 border-b border-white/10 pb-6">
            <div className="w-24 h-24 rounded-full bg-accent text-primary flex items-center justify-center text-3xl font-bold mb-4">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-heading font-bold text-white">{user.name}</h2>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
          
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded bg-white/5 text-accent font-semibold border-l-4 border-accent">
              My Orders
            </button>
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded hover:bg-white/5 text-gray-400 hover:text-red-400 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="md:col-span-3">
          <h2 className="text-3xl font-heading font-bold text-secondary uppercase tracking-wider mb-6">
            My Orders
          </h2>

          {loading ? (
            <p className="text-gray-500">Loading your orders...</p>
          ) : orders.length === 0 ? (
            <div className="bg-neutral-900 border border-white/10 rounded-xl p-8 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
              <p className="text-gray-400 mb-6">You haven't placed any orders yet.</p>
              <Button onClick={() => navigate('/shop')}>Start Shopping</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order._id} className="bg-neutral-900 border border-white/10 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-white/10 bg-neutral-950 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order Placed</p>
                      <p className="text-sm text-gray-300">{new Date(order.createdAt || order.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total</p>
                      <p className="text-sm font-semibold text-accent">₹{order.total?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
                      <p className="text-sm text-gray-300">#{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${
                        order.status === 'Completed' || order.status === 'Delivered' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {order.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {order.itemsList?.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-neutral-950 rounded border border-white/5 p-1 shrink-0">
                          <img 
                            src={item.image || 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400'} 
                            alt={item.name} 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.qty} | Price: ₹{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

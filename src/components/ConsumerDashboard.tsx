import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Package, 
  Truck, 
  CheckCircle2, 
  Leaf, 
  Clock, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import type { ConsumerOrder } from '../types';

export const ConsumerDashboard: React.FC = () => {
  const [orders, setOrders] = useState<ConsumerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setOrders(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCo2 = orders.reduce((sum, o) => sum + o.totalEcoImpact.co2SavedKg, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Consumer Account & Order History</h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Track your orders of products crafted from recycled industrial streams
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">Total Orders</span>
          <span className="text-2xl font-bold text-neutral-900 mt-1 block font-mono">{orders.length}</span>
          <span className="text-xs text-neutral-500 mt-0.5 block">Verified recycled purchases</span>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">Cumulative Spend</span>
          <span className="text-2xl font-bold text-neutral-900 mt-1 block font-mono">₹{totalSpent}</span>
          <span className="text-xs text-neutral-500 mt-0.5 block">Supporting regional circular recyclers</span>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">Carbon Offset Achieved</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block font-mono">-{totalCo2.toFixed(1)} kg CO₂</span>
          <span className="text-xs text-emerald-600 mt-0.5 block">Virgin raw material avoided</span>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
          Recent Orders ({orders.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-sm text-neutral-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-neutral-200 text-neutral-500 text-sm">
            You haven't placed any orders yet. Visit the Consumer Marketplace to browse recycled products!
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.orderId} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-neutral-900">Order #{order.orderId}</span>
                  <span className="text-xs text-neutral-400 block sm:inline sm:ml-2">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                    {order.trackingNumber}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1">
                    <div>
                      <span className="font-semibold text-neutral-900">{item.productTitle}</span>
                      <span className="text-neutral-500 ml-2">Qty: {item.quantity}</span>
                      <span className="text-[11px] text-neutral-400 block">Recycler: {item.recyclerName}</span>
                    </div>
                    <span className="font-mono font-semibold text-neutral-900">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-neutral-100 pt-3 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5" />
                  Saved {order.totalEcoImpact.co2SavedKg} kg CO₂
                </span>
                <span className="font-bold text-neutral-900 font-mono text-sm">
                  Total: ₹{order.totalAmount}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

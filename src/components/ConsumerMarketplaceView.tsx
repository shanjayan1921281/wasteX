import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Leaf, 
  Sparkles, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  X,
  PackageCheck,
  RefreshCw
} from 'lucide-react';
import type { RecycledProduct, CartItem, ConsumerOrder } from '../types';
import { productService, orderService } from '../services/recyclerService';

export const ConsumerMarketplaceView: React.FC = () => {
  const { userProfile } = useAuth();
  const [products, setProducts] = useState<RecycledProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<RecycledProduct | null>(null);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState<ConsumerOrder | null>(null);

  // Checkout form
  const [name, setName] = useState(userProfile?.name || 'Vimal Kumar');
  const [email, setEmail] = useState(userProfile?.email || 'vimal.buyer@example.com');
  const [phone, setPhone] = useState('+91 98421 77320');
  const [address, setAddress] = useState(userProfile?.location || '42 Circular Economy Avenue, RS Puram, Coimbatore, TN');
  const [placingOrder, setPlacingOrder] = useState(false);

  const categories = ['All', 'Fashion & Apparel', 'Home & Living', 'Consumer Goods', 'Packaging', 'Building & Construction', 'Industrial Feedstock'];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // 1. Get from persistent local & cloud product service
      const localProducts = await productService.getProducts(selectedCategory, searchQuery);
      
      // 2. Also fetch from Express server in-memory API
      let apiProducts: RecycledProduct[] = [];
      try {
        let url = '/api/products';
        const params = new URLSearchParams();
        if (selectedCategory !== 'All') params.append('category', selectedCategory);
        if (searchQuery) params.append('search', searchQuery);
        if (params.toString()) url += `?${params.toString()}`;

        const res = await fetch(url);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          apiProducts = data.data;
        }
      } catch (e) {
        console.warn('API fetch warning:', e);
      }

      // Merge unique by productId
      const map = new Map<string, RecycledProduct>();
      [...localProducts, ...apiProducts].forEach(p => map.set(p.productId, p));
      let merged = Array.from(map.values());

      if (selectedCategory !== 'All') {
        merged = merged.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        merged = merged.filter(p => 
          p.title.toLowerCase().includes(q) || 
          p.sourceMaterial.toLowerCase().includes(q) || 
          p.description.toLowerCase().includes(q)
        );
      }

      setProducts(merged);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const handleProductCreated = () => {
      fetchProducts();
    };

    window.addEventListener('wastexchange_product_created', handleProductCreated);
    return () => {
      window.removeEventListener('wastexchange_product_created', handleProductCreated);
    };
  }, [selectedCategory, searchQuery]);

  const addToCart = (product: RecycledProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.productId === product.productId);
      if (existing) {
        return prev.map(item => 
          item.product.productId === product.productId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.productId === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.productId !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCo2Saved = cart.reduce((sum, item) => sum + ((item.product.environmentalSavings?.co2KgSaved || 5) * item.quantity), 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setPlacingOrder(true);

    const newOrder: ConsumerOrder = {
      orderId: `ord-${Date.now()}`,
      consumerUserId: userProfile?.uid || 'usr-consumer-01',
      consumerName: name || 'Demo Consumer',
      consumerEmail: email || 'buyer@example.com',
      shippingAddress: {
        street: address,
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: '641002',
        phone
      },
      items: cart.map(i => ({
        productId: i.product.productId,
        productTitle: i.product.title,
        category: i.product.category,
        price: i.product.price,
        quantity: i.quantity,
        imageUrl: i.product.images?.[0] || '',
        sourceMaterial: i.product.sourceMaterial,
        recyclerName: i.product.recyclerName,
        subtotal: i.product.price * i.quantity
      })),
      totalAmount: cartTotal,
      status: 'ORDER_PLACED',
      totalEcoImpact: {
        co2SavedKg: Math.round(totalCo2Saved * 10) / 10,
        plasticAvoidedKg: Math.round(cart.reduce((s, i) => s + ((i.product.environmentalSavings?.virginMaterialAvoidedKg || 1) * i.quantity), 0) * 10) / 10
      },
      trackingNumber: `TRK-WX-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Save to local orderService & Supabase
      await orderService.createOrder(newOrder);

      // 2. Post to API
      try {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            consumerUserId: newOrder.consumerUserId,
            consumerName: newOrder.consumerName,
            consumerEmail: newOrder.consumerEmail,
            shippingAddress: newOrder.shippingAddress,
            items: newOrder.items
          })
        });
      } catch (apiErr) {
        console.warn('Order API sync warning:', apiErr);
      }

      setOrderComplete(newOrder);
      setCart([]);
      setIsCheckingOut(false);
      await fetchProducts(); // Refresh stock levels
    } catch (err) {
      console.error('Failed to place order:', err);
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Banner */}
      <div className="bg-neutral-900 text-white rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-medium mb-3 border border-emerald-500/30">
            <Leaf className="w-3.5 h-3.5" />
            <span>Closed-Loop Circular Economy Marketplace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Buy Products Made from Recycled Industrial Waste
          </h1>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Every item in this marketplace is directly traceable to verified waste streams processed by authorized industrial recyclers.
          </p>
        </div>

        {/* View Cart Button on Top Right */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 bg-white text-neutral-900 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-neutral-100 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span>Cart ({cartItemCount})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search recycled goods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-neutral-400">Loading recycled products...</div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center bg-white border border-neutral-200 rounded-2xl">
          <PackageCheck className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-neutral-800">No products match your search</h3>
          <p className="text-xs text-neutral-500 mt-1">Try selecting a different category or clearing your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.productId}
              className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 bg-neutral-100 overflow-hidden">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e: any) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-900/80 text-white backdrop-blur-xs">
                      {product.category}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-600/90 text-white backdrop-blur-xs flex items-center gap-1">
                      <Leaf className="w-3 h-3" />
                      -{product.environmentalSavings.co2KgSaved} kg CO₂
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-neutral-900 text-sm leading-snug line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-xs text-neutral-500 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
                    <span>Origin: <strong className="text-neutral-800">{product.wasteOriginName}</strong></span>
                    <span className="text-[11px] text-neutral-400 font-mono">Stock: {product.stock}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between gap-3">
                <div>
                  <span className="text-lg font-bold text-neutral-900 font-mono">
                    ₹{product.price}
                  </span>
                  <span className="text-[10px] text-neutral-400 block">incl. all taxes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="px-2.5 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 font-medium"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                      product.stock <= 0
                        ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between">
            {/* Cart Header */}
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-neutral-900" />
                <h3 className="font-bold text-neutral-900">Your Cart ({cartItemCount})</h3>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <div className="py-20 text-center text-neutral-400 text-sm">
                  Your cart is empty.
                </div>
              ) : isCheckingOut ? (
                /* Checkout Form */
                <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                    Shipping & Delivery Details
                  </h4>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full text-xs border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full text-xs border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full text-xs border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Shipping Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      required
                      className="w-full text-xs border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900"
                    />
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800 border border-emerald-200">
                    Payment Method: <strong className="font-semibold">Cash on Delivery / UPI Demo Confirmation</strong>
                  </div>
                </form>
              ) : (
                /* Items List */
                cart.map((item) => (
                  <div key={item.product.productId} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-neutral-100 bg-neutral-50/50">
                    <img 
                      src={item.product.images[0]} 
                      alt={item.product.title} 
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-neutral-900 truncate">{item.product.title}</h4>
                      <p className="text-[11px] text-neutral-500 font-mono">₹{item.product.price} each</p>
                      <span className="text-[10px] text-emerald-700 font-medium">-{item.product.environmentalSavings.co2KgSaved} kg CO₂</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.productId, -1)}
                        className="p-1 rounded bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.productId, 1)}
                        className="p-1 rounded bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-neutral-200 space-y-3 bg-neutral-50">
                <div className="flex items-center justify-between text-xs text-neutral-600">
                  <span>Carbon Offset Equivalent</span>
                  <span className="font-bold text-emerald-700">-{totalCo2Saved.toFixed(1)} kg CO₂ Saved</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-neutral-900 border-t border-neutral-200/80 pt-2">
                  <span>Total Amount</span>
                  <span className="font-mono text-base">₹{cartTotal}</span>
                </div>

                {isCheckingOut ? (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCheckingOut(false)}
                      className="w-1/3 py-2 text-xs font-medium border border-neutral-300 rounded-lg text-neutral-700 bg-white"
                    >
                      Back
                    </button>
                    <button
                      form="checkout-form"
                      type="submit"
                      disabled={placingOrder}
                      className="w-2/3 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                    >
                      {placingOrder ? 'Confirming Order...' : 'Confirm & Place Order'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsCheckingOut(true)}
                    className="w-full py-2.5 text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {orderComplete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-neutral-900">Order Confirmed!</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Thank you for supporting circular manufacturing. Your order has been placed.
              </p>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-500 font-sans">Order ID:</span>
                <span className="font-bold text-neutral-900">{orderComplete.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-sans">Tracking Number:</span>
                <span className="font-bold text-emerald-700">{orderComplete.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-sans">Total Paid:</span>
                <span className="font-bold text-neutral-900">₹{orderComplete.totalAmount}</span>
              </div>
            </div>

            <button
              onClick={() => setOrderComplete(null)}
              className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold"
            >
              Done & Continue Browsing
            </button>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                {selectedProduct.category}
              </span>
              <button onClick={() => setSelectedProduct(null)} className="text-neutral-400 hover:text-neutral-600">
                ✕
              </button>
            </div>

            <img
              src={selectedProduct.images[0]}
              alt={selectedProduct.title}
              className="w-full h-56 object-cover rounded-xl mb-4"
            />

            <h3 className="font-bold text-lg text-neutral-900 mb-1">{selectedProduct.title}</h3>
            <p className="text-xs text-neutral-600 leading-relaxed mb-4">{selectedProduct.description}</p>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-neutral-500">Source Waste Stream:</span>
                <span className="font-semibold text-neutral-900">{selectedProduct.wasteOriginName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Certified Recycler:</span>
                <span className="font-semibold text-neutral-900">{selectedProduct.recyclerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">CO₂ Avoided:</span>
                <span className="font-semibold text-emerald-700">{selectedProduct.environmentalSavings.co2KgSaved} kg CO₂</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xl font-bold font-mono text-neutral-900">₹{selectedProduct.price}</span>
              <button
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

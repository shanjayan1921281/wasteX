import React, { useState, useEffect } from 'react';
import { 
  RotateCw, 
  Package, 
  PlusCircle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Cog, 
  ShoppingBag, 
  Filter,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Upload,
  ExternalLink,
  Sparkles,
  Layers,
  Leaf
} from 'lucide-react';
import type { RecyclingRequest, RecyclingStage, RecycledProduct } from '../types';
import { recyclerService, productService } from '../services/recyclerService';

interface RecyclerDashboardProps {
  onNavigateToConsumerMarketplace?: () => void;
}

const PRESET_PRODUCT_IMAGES = [
  {
    name: 'Canvas Tote Bag',
    category: 'Fashion & Apparel',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    title: '100% Recycled Cotton Heavy Canvas Eco Tote'
  },
  {
    name: 'Interlocking Paver Tile',
    category: 'Building & Construction',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    title: 'High-Density Recycled Interlocking Pavers'
  },
  {
    name: 'Aluminium Desk Set',
    category: 'Home & Living',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    title: 'Architectural Recycled Aluminium Desk Set'
  },
  {
    name: 'Geometric Planter Box',
    category: 'Home & Living',
    url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
    title: 'Precision Remelted Secondary Planter'
  },
  {
    name: 'Eco Corrugated Mailers',
    category: 'Packaging',
    url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    title: 'Post-Consumer Kraft Protective Mailers'
  },
  {
    name: 'Acoustic Fibre Panels',
    category: 'Building & Construction',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    title: 'Acoustic Sound Baffle Interior Tiles'
  }
];

export const RecyclerDashboard: React.FC<RecyclerDashboardProps> = ({ onNavigateToConsumerMarketplace }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'products'>('pipeline');
  const [requests, setRequests] = useState<RecyclingRequest[]>([]);
  const [convertedProducts, setConvertedProducts] = useState<RecycledProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRequest, setSelectedRequest] = useState<RecyclingRequest | null>(null);
  const [showConvertModal, setShowConvertModal] = useState<boolean>(false);
  const [filterStage, setFilterStage] = useState<string>('ALL');

  // New Product Form State
  const [productTitle, setProductTitle] = useState('');
  const [productCategory, setProductCategory] = useState<'Fashion & Apparel' | 'Home & Living' | 'Industrial Feedstock' | 'Packaging' | 'Building & Construction' | 'Consumer Goods'>('Consumer Goods');
  const [productPrice, setProductPrice] = useState('499');
  const [productStock, setProductStock] = useState('100');
  const [productDescription, setProductDescription] = useState('');
  const [productImageUrl, setProductImageUrl] = useState(PRESET_PRODUCT_IMAGES[0].url);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      // Fetch requests from service & API
      const serviceReqs = await recyclerService.getRequests();
      let apiReqs: RecyclingRequest[] = [];
      try {
        const res = await fetch('/api/recycle/requests');
        const data = await res.json();
        if (data.success && data.data) {
          apiReqs = data.data;
        }
      } catch (e) {
        console.warn('API requests fetch fallback:', e);
      }

      const mapReq = new Map<string, RecyclingRequest>();
      [...serviceReqs, ...apiReqs].forEach(r => mapReq.set(r.requestId, r));
      const combinedReqs = Array.from(mapReq.values());
      setRequests(combinedReqs);

      if (combinedReqs.length > 0 && !selectedRequest) {
        setSelectedRequest(combinedReqs[0]);
      }

      // Fetch products
      const prods = await productService.getProducts();
      setConvertedProducts(prods);
    } catch (err) {
      console.error('Failed to load recycler dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    const handleSync = () => {
      fetchAllData();
    };

    window.addEventListener('wastexchange_recycler_updated', handleSync);
    window.addEventListener('wastexchange_product_created', handleSync);

    return () => {
      window.removeEventListener('wastexchange_recycler_updated', handleSync);
      window.removeEventListener('wastexchange_product_created', handleSync);
    };
  }, []);

  const handleUpdateStage = async (requestId: string, nextStage: RecyclingStage, note: string) => {
    try {
      await recyclerService.updateStage(requestId, nextStage, note);

      try {
        await fetch(`/api/recycle/${requestId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: nextStage,
            note,
            updatedBy: 'Kongu Green Facility Lead Operator'
          })
        });
      } catch (e) {
        console.warn('API status patch fallback:', e);
      }

      setRequests(prev => prev.map(r => {
        if (r.requestId === requestId) {
          const updated = {
            ...r,
            status: nextStage,
            updatedAt: new Date().toISOString(),
            stageHistory: [
              ...(r.stageHistory || []),
              { stage: nextStage, timestamp: new Date().toISOString(), note, updatedBy: 'Kongu Green Facility Lead Operator' }
            ]
          };
          if (selectedRequest?.requestId === requestId) {
            setSelectedRequest(updated);
          }
          return updated;
        }
        return r;
      }));
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  const handleOpenConvertModal = (req: RecyclingRequest) => {
    setSelectedRequest(req);
    const cleanName = req.wasteName.replace(/waste|scrap|flakes|regrind/gi, '').trim();
    
    // Pick suitable preset matching category if possible
    const matchingPreset = PRESET_PRODUCT_IMAGES.find(p => p.category.toLowerCase().includes(req.materialCategory.toLowerCase())) || PRESET_PRODUCT_IMAGES[0];
    
    setProductTitle(`Regenerated ${cleanName || req.materialCategory} Eco Product`);
    setProductCategory(matchingPreset.category as any);
    setProductImageUrl(matchingPreset.url);
    setProductDescription(`Engineered sustainably by ${req.recyclerName} from ${req.quantity} ${req.unit} of diverted industrial ${req.materialCategory.toLowerCase()}. Premium circular product with certified carbon reduction.`);
    setShowConvertModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProductImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setPublishing(true);

    const generatedProductId = `prod-${Date.now()}`;
    const newProduct: RecycledProduct = {
      productId: generatedProductId,
      recyclingRequestId: selectedRequest.requestId,
      title: productTitle.trim(),
      category: productCategory,
      price: Number(productPrice) || 399,
      currency: 'INR',
      stock: Number(productStock) || 50,
      unit: 'pieces',
      wasteOriginName: selectedRequest.wasteName,
      sourceMaterial: selectedRequest.processingDetails?.outputGrade || `100% Recycled ${selectedRequest.materialCategory}`,
      recyclerId: selectedRequest.recyclerId,
      recyclerName: selectedRequest.recyclerName,
      description: productDescription.trim(),
      images: [productImageUrl || PRESET_PRODUCT_IMAGES[0].url],
      environmentalSavings: {
        co2KgSaved: Math.round((Number(productPrice) / 100) * 3.8 * 10) / 10,
        virginMaterialAvoidedKg: Math.round((selectedRequest.quantity / 500) * 10) / 10 || 1.5,
        waterLitersSaved: Math.round((selectedRequest.quantity * 2.2)) || 450
      },
      specifications: {
        'Origin Stream': selectedRequest.wasteOwnerName,
        'Material Grade': selectedRequest.materialCategory,
        'Circularity Certification': 'WasteXchange Verified Recycled Content'
      },
      featured: true,
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Save directly to local persistent service (and Supabase if configured)
      await productService.createProduct(newProduct);

      // 2. Also call Express API endpoint to update in-memory maps
      try {
        await fetch(`/api/recycle/${selectedRequest.requestId}/convert-to-product`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newProduct.title,
            category: newProduct.category,
            price: newProduct.price,
            stock: newProduct.stock,
            unit: newProduct.unit,
            description: newProduct.description,
            images: newProduct.images
          })
        });
      } catch (apiErr) {
        console.warn('API convert endpoint warning:', apiErr);
      }

      // 3. Update request status to CONVERTED_TO_PRODUCT
      await handleUpdateStage(selectedRequest.requestId, 'CONVERTED_TO_PRODUCT', `Converted batch into live consumer product: "${newProduct.title}"`);

      setPublishSuccess(`Successfully converted batch into product "${newProduct.title}"! It is now live in the Consumer Marketplace.`);
      setShowConvertModal(false);
      await fetchAllData();
      setActiveTab('products');
    } catch (err) {
      console.error('Failed to convert to product:', err);
    } finally {
      setPublishing(false);
    }
  };

  const stages: { key: RecyclingStage; label: string; icon: React.ReactNode }[] = [
    { key: 'SUBMITTED', label: 'Submitted', icon: <Clock className="w-3.5 h-3.5" /> },
    { key: 'ACCEPTED', label: 'Accepted', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { key: 'COLLECTED', label: 'Collected', icon: <Truck className="w-3.5 h-3.5" /> },
    { key: 'PROCESSING', label: 'Processing', icon: <Cog className="w-3.5 h-3.5" /> },
    { key: 'PROCESSED', label: 'Processed', icon: <Package className="w-3.5 h-3.5" /> },
    { key: 'CONVERTED_TO_PRODUCT', label: 'Converted', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  ];

  const getStageIndex = (stage: RecyclingStage) => {
    return stages.findIndex(s => s.key === stage);
  };

  const filteredRequests = filterStage === 'ALL' 
    ? requests 
    : requests.filter(r => r.status === filterStage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" id="recycler-dashboard-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <RotateCw className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Recycler Facility Portal</h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Kongu Green Polymer & Fibre Processors • Authorized Secondary Resource Upcycler
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Navigation */}
          <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200 text-xs font-semibold">
            <button
              id="tab-waste-pipeline"
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'pipeline' 
                  ? 'bg-white text-neutral-900 shadow-xs' 
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Waste Batches ({requests.length})
            </button>
            <button
              id="tab-converted-catalog"
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'products' 
                  ? 'bg-white text-emerald-800 shadow-xs' 
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Converted Products ({convertedProducts.length})
            </button>
          </div>

          {onNavigateToConsumerMarketplace && (
            <button
              id="btn-goto-consumer-store"
              onClick={onNavigateToConsumerMarketplace}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Consumer Store</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </button>
          )}
        </div>
      </div>

      {publishSuccess && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{publishSuccess}</span>
          </div>
          <div className="flex items-center gap-2">
            {onNavigateToConsumerMarketplace && (
              <button
                onClick={onNavigateToConsumerMarketplace}
                className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 flex items-center gap-1"
              >
                <span>View in Store</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button 
              onClick={() => setPublishSuccess(null)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* VIEW 1: Waste Processing Pipeline */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left Column: Request List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Assigned Waste Streams
              </h3>
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-neutral-400" />
                <select
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  className="text-xs border border-neutral-200 rounded-lg px-2.5 py-1 bg-white text-neutral-700"
                >
                  <option value="ALL">All Stages ({requests.length})</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="COLLECTED">Collected</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="PROCESSED">Processed (Ready to Convert)</option>
                  <option value="CONVERTED_TO_PRODUCT">Converted to Product</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {filteredRequests.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200 text-neutral-500 text-sm">
                  No recycling requests found in this stage.
                </div>
              ) : (
                filteredRequests.map((req) => {
                  const isSelected = selectedRequest?.requestId === req.requestId;
                  const isProcessed = req.status === 'PROCESSED';
                  return (
                    <div
                      key={req.requestId}
                      onClick={() => setSelectedRequest(req)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-emerald-600 bg-emerald-50/30 shadow-xs ring-1 ring-emerald-600' 
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-neutral-900">{req.wasteName}</h4>
                            {isProcessed && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                                Ready to Convert
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            From: {req.wasteOwnerName} • {req.wasteOwnerLocation || 'Tamil Nadu'}
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-neutral-100 text-neutral-800">
                          {req.quantity} {req.unit}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                          req.status === 'CONVERTED_TO_PRODUCT' 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                            : req.status === 'PROCESSING' 
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : req.status === 'PROCESSED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          {req.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-neutral-400 text-[11px]">
                          {new Date(req.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Batch Details & Conversion Stepper */}
          <div className="lg:col-span-7">
            {selectedRequest ? (
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-6">
                {/* Top Details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-5">
                  <div>
                    <span className="text-xs font-mono text-neutral-400 block mb-0.5">
                      Batch #{selectedRequest.requestId}
                    </span>
                    <h2 className="text-xl font-bold text-neutral-900">{selectedRequest.wasteName}</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Origin: <strong className="text-neutral-700">{selectedRequest.wasteOwnerName}</strong> • Category: <strong className="text-neutral-700">{selectedRequest.materialCategory}</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-neutral-900 block font-mono">
                      {selectedRequest.quantity} <span className="text-sm font-normal text-neutral-500">{selectedRequest.unit}</span>
                    </span>
                    <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block mt-1">
                      Assigned to {selectedRequest.recyclerName}
                    </span>
                  </div>
                </div>

                {/* Value Chain Stepper */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                    Circular Progression Pipeline
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    {stages.map((stg, idx) => {
                      const currentIndex = getStageIndex(selectedRequest.status);
                      const isDone = idx < currentIndex;
                      const isCurrent = idx === currentIndex;

                      return (
                        <div
                          key={stg.key}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isCurrent
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                              : isDone
                              ? 'border-neutral-200 bg-neutral-50 text-neutral-700'
                              : 'border-neutral-100 bg-neutral-50/50 text-neutral-400 opacity-60'
                          }`}
                        >
                          <div className="flex justify-center mb-1">
                            {isDone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : stg.icon}
                          </div>
                          <span className="text-[11px] block truncate">{stg.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Controls for advancing stage */}
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                      Processing Action
                    </h4>
                    <span className="text-xs text-neutral-500">
                      Current Stage: <strong className="text-neutral-800">{selectedRequest.status}</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {selectedRequest.status === 'SUBMITTED' && (
                      <button
                        onClick={() => handleUpdateStage(selectedRequest.requestId, 'ACCEPTED', 'Recycler accepted incoming lot and verified purity.')}
                        className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Accept Waste Lot
                      </button>
                    )}

                    {selectedRequest.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleUpdateStage(selectedRequest.requestId, 'COLLECTED', 'Batch collected via green transport fleet.')}
                        className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Confirm Fleet Pickup & Weigh-in
                      </button>
                    )}

                    {selectedRequest.status === 'COLLECTED' && (
                      <button
                        onClick={() => handleUpdateStage(selectedRequest.requestId, 'PROCESSING', 'Material fed to recycling extrusion / carding line.')}
                        className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Cog className="w-3.5 h-3.5" />
                        Begin Mechanical/Chemical Processing
                      </button>
                    )}

                    {selectedRequest.status === 'PROCESSING' && (
                      <button
                        onClick={() => handleUpdateStage(selectedRequest.requestId, 'PROCESSED', 'Batch processing finalized. High purity regenerated material ready.')}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Package className="w-3.5 h-3.5" />
                        Mark Batch as Processed
                      </button>
                    )}

                    {selectedRequest.status === 'PROCESSED' && (
                      <button
                        id="btn-convert-processed-batch"
                        onClick={() => handleOpenConvertModal(selectedRequest)}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-transform active:scale-95"
                      >
                        <Sparkles className="w-4 h-4 text-emerald-200" />
                        Convert to Recycled Product (Publish to Marketplace)
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {selectedRequest.status === 'CONVERTED_TO_PRODUCT' && (
                      <div className="flex items-center justify-between w-full bg-purple-50 p-3 rounded-xl border border-purple-200">
                        <div className="flex items-center gap-2 text-xs font-semibold text-purple-900">
                          <ShoppingBag className="w-4 h-4 text-purple-600" />
                          <span>Product is published and live in the Consumer Marketplace!</span>
                        </div>
                        {onNavigateToConsumerMarketplace && (
                          <button
                            onClick={onNavigateToConsumerMarketplace}
                            className="px-3 py-1 bg-purple-700 text-white text-xs font-bold rounded-lg hover:bg-purple-800 flex items-center gap-1"
                          >
                            <span>Browse Store</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Audit History */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                    Batch Audit Trail
                  </h4>
                  <div className="space-y-2">
                    {selectedRequest.stageHistory?.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-neutral-900">{item.stage.replace(/_/g, ' ')}</span>
                            <span className="text-neutral-400 text-[11px]">{new Date(item.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-neutral-600 mt-0.5">{item.note}</p>
                          <span className="text-[10px] text-neutral-400">Actor: {item.updatedBy}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-white border border-neutral-200 rounded-2xl text-neutral-400 text-sm">
                Select a waste batch from the left to view details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: Recycled Products Catalog */}
      {activeTab === 'products' && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Converted Recycled Products Catalog</h2>
              <p className="text-xs text-neutral-500">
                These circular economy consumer products are published live to the Consumer Marketplace storefront.
              </p>
            </div>
            {onNavigateToConsumerMarketplace && (
              <button
                onClick={onNavigateToConsumerMarketplace}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Open Consumer Storefront</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {convertedProducts.map(prod => (
              <div 
                key={prod.productId}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:border-neutral-300 transition-all flex flex-col"
              >
                <div className="h-48 w-full bg-neutral-100 relative overflow-hidden">
                  <img
                    src={prod.images?.[0] || PRESET_PRODUCT_IMAGES[0].url}
                    alt={prod.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e: any) => {
                      e.currentTarget.src = PRESET_PRODUCT_IMAGES[0].url;
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-neutral-900 border border-neutral-200">
                    ₹{prod.price}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-neutral-900/80 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1">
                    <Leaf className="w-3 h-3 text-emerald-400" />
                    <span>{prod.environmentalSavings?.co2KgSaved || 5} kg CO₂ saved</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                      {prod.category}
                    </span>
                    <h3 className="font-bold text-base text-neutral-900 mb-1.5 leading-snug">
                      {prod.title}
                    </h3>
                    <p className="text-xs text-neutral-500 line-clamp-2 mb-3">
                      {prod.description}
                    </p>
                    <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 text-[11px] space-y-1">
                      <div className="flex justify-between text-neutral-600">
                        <span>Source Material:</span>
                        <strong className="text-neutral-800">{prod.sourceMaterial}</strong>
                      </div>
                      <div className="flex justify-between text-neutral-600">
                        <span>Stock Available:</span>
                        <strong className="text-neutral-800">{prod.stock} {prod.unit}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Live in Store
                    </span>
                    {onNavigateToConsumerMarketplace && (
                      <button
                        onClick={onNavigateToConsumerMarketplace}
                        className="text-neutral-900 font-bold hover:text-emerald-700 flex items-center gap-1"
                      >
                        <span>Preview</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Convert Processed Batch to Recycled Product */}
      {showConvertModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-neutral-900">Create Recycled Product</h3>
                  <p className="text-xs text-neutral-500">
                    Publishing from batch: <span className="font-semibold text-neutral-800">{selectedRequest.wasteName}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowConvertModal(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePublishProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  required
                  placeholder="e.g. 100% Recycled Cotton Heavy Canvas Eco Tote"
                  className="w-full text-sm border border-neutral-300 rounded-xl px-3.5 py-2.5 text-neutral-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Marketplace Category</label>
                  <select
                    value={productCategory}
                    onChange={(e: any) => setProductCategory(e.target.value)}
                    className="w-full text-sm border border-neutral-300 rounded-xl px-3.5 py-2.5 text-neutral-900 bg-white"
                  >
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Consumer Goods">Consumer Goods</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Building & Construction">Building & Construction</option>
                    <option value="Industrial Feedstock">Industrial Feedstock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Retail Price (INR ₹)</label>
                  <input
                    type="number"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    required
                    min="1"
                    className="w-full text-sm border border-neutral-300 rounded-xl px-3.5 py-2.5 text-neutral-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Initial Inventory (Units)</label>
                  <input
                    type="number"
                    value={productStock}
                    onChange={(e) => setProductStock(e.target.value)}
                    required
                    min="1"
                    className="w-full text-sm border border-neutral-300 rounded-xl px-3.5 py-2.5 text-neutral-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Source Material Note</label>
                  <input
                    type="text"
                    defaultValue={`100% Recycled ${selectedRequest.materialCategory}`}
                    className="w-full text-sm border border-neutral-300 rounded-xl px-3.5 py-2.5 text-neutral-900 bg-neutral-50"
                    readOnly
                  />
                </div>
              </div>

              {/* Product Image Preset Picker & Custom URL */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Select Product Visual Preset or Upload Photo
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                  {PRESET_PRODUCT_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setProductImageUrl(preset.url);
                        if (!productTitle || productTitle.startsWith('Regenerated')) {
                          setProductTitle(preset.title);
                          setProductCategory(preset.category as any);
                        }
                      }}
                      className={`relative rounded-xl overflow-hidden border-2 aspect-square group transition-all ${
                        productImageUrl === preset.url 
                          ? 'border-emerald-600 ring-2 ring-emerald-600 shadow-xs' 
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <img 
                        src={preset.url} 
                        alt={preset.name}
                        referrerPolicy="no-referrer" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] text-white p-0.5 truncate text-center">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={productImageUrl}
                    onChange={(e) => setProductImageUrl(e.target.value)}
                    placeholder="Or paste external image URL..."
                    className="flex-1 text-xs border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900"
                  />
                  <label className="cursor-pointer px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 border border-neutral-200">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileUpload} 
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Product Description & Eco Credentials</label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  rows={3}
                  required
                  className="w-full text-sm border border-neutral-300 rounded-xl px-3.5 py-2.5 text-neutral-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowConvertModal(false)}
                  className="px-4 py-2.5 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-xs transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{publishing ? 'Publishing to Store...' : 'Publish to Consumer Marketplace'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

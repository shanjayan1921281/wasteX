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
  AlertCircle
} from 'lucide-react';
import type { RecyclingRequest, RecyclingStage, RecycledProduct } from '../types';

export const RecyclerDashboard: React.FC = () => {
  const [requests, setRequests] = useState<RecyclingRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRequest, setSelectedRequest] = useState<RecyclingRequest | null>(null);
  const [showConvertModal, setShowConvertModal] = useState<boolean>(false);
  const [filterStage, setFilterStage] = useState<string>('ALL');

  // New Product Form State
  const [productTitle, setProductTitle] = useState('');
  const [productCategory, setProductCategory] = useState<'Fashion & Apparel' | 'Home & Living' | 'Industrial Feedstock' | 'Packaging' | 'Building & Construction' | 'Consumer Goods'>('Consumer Goods');
  const [productPrice, setProductPrice] = useState('599');
  const [productStock, setProductStock] = useState('50');
  const [productDescription, setProductDescription] = useState('');
  const [productImageUrl, setProductImageUrl] = useState('https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80');
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/recycle/requests');
      const data = await res.json();
      if (data.success && data.data) {
        setRequests(data.data);
        if (data.data.length > 0 && !selectedRequest) {
          setSelectedRequest(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch recycling requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStage = async (requestId: string, nextStage: RecyclingStage, note: string) => {
    try {
      const res = await fetch(`/api/recycle/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStage,
          note,
          updatedBy: 'Apex Regenerated Facility Supervisor'
        })
      });
      const data = await res.json();
      if (data.success) {
        setRequests(prev => prev.map(r => r.requestId === requestId ? data.data : r));
        setSelectedRequest(data.data);
      }
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  const handleOpenConvertModal = (req: RecyclingRequest) => {
    setSelectedRequest(req);
    setProductTitle(`Regenerated ${req.wasteName.replace(/waste|scrap/gi, '').trim()} Consumer Product`);
    setProductDescription(`Sustainably re-engineered by ${req.recyclerName} from ${req.quantity} ${req.unit} of verified industrial secondary stream.`);
    setShowConvertModal(true);
  };

  const handlePublishProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setPublishing(true);

    try {
      const res = await fetch(`/api/recycle/${selectedRequest.requestId}/convert-to-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: productTitle,
          category: productCategory,
          price: Number(productPrice),
          stock: Number(productStock),
          unit: 'pieces',
          description: productDescription,
          images: [productImageUrl]
        })
      });

      const data = await res.json();
      if (data.success) {
        setPublishSuccess(`Successfully created product: "${data.product.title}". It is now live on the Consumer Marketplace!`);
        setShowConvertModal(false);
        await fetchRequests();
      }
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
    { key: 'CONVERTED_TO_PRODUCT', label: 'Converted to Product', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  ];

  const getStageIndex = (stage: RecyclingStage) => {
    return stages.findIndex(s => s.key === stage);
  };

  const filteredRequests = filterStage === 'ALL' 
    ? requests 
    : requests.filter(r => r.status === filterStage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <RotateCw className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Recycler Facility Dashboard</h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Circular Value Chain Management: <span className="font-mono text-emerald-700">Recycle → Processing → Recycled Product</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-neutral-500">Active Pipeline:</span>
          <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {requests.length} Waste Batches
          </span>
        </div>
      </div>

      {publishSuccess && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{publishSuccess}</span>
          </div>
          <button 
            onClick={() => setPublishSuccess(null)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Request List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
              Waste Stream Batches
            </h3>
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="text-xs border border-neutral-200 rounded-md px-2 py-1 bg-white text-neutral-700"
              >
                <option value="ALL">All Stages</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="PROCESSING">Processing</option>
                <option value="PROCESSED">Processed</option>
                <option value="CONVERTED_TO_PRODUCT">Converted</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredRequests.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-neutral-200 text-neutral-500 text-sm">
                No recycling requests found in this stage.
              </div>
            ) : (
              filteredRequests.map((req) => {
                const isSelected = selectedRequest?.requestId === req.requestId;
                return (
                  <div
                    key={req.requestId}
                    onClick={() => setSelectedRequest(req)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-neutral-900 bg-white shadow-sm ring-1 ring-neutral-900' 
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-sm text-neutral-900">{req.wasteName}</h4>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          From: {req.wasteOwnerName} • {req.wasteOwnerLocation || 'Tamil Nadu'}
                        </p>
                      </div>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                        {req.quantity} {req.unit}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className={`px-2 py-0.5 rounded font-medium ${
                        req.status === 'CONVERTED_TO_PRODUCT' 
                          ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                          : req.status === 'PROCESSING' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : req.status === 'PROCESSED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        Stage: {req.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-neutral-400">
                        {new Date(req.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Batch Detail & Value Chain Stages */}
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
                    Source: {selectedRequest.wasteOwnerName} • Material: {selectedRequest.materialCategory}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-neutral-900 block font-mono">
                    {selectedRequest.quantity} <span className="text-sm font-normal text-neutral-500">{selectedRequest.unit}</span>
                  </span>
                  <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Assigned to {selectedRequest.recyclerName}
                  </span>
                </div>
              </div>

              {/* Six-Stage Value Chain Stepper */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                  Recycling & Circular Value Chain Progression
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {stages.map((stg, idx) => {
                    const currentIndex = getStageIndex(selectedRequest.status);
                    const isDone = idx < currentIndex;
                    const isCurrent = idx === currentIndex;

                    return (
                      <div
                        key={stg.key}
                        className={`p-2.5 rounded-lg border text-center transition-all ${
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
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-700">
                  Update Processing Stage
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.status === 'SUBMITTED' && (
                    <button
                      onClick={() => handleUpdateStage(selectedRequest.requestId, 'ACCEPTED', 'Recycler accepted incoming lot.')}
                      className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Accept Lot for Processing
                    </button>
                  )}

                  {selectedRequest.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleUpdateStage(selectedRequest.requestId, 'COLLECTED', 'Batch collected and weighed at receiving dock.')}
                      className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Confirm Material Collection
                    </button>
                  )}

                  {selectedRequest.status === 'COLLECTED' && (
                    <button
                      onClick={() => handleUpdateStage(selectedRequest.requestId, 'PROCESSING', 'Material loaded into garnetting / de-dusting line.')}
                      className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
                    >
                      <Cog className="w-3.5 h-3.5" />
                      Begin Active Processing
                    </button>
                  )}

                  {selectedRequest.status === 'PROCESSING' && (
                    <button
                      onClick={() => handleUpdateStage(selectedRequest.requestId, 'PROCESSED', 'Batch processing complete. High-purity recycled feedstock generated.')}
                      className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
                    >
                      <Package className="w-3.5 h-3.5" />
                      Mark Batch as Processed
                    </button>
                  )}

                  {selectedRequest.status === 'PROCESSED' && (
                    <button
                      onClick={() => handleOpenConvertModal(selectedRequest)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Convert to Recycled Product (Publish to Marketplace)
                    </button>
                  )}

                  {selectedRequest.status === 'CONVERTED_TO_PRODUCT' && (
                    <div className="text-xs font-medium text-purple-800 bg-purple-50 p-2.5 rounded-lg border border-purple-200 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-purple-600" />
                      <span>Product is published and live in the Consumer Marketplace! Catalog ID: {selectedRequest.convertedProductId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Processing details card */}
              {selectedRequest.processingDetails && (
                <div className="p-4 rounded-xl bg-white border border-neutral-200 text-xs space-y-2">
                  <h4 className="font-semibold text-neutral-800 uppercase tracking-wider text-[11px]">
                    Technical Processing Record
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-neutral-400 block">Method</span>
                      <span className="font-medium text-neutral-800">{selectedRequest.processingDetails.processMethod}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block">Material Yield</span>
                      <span className="font-medium text-emerald-700">{selectedRequest.processingDetails.yieldPercentage}% recovery yield</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block">Output Material</span>
                      <span className="font-medium text-neutral-800">{selectedRequest.processingDetails.outputMaterial}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Audit Timeline */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                  Stage Audit Timeline
                </h4>
                <div className="space-y-2">
                  {selectedRequest.stageHistory.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-neutral-900">{item.stage.replace(/_/g, ' ')}</span>
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
              Select a waste batch from the left to manage processing.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Convert Processed Batch to Recycled Product */}
      {showConvertModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-lg text-neutral-900">Create Recycled Product</h3>
              </div>
              <button 
                onClick={() => setShowConvertModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-500 mb-4">
              Convert batch <strong className="text-neutral-800">{selectedRequest.wasteName}</strong> into an eco-friendly consumer product to be listed in the live Consumer Marketplace.
            </p>

            <form onSubmit={handlePublishProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  required
                  className="w-full text-sm border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Category</label>
                  <select
                    value={productCategory}
                    onChange={(e: any) => setProductCategory(e.target.value)}
                    className="w-full text-sm border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 bg-white"
                  >
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Consumer Goods">Consumer Goods</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Industrial Feedstock">Industrial Feedstock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Price (INR ₹)</label>
                  <input
                    type="number"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    required
                    min="50"
                    className="w-full text-sm border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Initial Stock (Units)</label>
                  <input
                    type="number"
                    value={productStock}
                    onChange={(e) => setProductStock(e.target.value)}
                    required
                    min="1"
                    className="w-full text-sm border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={productImageUrl}
                    onChange={(e) => setProductImageUrl(e.target.value)}
                    className="w-full text-sm border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Product Description</label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  rows={3}
                  required
                  className="w-full text-sm border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConvertModal(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                >
                  {publishing ? 'Publishing...' : 'Publish to Marketplace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

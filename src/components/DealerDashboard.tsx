import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Truck, 
  Plus, 
  ShoppingBag, 
  CheckCircle2, 
  Search, 
  MapPin, 
  ArrowRight,
  TrendingUp,
  X,
  Loader2
} from 'lucide-react';
import type { MaterialRequirement, WasteListing, PurchaseRequest } from '../types';
import { logAuditEvent } from '../lib/auditAndNotifications';
import { dealerService, transactionService } from '../services/dealerService';

interface DealerDashboardProps {
  onNavigateMarketplace: () => void;
  onNavigateTransactions: () => void;
}

export const DealerDashboard: React.FC<DealerDashboardProps> = ({
  onNavigateMarketplace,
  onNavigateTransactions,
}) => {
  const { userProfile, businessProfile } = useAuth();
  const [requirements, setRequirements] = useState<MaterialRequirement[]>([]);
  const [myRequests, setMyRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // New Requirement Form Modal
  const [showReqModal, setShowReqModal] = useState(false);
  const [reqTitle, setReqTitle] = useState('PET Plastic Flakes / Regrind');
  const [reqCat, setReqCat] = useState('Plastic');
  const [reqSpec, setReqSpec] = useState('Clean washed hot-water PET regrind');
  const [minQty, setMinQty] = useState(1000);
  const [maxQty, setMaxQty] = useState(5000);
  const [reqUnit, setReqUnit] = useState('kg');
  const [qualitySpec, setQualitySpec] = useState('Clean, transparent, PVC < 50ppm');
  const [locationPref, setLocationPref] = useState('Coimbatore / Tiruppur / Erode');
  const [frequency, setFrequency] = useState<'One-time' | 'Weekly' | 'Monthly' | 'Continuous'>('Monthly');
  const [priceRange, setPriceRange] = useState('₹45 - ₹58 / kg');
  const [modalLoading, setModalLoading] = useState(false);

  const loadDealerData = async () => {
    setLoading(true);
    try {
      // 1. Fetch requirements
      const reqArr = await dealerService.getRequirements();
      setRequirements(reqArr);

      // 2. Fetch purchase requests made
      const prArr = await transactionService.getPurchaseRequests();
      setMyRequests(prArr);
    } catch (err) {
      console.error('Error fetching dealer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDealerData();
  }, []);

  const handleCreateRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const requirementId = `req-${Date.now()}`;
      const now = new Date().toISOString();

      const newReq: MaterialRequirement = {
        requirementId,
        dealerBusinessId: businessProfile?.businessId || 'biz-dealer-default',
        dealerBusinessName: businessProfile?.businessName || userProfile?.name || 'Vortex Circular Polymers',
        dealerUserId: userProfile?.uid || 'user-dealer-default',
        title: reqTitle,
        materialCategory: reqCat,
        specificMaterial: reqSpec,
        minQuantity: minQty,
        maxQuantity: maxQty,
        unit: reqUnit,
        requiredQuality: qualitySpec,
        preferredLocation: locationPref,
        frequency: frequency as any,
        targetPriceRange: priceRange,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now
      };

      await dealerService.saveRequirement(newReq);

      if (userProfile) {
        await logAuditEvent(
          userProfile.uid,
          userProfile.role,
          'CREATE_MATERIAL_REQUIREMENT',
          'materialRequirement',
          requirementId,
          { title: reqTitle, category: reqCat },
          userProfile.email
        );
      }

      await loadDealerData();
      setShowReqModal(false);
    } catch (err) {
      console.error('Error creating requirement:', err);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-teal-700" />
            <span className="text-xs uppercase tracking-wider text-teal-800 font-bold">
              Dealer & Buyer Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {businessProfile?.businessName || 'Vortex Circular Polymers & Fibres'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Secondary Raw Material Procurement Hub • Tiruppur / Coimbatore Aggregator
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowReqModal(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Post Material Requirement</span>
          </button>
          <button
            onClick={onNavigateMarketplace}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Available Scrap</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Active Buying Posts</span>
          <span className="text-2xl font-bold text-teal-800 mt-1 block">
            {requirements.length}
          </span>
          <span className="text-[11px] text-teal-700 font-semibold mt-1 block">
            Broadcasting to regional mills
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Purchase Requests Sent</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {myRequests.length}
          </span>
          <button
            onClick={onNavigateTransactions}
            className="text-[11px] text-emerald-700 hover:underline font-semibold mt-1 block cursor-pointer"
          >
            Track in Timeline →
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Confirmed Deals</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {myRequests.filter(r => r.status === 'ACCEPTED').length}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            In active transit / delivery
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Account Status</span>
          <span className="text-sm font-bold text-emerald-800 mt-2 block flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            VERIFIED BUSINESS
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">GST & Factory Gate Cleared</span>
        </div>
      </div>

      {/* Active Material Requirements Published */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Published Material Requirements</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Mills and factories with matching waste streams are alerted to your procurement needs.
            </p>
          </div>
          <button
            onClick={() => setShowReqModal(true)}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors cursor-pointer"
          >
            + New Requirement
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requirements.length === 0 ? (
            <div className="col-span-2 p-10 text-center text-slate-500 text-sm border border-dashed border-slate-200 rounded-2xl">
              No material requirements posted yet. Click "+ New Requirement" to broadcast what you want to buy.
            </div>
          ) : (
            requirements.map((req) => (
              <div
                key={req.requirementId}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 hover:border-teal-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{req.title}</h3>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-100/80 text-teal-800 font-bold">
                      {req.materialCategory}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">
                    {req.targetPriceRange || 'Best Offer'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div>Needs: <strong className="text-slate-900">{req.minQuantity} - {req.maxQuantity} {req.unit}</strong></div>
                  <div>Location: <strong className="text-slate-900">{req.preferredLocation}</strong></div>
                  <div>Quality: <strong className="text-slate-900">{req.requiredQuality}</strong></div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-emerald-800">Status: {req.status}</span>
                  <button
                    onClick={onNavigateMarketplace}
                    className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Browse Matching Scrap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal to Post Requirement */}
      {showReqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 sm:p-8 relative shadow-2xl space-y-4">
            <button
              onClick={() => setShowReqModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Buyer Demand Request
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Post Material Requirement</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Tell factories and scrap sellers what raw materials or scrap you need to buy.
              </p>
            </div>

            <form onSubmit={handleCreateRequirement} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requirement Title *</label>
                <input
                  type="text"
                  required
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  placeholder="e.g. Cotton Cutting Waste or HDPE Granules"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Material Category</label>
                  <select
                    value={reqCat}
                    onChange={(e) => setReqCat(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                  >
                    <option value="Textile">Textile Waste</option>
                    <option value="Plastic">Plastic & Polymers</option>
                    <option value="Metal">Ferrous / Non-Ferrous</option>
                    <option value="Rubber">Rubber Scrap</option>
                    <option value="Cardboard">Corrugated Board</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                  >
                    <option value="Weekly">Weekly Batch</option>
                    <option value="Monthly">Monthly Recurring</option>
                    <option value="Continuous">Continuous Offtake</option>
                    <option value="One-time">One-time Lot</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Qty</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={minQty}
                    onChange={(e) => setMinQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Qty</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={maxQty}
                    onChange={(e) => setMaxQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                  <select
                    value={reqUnit}
                    onChange={(e) => setReqUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                  >
                    <option value="kg">kg</option>
                    <option value="tonnes">tonnes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Quality & Notes</label>
                <input
                  type="text"
                  required
                  value={qualitySpec}
                  onChange={(e) => setQualitySpec(e.target.value)}
                  placeholder="e.g. Dry, clean, sorted by color or type"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preferred Location</label>
                  <input
                    type="text"
                    value={locationPref}
                    onChange={(e) => setLocationPref(e.target.value)}
                    placeholder="e.g. Tiruppur / Coimbatore"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Price (Optional)</label>
                  <input
                    type="text"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    placeholder="e.g. ₹38 - ₹46 / kg"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReqModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 cursor-pointer text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {modalLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Requirement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

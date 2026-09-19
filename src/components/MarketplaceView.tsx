import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Recycle, 
  Search, 
  Filter, 
  Sparkles, 
  Building2, 
  MapPin, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  ShoppingBag, 
  X, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import type { 
  WasteListing, 
  MaterialRequirement, 
  BuyerMatch, 
  PurchaseRequest 
} from '../types';
import { calculateDeterministicMatch } from '../lib/matchingEngine';
import { logAuditEvent, createNotification } from '../lib/auditAndNotifications';
import { marketplaceService, dealerService, transactionService } from '../services/dealerService';

interface MarketplaceProps {
  onOpenReport: (reportId: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onNavigateTransactions: () => void;
}

export const MarketplaceView: React.FC<MarketplaceProps> = ({
  onOpenReport,
  onOpenAuth,
  onNavigateTransactions
}) => {
  const { userProfile, businessProfile } = useAuth();
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [dealerRequirements, setDealerRequirements] = useState<MaterialRequirement[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'quantity' | 'score'>('newest');

  // Modal for Request Purchase
  const [selectedListingForRequest, setSelectedListingForRequest] = useState<WasteListing | null>(null);
  const [requestQty, setRequestQty] = useState<number>(400);
  const [requestMessage, setRequestMessage] = useState('We inspected the AI Intelligence Report (94% confidence). Our rotor mill in Tiruppur can take 400 kg immediately with our dedicated covered truck.');
  const [pickupDate, setPickupDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [requestSending, setRequestSending] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Modal for AI Buyer Match Breakdown
  const [activeMatchModal, setActiveMatchModal] = useState<BuyerMatch | null>(null);

  // Load marketplace data
  const loadMarketplaceData = async () => {
    setLoading(true);
    try {
      // 1. Fetch wasteListings
      const listArr = await marketplaceService.getListings();
      setListings(listArr.filter(item => item.status === 'LISTED' || item.status === 'RESERVED'));

      // 2. Fetch dealer requirements
      const reqArr = await dealerService.getRequirements();
      setDealerRequirements(reqArr.filter(item => item.status === 'ACTIVE'));
    } catch (err) {
      console.error('Error fetching marketplace listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplaceData();

    const handleListingUpdate = () => {
      loadMarketplaceData();
    };

    window.addEventListener('wastexchange_listing_saved', handleListingUpdate);
    return () => {
      window.removeEventListener('wastexchange_listing_saved', handleListingUpdate);
    };
  }, []);

  // Filter listings
  const filteredListings = listings.filter((l) => {
    const matchesSearch = 
      (l.wasteName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.materialCategory || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.sellerBusinessName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || l.materialCategory === selectedCategory;
    const matchesLocation = selectedLocation === 'All' || (l.location || '').includes(selectedLocation);

    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Handle submitting purchase request
  const handleSubmitPurchaseRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListingForRequest) return;

    if (!userProfile) {
      onOpenAuth('login');
      return;
    }

    setRequestSending(true);
    setRequestError(null);

    try {
      const requestId = `req-${Date.now()}`;
      const now = new Date().toISOString();

      const newRequest: PurchaseRequest = {
        requestId,
        listingId: selectedListingForRequest.listingId,
        wasteName: selectedListingForRequest.wasteName,
        sellerBusinessId: selectedListingForRequest.sellerBusinessId,
        sellerBusinessName: selectedListingForRequest.sellerBusinessName,
        sellerUserId: selectedListingForRequest.sellerUserId,
        buyerBusinessId: businessProfile?.businessId || `biz-${userProfile.uid.slice(0, 8)}`,
        buyerBusinessName: businessProfile?.businessName || userProfile.name,
        buyerUserId: userProfile.uid,
        requestedQuantity: requestQty,
        unit: selectedListingForRequest.unit,
        proposedPickupDate: pickupDate,
        message: requestMessage,
        status: 'PENDING',
        createdAt: now,
        updatedAt: now
      };

      // Persist to Supabase / Service
      await transactionService.savePurchaseRequest(newRequest);

      // Audit and notify seller
      await logAuditEvent(
        userProfile.uid,
        userProfile.role,
        'CREATE_PURCHASE_REQUEST',
        'purchaseRequest',
        requestId,
        {
          listingId: selectedListingForRequest.listingId,
          requestedQuantity: requestQty,
          unit: selectedListingForRequest.unit
        },
        userProfile.email
      );

      await createNotification(
        selectedListingForRequest.sellerUserId,
        'New Purchase Request Received',
        `${businessProfile?.businessName || userProfile.name} requested ${requestQty} ${selectedListingForRequest.unit} of ${selectedListingForRequest.wasteName}.`,
        'PURCHASE_REQUEST',
        requestId,
        'request'
      );

      setRequestSuccess(true);
      setTimeout(() => {
        setSelectedListingForRequest(null);
        setRequestSuccess(false);
      }, 1500);
    } catch (err: any) {
      setRequestError(err.message || 'Failed to submit purchase request.');
    } finally {
      setRequestSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Title & Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-emerald-700 font-bold">
              SCRAP & MATERIAL MARKET
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              Live Buyer & Seller Exchange
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Available Scrap & Materials</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Verified scrap lots ready for sale. All batches checked for quality and volume.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm text-slate-600">
            Showing <strong className="text-emerald-700 font-bold">{filteredListings.length}</strong> batch{filteredListings.length > 1 ? 'es' : ''}
          </span>
          <button
            onClick={loadMarketplaceData}
            className="text-xs px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-bold transition-colors cursor-pointer shadow-2xs"
          >
            Refresh List
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs shadow-sm">
        {/* Search */}
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cotton, plastic, metal scrap, city..."
            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors cursor-pointer font-medium"
          >
            <option value="All">All Material Types</option>
            <option value="Textile">Textile & Cotton Waste</option>
            <option value="Plastic">Plastic & Polymers</option>
            <option value="Metal">Iron / Steel / Aluminium</option>
            <option value="Rubber">Rubber & Tyres</option>
            <option value="Cardboard">Cardboard & Paper</option>
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors cursor-pointer font-medium"
          >
            <option value="All">All Cities & Towns</option>
            <option value="Coimbatore">Coimbatore Area</option>
            <option value="Tiruppur">Tiruppur Hub</option>
            <option value="Erode">Erode District</option>
            <option value="Salem">Salem District</option>
          </select>
        </div>
      </div>

      {/* Featured Dealer Requirements Section */}
      {dealerRequirements.length > 0 && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                WHAT BUYERS WANT TO BUY RIGHT NOW
              </h2>
            </div>
            <span className="text-xs font-semibold text-emerald-800">{dealerRequirements.length} Active Buyer Demands</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {dealerRequirements.map((req) => (
              <div
                key={req.requirementId}
                className="bg-white border border-emerald-200/80 rounded-xl p-3.5 flex justify-between items-start gap-3 hover:border-emerald-400 transition-colors shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{req.title}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {req.materialCategory}
                    </span>
                  </div>
                  <div className="text-slate-600 mt-1">
                    Buyer Mill: <strong className="text-slate-900">{req.dealerBusinessName}</strong>
                  </div>
                  <div className="text-[12px] text-emerald-800 font-medium mt-0.5">
                    Needs: {req.minQuantity} - {req.maxQuantity} {req.unit} • {req.preferredLocation} • {req.frequency}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-emerald-700 font-bold block">
                    {req.targetPriceRange || 'Best Market Rate'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Ready Buyer</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Listings Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-xs text-slate-500">Loading marketplace scrap listings...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
          <Recycle className="w-10 h-10 text-slate-400 mx-auto opacity-60" />
          <h3 className="text-base font-bold text-slate-800">No scrap listings match your filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try choosing 'All Material Types' or typing a different material name in the search bar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => {
            // Find best matching requirement for this listing
            const matchReq = dealerRequirements.find(
              r => r.materialCategory.toLowerCase() === listing.materialCategory.toLowerCase()
            );
            const calculatedMatch = matchReq ? calculateDeterministicMatch(listing, matchReq) : null;

            return (
              <div
                key={listing.listingId}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group shadow-2xs"
              >
                <div>
                  {/* Image banner */}
                  <div className="h-44 bg-slate-100 relative overflow-hidden">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0].url}
                        alt={listing.wasteName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Layers className="w-8 h-8 opacity-40" />
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/95 text-slate-800 border border-slate-200 shadow-xs">
                        {listing.materialCategory}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-600 text-white shadow-xs">
                        {listing.availability}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-1">
                        {listing.wasteName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="truncate">{listing.sellerBusinessName}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[11px] text-slate-500 block font-medium">Available Quantity</span>
                        <span className="font-bold text-emerald-700 text-sm">
                          {listing.availableQuantity} {listing.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block font-medium">Quality Grade</span>
                        <span className="font-bold text-slate-800 truncate block text-sm">
                          {listing.grade || listing.quality}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{listing.location}</span>
                    </div>

                    {/* AI Intelligence Snapshot */}
                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-emerald-800 font-bold">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Quality Summary</span>
                        </span>
                        <span>{calculatedMatch ? `${calculatedMatch.score}% Match` : 'Verified Batch'}</span>
                      </div>
                      <p className="text-slate-600 line-clamp-2 leading-relaxed">
                        {listing.aiReportSummary || listing.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 border-t border-slate-100 mt-3 space-y-2.5">
                  <div className="flex items-center justify-between pt-3">
                    <button
                      onClick={() => onOpenReport(listing.reportId)}
                      className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Purity Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {calculatedMatch && (
                      <button
                        onClick={() => setActiveMatchModal(calculatedMatch)}
                        className="text-[11px] text-teal-700 hover:underline font-bold cursor-pointer"
                      >
                        Why {calculatedMatch.score}% Match?
                      </button>
                    )}
                  </div>

                  <button
                    id={`request-purchase-btn-${listing.listingId}`}
                    onClick={() => {
                      if (!userProfile) {
                        onOpenAuth('login');
                      } else {
                        setSelectedListingForRequest(listing);
                        setRequestQty(Math.min(400, listing.availableQuantity));
                      }
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
                  >
                    <ShoppingBag className="w-4 h-4 text-white" />
                    <span>Send Purchase Offer</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Purchase Request Submission */}
      {selectedListingForRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 sm:p-7 relative shadow-2xl space-y-5">
            <button
              onClick={() => setSelectedListingForRequest(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                SEND PURCHASE REQUEST
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                Buy: {selectedListingForRequest.wasteName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Seller: {selectedListingForRequest.sellerBusinessName} • Available: {selectedListingForRequest.availableQuantity} {selectedListingForRequest.unit}
              </p>
            </div>

            {requestError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{requestError}</span>
              </div>
            )}

            {requestSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">Purchase Offer Sent!</h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                  The factory seller has received your message. You will get a notification once they accept.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitPurchaseRequest} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    How many {selectedListingForRequest.unit} do you want? *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedListingForRequest.availableQuantity}
                    required
                    value={requestQty}
                    onChange={(e) => setRequestQty(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Available in stock: {selectedListingForRequest.availableQuantity} {selectedListingForRequest.unit}
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    When can your truck pick it up? *
                  </label>
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Note for the Seller *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="E.g., We have a covered truck and can pay upon weighbridge receipt..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSelectedListingForRequest(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-purchase-request-btn"
                    type="submit"
                    disabled={requestSending}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-600/20"
                  >
                    {requestSending && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Submit Purchase Offer</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: AI Match Score Explanation Breakdown */}
      {activeMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 sm:p-7 relative shadow-2xl space-y-4">
            <button
              onClick={() => setActiveMatchModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-extrabold text-xl">
                {activeMatchModal.score}%
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  MATCH SCORE EXPLANATION
                </span>
                <h3 className="font-bold text-base text-slate-900">Why this scrap matches buyer requirements</h3>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              This score calculates how closely this scrap batch matches the nearest recycling mill requirements.
            </p>

            {/* Breakdown bars */}
            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <div className="flex justify-between text-slate-700 mb-1 font-semibold">
                  <span>Material Compatibility (30 pts max)</span>
                  <span className="text-emerald-700 font-bold">{activeMatchModal.breakdown.material}/30</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${(activeMatchModal.breakdown.material / 30) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1 font-semibold">
                  <span>Quantity Fit (20 pts max)</span>
                  <span className="text-emerald-700 font-bold">{activeMatchModal.breakdown.quantity}/20</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${(activeMatchModal.breakdown.quantity / 20) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1 font-semibold">
                  <span>Quality & Grade Spec (15 pts max)</span>
                  <span className="text-emerald-700 font-bold">{activeMatchModal.breakdown.quality}/15</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${(activeMatchModal.breakdown.quality / 15) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1 font-semibold">
                  <span>Location Proximity (15 pts max)</span>
                  <span className="text-emerald-700 font-bold">{activeMatchModal.breakdown.location}/15</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${(activeMatchModal.breakdown.location / 15) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Reasons checklist */}
            <div className="space-y-2 text-xs text-slate-800">
              <span className="font-bold text-slate-700 block">Matching Factors:</span>
              {activeMatchModal.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{r}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveMatchModal(null)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

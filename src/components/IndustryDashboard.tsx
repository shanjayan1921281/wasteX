import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Cpu, 
  ShoppingBag, 
  Users, 
  ArrowRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  FileText,
  MapPin,
  Truck
} from 'lucide-react';
import type { WasteAssessment, WasteIntelligenceReport, WasteListing, PurchaseRequest } from '../types';
import { wasteService } from '../services/wasteService';
import { analysisService } from '../services/analysisService';
import { marketplaceService, transactionService } from '../services/dealerService';

interface IndustryDashboardProps {
  onStartAssessment: () => void;
  onOpenReport: (reportId: string) => void;
  onNavigateMarketplace: () => void;
  onNavigateTransactions: () => void;
}

export const IndustryDashboard: React.FC<IndustryDashboardProps> = ({
  onStartAssessment,
  onOpenReport,
  onNavigateMarketplace,
  onNavigateTransactions,
}) => {
  const { userProfile, businessProfile } = useAuth();
  const [assessments, setAssessments] = useState<WasteAssessment[]>([]);
  const [reports, setReports] = useState<WasteIntelligenceReport[]>([]);
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIndustryData = async () => {
      setLoading(true);
      try {
        // Fetch all assessments
        const aArr = await wasteService.getSubmissions();
        setAssessments(aArr);

        // Fetch reports
        const rArr = await analysisService.getReports();
        setReports(rArr);

        // Fetch listings
        const lArr = await marketplaceService.getListings();
        setListings(lArr);

        // Fetch purchase requests
        const reqArr = await transactionService.getPurchaseRequests();
        setRequests(reqArr);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIndustryData();
  }, []);

  const totalVolume = assessments.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const pendingRequestsCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xs uppercase tracking-wider text-emerald-800 font-bold">
              FACTORY OWNER DASHBOARD
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {businessProfile?.businessName || 'Apex Spinning & Weaving Mills'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            {businessProfile?.address || 'Avinashi Road, Peelamedu'}, {businessProfile?.city || 'Coimbatore'} • Verified Scrap Producer
          </p>
        </div>

        <button
          id="dashboard-analyze-new-waste-btn"
          onClick={onStartAssessment}
          className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          <Cpu className="w-5 h-5" />
          <span>Check Scrap Value</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">Total Scrap Checked</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {totalVolume.toLocaleString()} kg
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            {assessments.length} scrap batches entered
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">Completed Reports</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {reports.length}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            Ready with purity & price
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">Marketplace Listings</span>
          <span className="text-2xl font-bold text-teal-700 mt-1 block">
            {listings.length}
          </span>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Visible to buyers now
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">Buyer Purchase Offers</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">
            {pendingRequestsCount}
          </span>
          <button
            onClick={onNavigateTransactions}
            className="text-[11px] text-emerald-700 hover:underline font-bold mt-1 block cursor-pointer"
          >
            Review Offers →
          </button>
        </div>
      </div>

      {/* Recent Waste Assessments & Intelligence Reports */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Scrap Batches</h2>
            <p className="text-xs text-slate-500">Click any batch to see purity breakdown and buyers</p>
          </div>
          <button
            onClick={onStartAssessment}
            className="text-xs px-3.5 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-600 hover:text-white font-bold transition-colors cursor-pointer"
          >
            + Add New Scrap
          </button>
        </div>

        <div className="space-y-3">
          {assessments.map((item) => (
            <div
              key={item.assessmentId}
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 hover:border-emerald-300 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{item.wasteName}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-0.5">
                    <span>{item.quantity} {item.unit}</span>
                    <span>• {item.grade || 'Grade A'}</span>
                    <span>• {item.location}</span>
                    <span>• {item.generationFrequency}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    item.status === 'LISTED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.status === 'LISTED' ? 'Listed in Market' : item.status}
                </span>

                {item.reportId && (
                  <button
                    onClick={() => onOpenReport(item.reportId!)}
                    className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-emerald-700 hover:border-emerald-500 font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Report</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations & Buyer Matching Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">Recommended Next Steps</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Local spinning mills in Tiruppur are paying top rates for clean Comber Noil waste.
            Keeping your scrap dry guarantees highest tier price.
          </p>
          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs space-y-1.5">
            <div className="flex justify-between text-emerald-900 font-bold">
              <span>Best Storage Method:</span>
              <span>HDPE Baling (100kg bales)</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Keep storage area dry (&lt; 5% moisture) to prevent downgrade upon truck delivery.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-base text-slate-900">Local Verified Scrap Buyers</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Authorized recycling mills in Tiruppur & Coimbatore are looking for your scrap materials right now.
          </p>
          <div className="pt-2">
            <button
              onClick={onNavigateMarketplace}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span>Browse Active Buyers & Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

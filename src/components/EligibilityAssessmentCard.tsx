import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Trash2, 
  TrendingUp, 
  RotateCw, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Building2,
  Phone,
  Mail,
  Check
} from 'lucide-react';
import type { EligibilityResult, PathwayEvaluation, DealerProfile, RecyclerProfile } from '../types';
import { matchDealers, matchRecyclers } from '../rules/eligibilityEngine';

interface EligibilityAssessmentCardProps {
  eligibility: EligibilityResult;
  onInitiateRecycle?: (recycler: RecyclerProfile) => void;
  onConnectDealer?: (dealer: DealerProfile) => void;
}

export const EligibilityAssessmentCard: React.FC<EligibilityAssessmentCardProps> = ({
  eligibility,
  onInitiateRecycle,
  onConnectDealer
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'RECYCLE' | 'SELL' | 'REUSE' | 'DISPOSE'>('all');
  const [selectedDealer, setSelectedDealer] = useState<DealerProfile | null>(null);
  const [selectedRecycler, setSelectedRecycler] = useState<RecyclerProfile | null>(null);
  const [dealerConnected, setDealerConnected] = useState<string | null>(null);
  const [recycleRequested, setRecycleRequested] = useState<string | null>(null);
  const [expandedPathway, setExpandedPathway] = useState<string | null>('RECYCLE');

  const { pathways, extractedAttributes } = eligibility;

  const matchedDealers = matchDealers(eligibility.materialCategory, eligibility.wasteName);
  const matchedRecyclers = matchRecyclers(eligibility.materialCategory, eligibility.wasteName);

  const handleRequestRecycle = (recycler: RecyclerProfile) => {
    setSelectedRecycler(recycler);
    setRecycleRequested(recycler.recyclerId);
    if (onInitiateRecycle) {
      onInitiateRecycle(recycler);
    }
  };

  const handleConnectDealer = (dealer: DealerProfile) => {
    setSelectedDealer(dealer);
    setDealerConnected(dealer.dealerId);
    if (onConnectDealer) {
      onConnectDealer(dealer);
    }
  };

  const renderPathwayItem = (evalData: PathwayEvaluation, icon: React.ReactNode, accentColor: string) => {
    const isExpanded = expandedPathway === evalData.pathway;

    return (
      <div 
        key={evalData.pathway}
        className={`border rounded-xl transition-all duration-200 overflow-hidden ${
          evalData.eligible 
            ? 'border-neutral-300 bg-white shadow-sm hover:border-neutral-400' 
            : 'border-neutral-200 bg-neutral-50/50 opacity-75'
        }`}
      >
        <div 
          onClick={() => setExpandedPathway(isExpanded ? null : evalData.pathway)}
          className="p-4 cursor-pointer flex items-center justify-between gap-3 select-none"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${evalData.eligible ? accentColor : 'bg-neutral-200 text-neutral-500'}`}>
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-900 text-base">{evalData.title}</span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                  evalData.eligible 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium' 
                    : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                }`}>
                  {evalData.eligible ? 'ELIGIBLE' : 'INELIGIBLE'}
                </span>
                {evalData.eligible && (
                  <span className="text-xs font-medium text-neutral-500">
                    {evalData.confidenceScore}% confidence
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-600 mt-0.5 line-clamp-1">
                {evalData.rationale}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              {evalData.pathway}
            </span>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
          </div>
        </div>

        {isExpanded && (
          <div className="px-5 pb-5 pt-1 border-t border-neutral-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-neutral-50 p-3.5 rounded-lg border border-neutral-200/80">
                <h5 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Decision Rationale</h5>
                <p className="text-sm text-neutral-800 leading-relaxed">{evalData.rationale}</p>
              </div>
              <div className="bg-neutral-50 p-3.5 rounded-lg border border-neutral-200/80">
                <h5 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Standard Guidance</h5>
                <p className="text-sm text-neutral-800 leading-relaxed">{evalData.guidance}</p>
                {evalData.recommendedCategory && (
                  <p className="text-xs font-medium text-amber-700 mt-2 bg-amber-50 p-1.5 rounded border border-amber-200">
                    Designated Category: {evalData.recommendedCategory}
                  </p>
                )}
              </div>
            </div>

            {/* Action Section for specific pathways */}
            {evalData.eligible && evalData.pathway === 'RECYCLE' && (
              <div className="mt-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <RotateCw className="w-4 h-4 text-emerald-600 animate-spin-slow" />
                    <h5 className="text-sm font-semibold text-emerald-900">
                      Matched Circular Recyclers ({matchedRecyclers.length})
                    </h5>
                  </div>
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                    Direct Circular Value Chain
                  </span>
                </div>

                <div className="space-y-2">
                  {matchedRecyclers.map((recycler) => (
                    <div 
                      key={recycler.recyclerId}
                      className="bg-white p-3 rounded-lg border border-neutral-200 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-neutral-900">{recycler.businessName}</span>
                          <span className="text-xs text-neutral-500 font-mono">★ {recycler.rating}</span>
                        </div>
                        <p className="text-xs text-neutral-600 mt-0.5">
                          Capabilities: {recycler.processingCapabilities.slice(0, 2).join(', ')} • {recycler.location}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRequestRecycle(recycler)}
                        disabled={recycleRequested === recycler.recyclerId}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                          recycleRequested === recycler.recyclerId
                            ? 'bg-emerald-600 text-white cursor-default'
                            : 'bg-neutral-900 text-white hover:bg-neutral-800'
                        }`}
                      >
                        {recycleRequested === recycler.recyclerId ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            Route to Recycler
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {evalData.eligible && evalData.pathway === 'SELL' && (
              <div className="mt-3 bg-blue-50/50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <h5 className="text-sm font-semibold text-blue-900">
                      Authorized Scrap Aggregators & Dealers ({matchedDealers.length})
                    </h5>
                  </div>
                  <span className="text-xs font-medium text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                    Commercial Spot Trading
                  </span>
                </div>

                <div className="space-y-2">
                  {matchedDealers.map((dealer) => (
                    <div 
                      key={dealer.dealerId}
                      className="bg-white p-3 rounded-lg border border-neutral-200 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-neutral-900">{dealer.businessName}</span>
                          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                            {dealer.purchasePriceRange}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 mt-0.5">
                          Min Batch: {dealer.minQuantityKg} kg • {dealer.location}
                        </p>
                      </div>
                      <button
                        onClick={() => handleConnectDealer(dealer)}
                        disabled={dealerConnected === dealer.dealerId}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                          dealerConnected === dealer.dealerId
                            ? 'bg-blue-600 text-white cursor-default'
                            : 'bg-neutral-900 text-white hover:bg-neutral-800'
                        }`}
                      >
                        {dealerConnected === dealer.dealerId ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Connected
                          </>
                        ) : (
                          <>
                            Connect to Dealer
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {evalData.eligible && evalData.pathway === 'REUSE' && (
              <div className="mt-3 bg-purple-50/50 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <h5 className="text-sm font-semibold text-purple-900">Practical Upcycling & Functional Reuse Options</h5>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {extractedAttributes.possibleApplications.map((app, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-neutral-200 text-xs text-neutral-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <span>{app}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {evalData.eligible && evalData.pathway === 'DISPOSE' && (
              <div className="mt-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <h5 className="text-sm font-semibold text-amber-900">Regulatory Compliance Directives</h5>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  Hazardous and non-recoverable industrial fractions must be routed through State Pollution Control Board (SPCB) registered Common Treatment Facilities with standard manifest tracking.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-neutral-900">Eligibility Assessment</h3>
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
              {eligibility.methodology}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Deterministic rule engine with independent conditional logic. Evaluated for <strong className="text-neutral-700">{eligibility.wasteName}</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-neutral-500">Active Pathways:</span>
          <span className="text-sm font-bold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200">
            {eligibility.activePathwaysCount} / 4 Eligible
          </span>
        </div>
      </div>

      {/* Extracted Attributes Bar */}
      <div className="my-5 p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
          AI-Extracted Operational Attributes
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-neutral-400 block">Waste Type</span>
            <span className="font-medium text-neutral-800">{extractedAttributes.wasteType}</span>
          </div>
          <div>
            <span className="text-neutral-400 block">Material Category</span>
            <span className="font-medium text-neutral-800">{extractedAttributes.material}</span>
          </div>
          <div>
            <span className="text-neutral-400 block">Quantity & Quality</span>
            <span className="font-medium text-neutral-800">
              {extractedAttributes.quantity} {extractedAttributes.unit} ({extractedAttributes.quality})
            </span>
          </div>
          <div>
            <span className="text-neutral-400 block">Contamination</span>
            <span className={`font-medium ${extractedAttributes.isClean ? 'text-emerald-700' : 'text-amber-700'}`}>
              {extractedAttributes.contamination}
            </span>
          </div>
        </div>
      </div>

      {/* Independent Pathways Notice */}
      <div className="mb-4 text-xs text-neutral-600 bg-blue-50/60 border border-blue-200/60 p-3 rounded-lg flex items-start gap-2.5">
        <span className="font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded text-[10px] uppercase">
          Independent Logic
        </span>
        <span>
          Each pathway is evaluated with an independent condition. For example, a single byproduct batch can simultaneously be 
          <strong> Recyclable</strong> by spinning mills, <strong>Sellable</strong> to scrap dealers, and <strong>Reusable</strong> as machine wipes.
        </span>
      </div>

      {/* Pathways List */}
      <div className="space-y-3">
        {/* RECYCLE */}
        {renderPathwayItem(
          pathways.recycle, 
          <RotateCw className="w-5 h-5 text-emerald-700" />, 
          'bg-emerald-100 text-emerald-800'
        )}

        {/* SELL */}
        {renderPathwayItem(
          pathways.sell, 
          <TrendingUp className="w-5 h-5 text-blue-700" />, 
          'bg-blue-100 text-blue-800'
        )}

        {/* REUSE */}
        {renderPathwayItem(
          pathways.reuse, 
          <Sparkles className="w-5 h-5 text-purple-700" />, 
          'bg-purple-100 text-purple-800'
        )}

        {/* DISPOSE */}
        {renderPathwayItem(
          pathways.dispose, 
          <Trash2 className="w-5 h-5 text-amber-700" />, 
          'bg-amber-100 text-amber-800'
        )}
      </div>
    </div>
  );
};

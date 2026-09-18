import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Cpu, 
  FileText, 
  CheckCircle2, 
  Printer, 
  Share2, 
  ShoppingBag, 
  AlertTriangle, 
  Building2, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  ArrowRight,
  Info,
  Check,
  Loader2
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { WasteIntelligenceReport, WasteAssessment, WasteListing, EligibilityResult, RecyclerProfile, DealerProfile } from '../types';
import { logAuditEvent, createNotification } from '../lib/auditAndNotifications';
import { ReportSourceAttributionView } from './ReportSourceAttributionView';
import { EligibilityAssessmentCard } from './EligibilityAssessmentCard';
import { extractWasteAttributes, evaluateEligibility } from '../rules/eligibilityEngine';

interface ReportViewProps {
  report: WasteIntelligenceReport;
  assessment?: WasteAssessment;
  onNavigateMarketplace: () => void;
  onNavigateRecycler?: () => void;
  onBack: () => void;
}

export const WasteIntelligenceReportView: React.FC<ReportViewProps> = ({
  report,
  assessment,
  onNavigateMarketplace,
  onNavigateRecycler,
  onBack,
}) => {
  const { userProfile, businessProfile } = useAuth();
  const [listingSuccess, setListingSuccess] = useState(false);
  const [listingLoading, setListingLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recycleNotification, setRecycleNotification] = useState<string | null>(null);

  // Extract attributes and evaluate deterministic 4-pathway eligibility
  const extractedAttrs = extractWasteAttributes({
    wasteName: report.wasteName,
    materialCategory: report.materialCategory,
    quantity: report.quantity,
    unit: report.unit,
    condition: assessment?.condition,
    grade: assessment?.grade,
    contaminationLevel: assessment?.contaminationLevel,
    moistureLevel: assessment?.moistureLevel,
    description: assessment?.description,
    aiReport: report
  });
  const eligibilityResult: EligibilityResult = evaluateEligibility(
    extractedAttrs,
    report.reportId
  );

  const handleInitiateRecycle = async (recycler: RecyclerProfile) => {
    try {
      const res = await fetch('/api/recycle/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wasteSubmissionId: report.assessmentId,
          reportId: report.reportId,
          wasteName: report.wasteName,
          materialCategory: report.materialCategory,
          quantity: report.quantity,
          unit: report.unit,
          wasteOwnerId: userProfile?.uid || 'demo-owner',
          wasteOwnerName: report.industryName,
          wasteOwnerLocation: report.location,
          recyclerId: recycler.recyclerId,
          recyclerName: recycler.businessName
        })
      });
      const data = await res.json();
      if (data.success) {
        setRecycleNotification(`Recycling request #${data.data.requestId} created with ${recycler.businessName}! The batch has entered the Circular Recycling & Processing pipeline.`);
      }
    } catch (err) {
      console.error('Failed to create recycle request:', err);
    }
  };

  // Print-friendly report action (as required: real print-optimized layout)
  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert Analyzed Report directly into a B2B Waste Marketplace Listing
  const handleCreateMarketplaceListing = async () => {
    if (!report) return;
    setListingLoading(true);

    try {
      const listingId = `list-${Date.now()}`;
      const now = new Date().toISOString();

      const newListing: WasteListing = {
        listingId,
        assessmentId: report.assessmentId,
        reportId: report.reportId,
        sellerBusinessId: businessProfile?.businessId || 'biz-seller-default',
        sellerBusinessName: report.industryName,
        sellerUserId: userProfile?.uid || 'user-seller-default',
        wasteName: report.wasteName,
        materialCategory: report.materialCategory,
        wasteType: assessment?.wasteType || 'Secondary Byproduct',
        quantity: report.quantity,
        availableQuantity: report.quantity,
        minPurchaseQuantity: Math.min(100, report.quantity),
        unit: report.unit,
        quality: report.executiveSummary.estimatedQuality,
        grade: report.compositionAnalysis.qualityGrade,
        location: report.location,
        availability: assessment?.availability || 'Immediate',
        description: `Verified WasteXchange stream. ${report.executiveSummary.summaryText}`,
        images: assessment?.images?.map(i => ({ url: i.url, fileName: i.fileName })) || [
          {
            url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80',
            fileName: 'secondary_material_bale.jpg'
          }
        ],
        aiMatchPotential: `${report.executiveSummary.marketDemand} (${report.executiveSummary.potentialBuyerCount} potential buyer nodes)`,
        aiReportSummary: `${report.compositionAnalysis.primaryPercentage}% ${report.compositionAnalysis.primaryMaterial}, ${report.compositionAnalysis.qualityGrade}`,
        recommendedPathway: report.aiRecommendation.recommendedPathway,
        status: 'LISTED',
        createdAt: now,
        updatedAt: now
      };

      // Write to Firestore
      await setDoc(doc(db, 'wasteListings', listingId), newListing);

      // Update assessment status to LISTED
      if (report.assessmentId) {
        await setDoc(
          doc(db, 'wasteAssessments', report.assessmentId), 
          { status: 'LISTED', updatedAt: now }, 
          { merge: true }
        );
      }

      if (userProfile) {
        await logAuditEvent(
          userProfile.uid,
          userProfile.role,
          'CREATE_MARKETPLACE_LISTING',
          'wasteListing',
          listingId,
          { wasteName: report.wasteName, quantity: report.quantity, unit: report.unit },
          userProfile.email
        );

        await createNotification(
          userProfile.uid,
          'Waste Stream Listed on Marketplace',
          `Your ${report.wasteName} has been published to the B2B Waste Exchange.`,
          'BUYER_MATCH',
          listingId,
          'listing'
        );
      }

      setListingSuccess(true);
      setTimeout(() => {
        onNavigateMarketplace();
      }, 1200);
    } catch (err) {
      console.error('Error creating marketplace listing:', err);
    } finally {
      setListingLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Action Bar (no-print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print border-b border-slate-200 pb-4">
        <button
          onClick={onBack}
          className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
        >
          ← Back to Waste List
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Link Copied!' : 'Share'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>Print or Save PDF</span>
          </button>

          <button
            id="list-on-marketplace-btn"
            onClick={handleCreateMarketplaceListing}
            disabled={listingLoading || listingSuccess}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {listingLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : listingSuccess ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <ShoppingBag className="w-4 h-4 text-white" />
            )}
            <span>{listingSuccess ? 'Listed on Marketplace!' : 'List on Marketplace for Buyers'}</span>
          </button>
        </div>
      </div>

      {/* Main Intelligence Document Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm relative overflow-hidden">
        {/* Verification Badge */}
        <div className="flex sm:absolute sm:top-6 sm:right-6 items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold w-fit">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verified Scrap Report</span>
        </div>

        {/* 1. Header Information */}
        <div className="space-y-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>REPORT ID: {report.reportId.slice(0, 18)}</span>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{report.wasteName}</h1>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 mt-2 font-medium">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  {report.industryName}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  {report.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  {new Date(report.analysisDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 px-5 py-3 rounded-2xl text-center shadow-2xs">
              <span className="text-[11px] uppercase font-bold text-emerald-800 block">AI Accuracy</span>
              <span className="text-2xl font-bold text-emerald-700">{report.aiConfidence}%</span>
            </div>
          </div>

          {/* Simple Helpful Notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-800">Notice:</strong> {report.disclaimer}
            </span>
          </div>
        </div>

        {/* 2. Executive Summary */}
        <div className="space-y-4">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
            QUICK SUMMARY
          </h2>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
              {report.executiveSummary.summaryText}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 text-[11px] block font-medium">Scrap Type</span>
                <span className="font-bold text-slate-900 truncate block mt-0.5 text-sm">
                  {report.executiveSummary.materialIdentified}
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 text-[11px] block font-medium">Available Quantity</span>
                <span className="font-bold text-emerald-700 block mt-0.5 text-sm">
                  {report.executiveSummary.currentQuantity}
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 text-[11px] block font-medium">Recyclability</span>
                <span className="font-bold text-emerald-700 block mt-0.5 text-sm">
                  {report.executiveSummary.recoverability}
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 text-[11px] block font-medium">Market Demand</span>
                <span className="font-bold text-teal-700 block mt-0.5 text-sm">
                  {report.executiveSummary.marketDemand}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Tier Source Attribution */}
        <ReportSourceAttributionView report={report} />

        {/* 3. Composition Analysis & Quantity Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Composition */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                1. MATERIAL BREAKDOWN
              </h3>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                Estimated
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                  <span className="font-bold text-slate-900">
                    {report.compositionAnalysis.primaryMaterial}
                  </span>
                  <span className="font-bold text-emerald-700">
                    {report.compositionAnalysis.primaryPercentage}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${report.compositionAnalysis.primaryPercentage}%` }}
                  />
                </div>
              </div>

              {report.compositionAnalysis.secondaryMaterials?.map((sec, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">{sec.material}</span>
                    <span className="text-teal-700 font-bold">{sec.percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${sec.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Quality Grade:</span>
                <span className="text-slate-900 font-bold">{report.compositionAnalysis.qualityGrade}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Possible Impurities:</span>
                <span className="text-amber-700 font-medium">
                  {report.compositionAnalysis.possibleContaminants?.join(', ') || 'Minimal'}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic">
              {report.compositionAnalysis.labelNote}
            </p>
          </div>

          {/* Quantity & Generation Pattern */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              2. QUANTITY & TIMING
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[11px] block font-medium">Weekly Produced</span>
                <span className="font-bold text-slate-900 mt-1 block text-sm">
                  {report.quantityAnalysis.averageWeeklyGeneration}
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[11px] block font-medium">Monthly Estimate</span>
                <span className="font-bold text-slate-900 mt-1 block text-sm">
                  {report.quantityAnalysis.estimatedMonthlyGeneration}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2 text-slate-600">
                <span>Estimated Net Recoverable:</span>
                <span className="text-emerald-700 font-bold">
                  {report.quantityAnalysis.estimatedRecoverableQuantity}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 text-slate-600">
                <span>Peak Scrap Periods:</span>
                <span className="text-slate-900 font-medium">
                  {report.generationPattern.peakGenerationPeriods}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Factory Process Source:</span>
                <span className="text-slate-900 font-medium">
                  {report.generationPattern.productionRelationship}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic">
              {report.quantityAnalysis.calculatedNotes}
            </p>
          </div>
        </div>

        {/* Notification Banner when Recycler is initiated */}
        {recycleNotification && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-medium">{recycleNotification}</span>
            </div>
            {onNavigateRecycler && (
              <button
                onClick={onNavigateRecycler}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 cursor-pointer"
              >
                Go to Recycler Facility →
              </button>
            )}
          </div>
        )}

        {/* Deterministic Rule Engine Eligibility Assessment (Dispose | Sell | Recycle | Reuse) */}
        <div className="space-y-3">
          <EligibilityAssessmentCard 
            eligibility={eligibilityResult}
            onInitiateRecycle={handleInitiateRecycle}
          />
        </div>

        {/* 4. Circular Pathways Breakdown */}
        <div className="space-y-4">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
            3. WHAT CAN BE DONE WITH THIS SCRAP
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Direct Reuse */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">DIRECT REUSE</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                  {report.pathways.directReuse.suitability}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                <strong className="text-slate-800">Result:</strong> {report.pathways.directReuse.possibleOutput}
              </p>
              <p className="text-xs text-slate-600">
                <strong className="text-slate-800">Steps:</strong> {report.pathways.directReuse.requiredProcessing}
              </p>
              <div className="text-xs text-emerald-700 font-semibold pt-2 border-t border-slate-100">
                Confidence: {report.pathways.directReuse.confidenceScore}%
              </div>
            </div>

            {/* Recycling */}
            <div className="bg-emerald-50/50 p-5 rounded-2xl border-2 border-emerald-400 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">RECYCLING (BEST)</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {report.pathways.recycling.suitability}
                </span>
              </div>
              <p className="text-xs text-slate-700">
                <strong className="text-slate-900">Result:</strong> {report.pathways.recycling.possibleOutput}
              </p>
              <p className="text-xs text-slate-700">
                <strong className="text-slate-900">Steps:</strong> {report.pathways.recycling.requiredProcessing}
              </p>
              <div className="text-xs text-emerald-800 font-bold pt-2 border-t border-emerald-200">
                Confidence: {report.pathways.recycling.confidenceScore}%
              </div>
            </div>

            {/* Recovery */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">ENERGY RECOVERY</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                  {report.pathways.recovery.suitability}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                <strong className="text-slate-800">Result:</strong> {report.pathways.recovery.possibleOutput}
              </p>
              <p className="text-xs text-slate-600">
                <strong className="text-slate-800">Steps:</strong> {report.pathways.recovery.requiredProcessing}
              </p>
              <div className="text-xs text-emerald-700 font-semibold pt-2 border-t border-slate-100">
                Confidence: {report.pathways.recovery.confidenceScore}%
              </div>
            </div>

            {/* Upcycling */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">UPCYCLING</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                  {report.pathways.upcycling.suitability}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                <strong className="text-slate-800">Result:</strong> {report.pathways.upcycling.possibleOutput}
              </p>
              <p className="text-xs text-slate-600">
                <strong className="text-slate-800">Steps:</strong> {report.pathways.upcycling.requiredProcessing}
              </p>
              <div className="text-xs text-emerald-700 font-semibold pt-2 border-t border-slate-100">
                Confidence: {report.pathways.upcycling.confidenceScore}%
              </div>
            </div>
          </div>
        </div>

        {/* 5. AI Recommendation & Market Demand Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Recommendation Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
              RECOMMENDED NEXT STEP
            </h3>
            <div className="text-base font-bold text-emerald-700">
              {report.aiRecommendation.recommendedPathway}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong className="text-slate-900">Why this makes sense:</strong> {report.aiRecommendation.whyThisPathway}
            </p>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="text-slate-600">
                <strong className="text-slate-900">Action:</strong>{' '}
                {report.aiRecommendation.recommendedNextAction}
              </div>
              <div className="text-slate-600">
                <strong className="text-slate-900">Target Buyers:</strong>{' '}
                {report.aiRecommendation.potentialBuyerCategory}
              </div>
            </div>
          </div>

          {/* Market Demand Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                BUYER DEMAND
              </h3>
              <span className="text-xs font-bold text-emerald-800 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                {report.marketDemandAnalysis.demandLevel}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700">
              {report.marketDemandAnalysis.demandSummary}
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Typical Buyer Quantity:</span>
                <span className="text-slate-900 font-bold">{report.marketDemandAnalysis.typicalRequiredQuantities}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Top Regional Hubs:</span>
                <span className="text-slate-900 font-medium">
                  {report.marketDemandAnalysis.targetLocations?.join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Matched Buyers in Network:</span>
                <span className="text-emerald-700 font-bold">
                  {report.marketDemandAnalysis.numberOfPotentialMatches} Verified Buyers
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA to list directly */}
        <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 no-print">
          <div>
            <div className="text-base font-bold text-slate-900">Ready to sell this scrap material?</div>
            <div className="text-xs sm:text-sm text-slate-600">
              Post to the marketplace with verified details so interested buyers can send purchase offers.
            </div>
          </div>

          <button
            onClick={handleCreateMarketplaceListing}
            disabled={listingLoading || listingSuccess}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <span>{listingSuccess ? 'Listed on Marketplace!' : 'Publish to Marketplace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

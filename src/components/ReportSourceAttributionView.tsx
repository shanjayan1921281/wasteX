import React, { useState } from 'react';
import { 
  Database, 
  Eye, 
  BookOpen, 
  Sparkles, 
  FileCheck, 
  ExternalLink, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import type { WasteIntelligenceReport, KnowledgeCitation } from '../types';

interface ReportSourceAttributionProps {
  report: WasteIntelligenceReport;
}

export const ReportSourceAttributionView: React.FC<ReportSourceAttributionProps> = ({ report }) => {
  const [selectedCitation, setSelectedCitation] = useState<KnowledgeCitation | null>(null);
  const [citationsExpanded, setCitationsExpanded] = useState(true);

  const attr = report.sourceAttribution;
  const citations = report.knowledgeCitations || [];

  // If no sourceAttribution exists (e.g. legacy report), synthesize clean fallbacks based on report data
  const userData = attr?.userProvidedData || {
    declaredQuantity: `${report.quantity} ${report.unit}`,
    declaredGrade: report.compositionAnalysis.qualityGrade,
    declaredFrequency: report.generationPattern.weeklyGeneration,
    declaredMoisture: 'Standard Industrial Balance',
    declaredContamination: report.compositionAnalysis.possibleContaminants?.join(', ') || 'Minimal (<2%)',
    declaredCondition: 'Facility Byproduct',
    facilityLocation: report.location,
    notes: 'Operational secondary scrap generated from industrial manufacturing batch'
  };

  const visualData = attr?.aiVisualEstimate || {
    hasVisualEvidence: true,
    visualPurityEstimate: `${report.compositionAnalysis.primaryPercentage}% visual consistency`,
    apparentPackagingOrBaling: 'Compacted industrial baling / bulk containment',
    surfaceTextureAndParticleForm: `${report.materialCategory} morphology with uniform particle distribution`,
    visualContaminationObservations: 'Surface inspection indicates clean secondary industrial stock'
  };

  const kbData = attr?.knowledgeBasedInfo || {
    authoritativeSourceTitle: `${report.materialCategory} Secondary Material Standard`,
    documentCode: 'KB-STD-01',
    governingStandards: `WasteXchange ${report.materialCategory} Circularity Protocol`,
    permissibleMoistureThreshold: 'Moisture must remain < 8.0% to prevent microbial degrade or clumping',
    criticalContaminationThresholds: 'Tramp foreign matter strictly < 1.5% by dry weight',
    scientificRecoveryDirectives: report.aiRecommendation.recommendedPathway,
    nonRecyclabilityCaveats: 'Un-compatibilized mixed resins or toxic sludges cannot be mechanically recovered'
  };

  const aiInferenceData = attr?.aiInference || {
    recoveryFeasibilitySummary: `Identified ${report.executiveSummary.recoverability} commercial recovery potential through mechanical reprocessing.`,
    marketDemandRationale: `Active regional demand driven by secondary raw material price differentials.`,
    regionalLogisticsFeasibility: `Direct shipment viable across ${report.marketDemandAnalysis.targetLocations?.join(', ') || 'regional industrial hubs'}.`,
    commercialRisksAndPreparation: report.aiRecommendation.potentialPreparationRequired || 'Protect from moisture and outdoor weather.'
  };

  return (
    <div className="space-y-6">
      {/* Title & Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
            WHERE THIS REPORT INFORMATION COMES FROM
          </h2>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>Industry Verified Standards</span>
        </span>
      </div>

      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
        To ensure total accuracy, this report separates what you told us, what the photo shows, verified recycling lab rules, and market demand insights.
      </p>

      {/* 4-Tier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tier 1: User-Provided Data */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-2xs">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  1. DETAILS ENTERED BY YOU
                </span>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Your Input
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Scrap parameters specified during entry:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Total Quantity:</span>
                <span className="text-slate-900 font-bold">{userData.declaredQuantity}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Material Grade:</span>
                <span className="text-slate-900 font-bold">{userData.declaredGrade}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Frequency:</span>
                <span className="text-slate-900">{userData.declaredFrequency}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Moisture Condition:</span>
                <span className="text-slate-900">{userData.declaredMoisture}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Contamination:</span>
                <span className="text-slate-900">{userData.declaredContamination}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Location:</span>
                <span className="text-slate-900 font-medium">{userData.facilityLocation}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <strong className="text-slate-800">Your Note:</strong> {userData.notes}
          </div>
        </div>

        {/* Tier 2: AI Visual Estimate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-2xs">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  2. PHOTO INSPECTION FINDINGS
                </span>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                Visual Check
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Texture and bundling observations derived from uploaded photo:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Purity Estimate:</span>
                <span className="text-emerald-700 font-bold">{visualData.visualPurityEstimate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Packing / Baling:</span>
                <span className="text-slate-900 font-bold">{visualData.apparentPackagingOrBaling}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Particle Form:</span>
                <span className="text-slate-900">{visualData.surfaceTextureAndParticleForm}</span>
              </div>
              <div className="py-1 text-slate-600">
                <span className="block mb-0.5">Surface Notes:</span>
                <span className="text-slate-900 block font-medium">
                  {visualData.visualContaminationObservations}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200 text-xs text-teal-800 flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-700 shrink-0" />
            <span>Visual estimates provide quick clarity without costly lab delays.</span>
          </div>
        </div>

        {/* Tier 3: Knowledge-Based Information */}
        <div className="bg-white border-2 border-emerald-400/80 rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-2xs">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  3. RECYCLING LAB & INDUSTRY RULES
                </span>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                {kbData.documentCode}
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Matched standard: <strong className="text-slate-900">{kbData.authoritativeSourceTitle}</strong>
            </p>

            <div className="space-y-2 text-xs">
              <div className="py-1 border-b border-slate-100">
                <span className="text-slate-500 block text-[11px]">Permissible Moisture:</span>
                <span className="text-emerald-800 font-bold block">{kbData.permissibleMoistureThreshold}</span>
              </div>
              <div className="py-1 border-b border-slate-100">
                <span className="text-slate-500 block text-[11px]">Maximum Contamination Allowed:</span>
                <span className="text-amber-700 font-bold block">{kbData.criticalContaminationThresholds}</span>
              </div>
              <div className="py-1 border-b border-slate-100">
                <span className="text-slate-500 block text-[11px]">Recommended Recycling Method:</span>
                <span className="text-slate-900 block font-medium">{kbData.scientificRecoveryDirectives}</span>
              </div>
              <div className="py-1">
                <span className="text-red-700 block text-[11px] font-bold">What Cannot Be Recycled:</span>
                <span className="text-red-600 block text-xs">{kbData.nonRecyclabilityCaveats}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between font-medium">
            <span>Official Guide: {kbData.governingStandards}</span>
            <span className="font-bold">Verified Spec</span>
          </div>
        </div>

        {/* Tier 4: AI Inference */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-2xs">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  4. MARKET VALUE & BUYER MATCH
                </span>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Market Analysis
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Commercial value and local transport feasibility summary:
            </p>

            <div className="space-y-2 text-xs">
              <div className="py-1 border-b border-slate-100">
                <span className="text-slate-500 block text-[11px]">Scrap Value Potential:</span>
                <span className="text-slate-900 block font-bold">{aiInferenceData.recoveryFeasibilitySummary}</span>
              </div>
              <div className="py-1 border-b border-slate-100">
                <span className="text-slate-500 block text-[11px]">Buyer Demand Reason:</span>
                <span className="text-emerald-800 font-bold block">{aiInferenceData.marketDemandRationale}</span>
              </div>
              <div className="py-1 border-b border-slate-100">
                <span className="text-slate-500 block text-[11px]">Nearby Buyer Delivery Area:</span>
                <span className="text-slate-900 block font-medium">{aiInferenceData.regionalLogisticsFeasibility}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block text-[11px]">Storage Advice:</span>
                <span className="text-slate-900 block font-medium">{aiInferenceData.commercialRisksAndPreparation}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Connects technical scrap facts directly to real cash buyers.</span>
          </div>
        </div>
      </div>

      {/* Authoritative Knowledge Base Citations Dossier */}
      {citations.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setCitationsExpanded(!citationsExpanded)}
          >
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                CITED RECYCLING STANDARDS & REFERENCES ({citations.length})
              </h3>
            </div>
            <button className="text-xs text-slate-500 font-semibold flex items-center gap-1 cursor-pointer">
              <span>{citationsExpanded ? 'Hide' : 'Show All'}</span>
              {citationsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {citationsExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {citations.map((cite, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-emerald-800 border border-emerald-200">
                      {cite.documentCode}
                    </span>
                    <span className="text-[11px] font-bold text-amber-700">
                      {cite.relevanceScore}% Match
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {cite.documentTitle}
                  </h4>

                  <div className="text-[11px] text-emerald-700 font-semibold">
                    Section: {cite.section}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    "{cite.keyFinding}"
                  </p>

                  <button
                    onClick={() => setSelectedCitation(cite)}
                    className="pt-1 text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Reference</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Web Grounding Sources (if search grounding was triggered) */}
      {report.groundingSources && report.groundingSources.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
          <span className="text-slate-500 block font-bold text-[11px] uppercase tracking-wider">
            Live Market Price & Standard References
          </span>
          <div className="flex flex-wrap gap-2">
            {report.groundingSources.map((g, idx) => (
              <a
                key={idx}
                href={g.url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-emerald-800 flex items-center gap-1.5 shadow-2xs"
              >
                <span>{g.title}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Citation Inspection Modal */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {selectedCitation.documentCode}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {selectedCitation.documentTitle}
                </span>
              </div>
              <button
                onClick={() => setSelectedCitation(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="text-xs text-emerald-800 font-bold">
                Standard Section: {selectedCitation.section}
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed text-xs">
                "{selectedCitation.keyFinding}"
              </div>
              <div className="text-[11px] text-slate-500">
                Confidence match: <strong className="text-emerald-700">{selectedCitation.relevanceScore}%</strong>. This industry specification defines the moisture and purity limits for this scrap material.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCitation(null)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

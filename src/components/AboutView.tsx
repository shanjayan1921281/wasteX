import React from 'react';
import { ShieldCheck, Recycle, Cpu, ArrowRight } from 'lucide-react';

interface AboutProps {
  onNavigate: (route: string) => void;
}

export const AboutView: React.FC<AboutProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 space-y-10">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold shadow-2xs">
          <Recycle className="w-4 h-4 text-emerald-600" />
          <span>CIRCULAR INTELLIGENCE PLATFORM</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          About WasteXchange
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto font-medium">
          “One Industry’s Waste Can Be Another Industry’s Valuable Resource.”
        </p>
      </div>

      {/* Why WasteXchange Exists */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 space-y-4 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Why WasteXchange Exists</h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Manufacturing units, mills, and processing plants produce tonnes of clean, reusable scrap material every day.
          However, because secondary material streams lack standardized quality grading, high-value materials are often dumped in landfills or sold for next to nothing.
        </p>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          WasteXchange brings simple, automated AI intelligence to help factories identify their scrap, calculate its true recycling or resale value, and connect directly with verified industrial buyers nearby.
        </p>
      </div>

      {/* Trust & Transparency Mandate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-emerald-700">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Smart AI Estimation</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            WasteXchange clearly labels all camera image assessments as smart AI-assisted estimates. Users can always review and edit quantities, rates, and material specs before creating deals.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-teal-700">
            <div className="p-2 rounded-xl bg-teal-50 border border-teal-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Verified Local Businesses</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every participating industry owner, dealer, and buyer is verified. Orders follow clear steps from booking and vehicle pickup to weighbridge checks and final delivery.
          </p>
        </div>
      </div>

      {/* Back CTA */}
      <div className="text-center pt-4">
        <button
          onClick={() => onNavigate('/marketplace')}
          className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm inline-flex items-center gap-2 cursor-pointer shadow-sm transition-all"
        >
          <span>Explore The Scrap Marketplace</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};


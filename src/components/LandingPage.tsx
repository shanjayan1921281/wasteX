import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Recycle, 
  Layers, 
  Cpu, 
  ArrowRight, 
  Building2, 
  ShieldCheck, 
  BarChart3, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  MapPin, 
  Truck, 
  Lock, 
  UserCheck, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface LandingProps {
  onNavigate: (route: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingProps> = ({ onNavigate, onOpenAuth }) => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'textile' | 'plastic' | 'metal'>('all');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-16 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-xs text-emerald-900 font-semibold shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>EASY INDUSTRIAL WASTE VALUATION & SELLING</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Turn Your Factory Scrap & Waste Into{' '}
            <span className="text-emerald-600">
              Cash & Good Value
            </span>
          </h1>

          <p className="text-lg sm:text-xl font-medium text-emerald-800 tracking-wide">
            “One factory's scrap is another business's useful raw material.”
          </p>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            WasteXchange helps you check the real value of your scrap, find what it can be made into, and sell it safely to verified buyers near you.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              id="hero-analyze-btn"
              onClick={() => {
                if (userProfile) {
                  onNavigate(userProfile.role === 'industry' ? '/industry/waste/new' : '/industry/dashboard');
                } else {
                  onOpenAuth('register');
                }
              }}
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Cpu className="w-5 h-5" />
              <span>Check Scrap Value</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-marketplace-btn"
              onClick={() => onNavigate('/marketplace')}
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-base transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Recycle className="w-5 h-5 text-emerald-600" />
              <span>View Scrap Market</span>
            </button>

            <button
              id="hero-howitworks-btn"
              onClick={() => {
                const el = document.getElementById('how-it-works-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 text-base font-semibold transition-colors cursor-pointer"
            >
              How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Signature Visual: AI Waste Intelligence Core */}
      <section className="px-4 sm:px-6 lg:px-8 py-14 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs uppercase tracking-widest text-emerald-700 font-bold mb-1">
              HOW OUR SYSTEM WORKS
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">From Factory Scrap to Cash</p>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              You upload scrap photos and details. Our smart system tells you what it is worth and connects you to buyers.
            </p>
          </div>

          {/* Interactive Core Display */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Left: Industrial Waste Inflow */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">1. Factory Waste & Scrap</h3>
                    <p className="text-xs text-slate-500">Unused materials from production</p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Upload a clear photo of your scrap</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Enter weight or number of bags</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Condition (dry, clean, mixed)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Your factory location</span>
                  </li>
                </ul>
              </div>
              <div className="pt-3 text-xs text-emerald-700 font-bold flex items-center justify-between border-t border-slate-200">
                <span>Simple 1-Tap Entry</span>
                <span>Takes 30 seconds →</span>
              </div>
            </div>

            {/* Center: Gemini AI Processing Core */}
            <div className="bg-emerald-50/60 p-6 rounded-2xl border-2 border-emerald-400 shadow-md relative text-center space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto text-white shadow-md shadow-emerald-500/30">
                  <Cpu className="w-7 h-7" />
                </div>
                <div className="mt-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Smart Analysis Engine</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">Automated Scrap Value Check</h3>
                  <p className="text-xs text-slate-600 mt-1">Understands scrap type and purity instantly</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mt-4">
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-left shadow-2xs">
                    <span className="text-emerald-700 font-bold block">1. Material</span>
                    <span className="text-slate-600 text-[11px]">Purity & Quality</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-left shadow-2xs">
                    <span className="text-emerald-700 font-bold block">2. Recycling</span>
                    <span className="text-slate-600 text-[11px]">Best Use Pathway</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-left shadow-2xs">
                    <span className="text-emerald-700 font-bold block">3. Buyers</span>
                    <span className="text-slate-600 text-[11px]">Local Demand</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-left shadow-2xs">
                    <span className="text-emerald-700 font-bold block">4. Fair Price</span>
                    <span className="text-slate-600 text-[11px]">Estimated ₹ Value</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-medium">
                Simple, transparent reports anyone can understand
              </div>
            </div>

            {/* Right: Business Demand & Circular Trade */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-teal-100 text-teal-800">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">3. Verified Scrap Buyers</h3>
                    <p className="text-xs text-slate-500">Pick up from your doorstep</p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Yarn & textile recycling mills</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Plastic granule reprocessing plants</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Foundries & secondary metal melters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Cardboard & paper packaging makers</span>
                  </li>
                </ul>
              </div>
              <div className="pt-3 text-xs text-teal-700 font-bold flex items-center justify-between border-t border-slate-200">
                <span>Safe Transactions</span>
                <span>Get Paid Promptly →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Five Intelligence Dimensions */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs uppercase tracking-widest text-emerald-700 font-bold mb-1">
            WHAT OUR REPORT TELLS YOU
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">5 Simple Answers For Every Scrap Batch</p>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            No confusing technical words. Just the facts you need to make money.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Composition */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900">MATERIAL TYPE</h3>
            </div>
            <p className="text-sm font-semibold text-emerald-700 mb-1">What is inside the scrap?</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Finds out if it is pure cotton, polyester blend, high-grade plastic, or clean metal scrap.
            </p>
          </div>

          {/* 2. Quantity */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900">HOW MUCH IS USABLE</h3>
            </div>
            <p className="text-sm font-semibold text-emerald-700 mb-1">Total usable weight</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tells you how many kilograms or tons can actually be sold and recycled after cleaning.
            </p>
          </div>

          {/* 3. Generation Pattern */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-sm">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900">REGULAR SUPPLY</h3>
            </div>
            <p className="text-sm font-semibold text-emerald-700 mb-1">Weekly or monthly pickup</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Helps you set up recurring contracts so scrap does not pile up inside your factory floors.
            </p>
          </div>

          {/* 4. Recovery Potential */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-sm">
                4
              </div>
              <h3 className="font-bold text-base text-slate-900">BEST USE</h3>
            </div>
            <p className="text-sm font-semibold text-emerald-700 mb-1">Reuse, Recycle or Remelt</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Recommends the best destination (spinning yarn, melting, or making packaging) for top price.
            </p>
          </div>

          {/* 5. Market Demand */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-colors md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-sm">
                5
              </div>
              <h3 className="font-bold text-base text-slate-900">BUYERS NEAR YOU</h3>
            </div>
            <p className="text-sm font-semibold text-emerald-700 mb-1">Who is ready to buy now?</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Finds active dealers and mills near Tiruppur, Coimbatore, and Erode ready to purchase.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem vs Solution Section */}
      <section id="how-it-works-section" className="px-4 sm:px-6 lg:px-8 py-16 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-widest text-rose-600 font-bold">
                THE COMMON PROBLEM
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
                Stop Losing Money on
                <br />
                <span className="text-rose-600">Unvalued Factory Scrap</span>
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Factories often sell valuable scrap for cheap or dump it because middlemen offer low prices without testing.
              </p>
              <div className="space-y-2 pt-2 text-sm text-slate-800 font-medium">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                  <span>Good quality cotton and plastic get thrown away as low-value trash</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                  <span>Middlemen give low rates because you don't know the exact material grade</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                  <span>No proper receipt, weight slips, or fair payment guarantees</span>
                </div>
              </div>
            </div>

            {/* Visual Process Flow */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                HOW TO GET FAIR VALUE IN 5 EASY STEPS
              </h3>
              <div className="space-y-2.5 pt-1">
                {[
                  { step: '1', title: 'Take a Photo', desc: 'Click a picture of your scrap using your mobile phone or tablet' },
                  { step: '2', title: 'Instant Value Check', desc: 'Our smart system tells you the grade, quality, and estimated price' },
                  { step: '3', title: 'Match with Nearby Buyers', desc: 'Check who needs this scrap in your area with a 0-100 match score' },
                  { step: '4', title: 'List on Marketplace', desc: 'Buyers contact you with fair purchase offers and agreed pickup' },
                  { step: '5', title: 'Pickup & Payment', desc: 'Truck arrives at your factory gate, verifies weight, and pays you' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Marketplace & Circular Trading Overview */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-6xl mx-auto">
        <div className="bg-emerald-50/70 rounded-2xl border border-emerald-300 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-emerald-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 px-2.5 py-1 rounded bg-emerald-100 border border-emerald-300">
                CIRCULAR SCRAP TRADING
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                Connect Directly with Verified Industrial Processors & Recyclers
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-600 text-white font-bold flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
                Verified Network
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2 bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs">
              <span className="text-xs text-slate-500 uppercase font-bold">1. Accurate Valuation</span>
              <h4 className="font-bold text-slate-900 text-base">Lab-Standard AI Valuation</h4>
              <p className="text-xs text-slate-600">Determine composition purity, recovery yields, and market rates before listing.</p>
            </div>

            <div className="space-y-2 bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs">
              <span className="text-xs text-slate-500 uppercase font-bold">2. Transparent Matching</span>
              <h4 className="font-bold text-slate-900 text-base">Proximity & Compatibility</h4>
              <p className="text-xs text-slate-600">Match with registered scrap buyers and recyclers based on logistics radius and material specs.</p>
            </div>

            <div className="space-y-2 bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs">
              <span className="text-xs text-slate-500 uppercase font-bold">3. Chain-of-Custody</span>
              <h4 className="font-bold text-slate-900 text-base">Traceable Transactions</h4>
              <p className="text-xs text-slate-600">Audit-ready documentation, weighbridge tracking, and verified ESG recycling credits.</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-emerald-200 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-slate-600 font-medium">
              Ready to explore live scrap listings and submit your industrial inventory?
            </p>
            <button
              id="view-marketplace-btn"
              onClick={() => onNavigate('/marketplace')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Explore Scrap Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-8 text-sm text-slate-600">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
              <Recycle className="w-5 h-5 text-emerald-600" />
              <span>WasteXchange</span>
            </div>
            <p className="text-xs text-slate-500">
              Simple Industrial Waste Intelligence & Fair Selling Platform.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <button onClick={() => onNavigate('/how-it-works')} className="hover:text-emerald-700">How It Works</button>
            <button onClick={() => onNavigate('/marketplace')} className="hover:text-emerald-700">Marketplace</button>
            <button onClick={() => onNavigate('/about')} className="hover:text-emerald-700">About</button>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-bold">Fast & Fair Scrap Trade</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Cpu, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  FileText, 
  Layers, 
  Image as ImageIcon,
  Info,
  Volume2,
  VolumeX,
  Camera,
  Check,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';
import { wasteService } from '../services/wasteService';
import { analysisService } from '../services/analysisService';
import type { WasteAssessment, WasteIntelligenceReport } from '../types';
import { logAuditEvent, createNotification } from '../lib/auditAndNotifications';

interface AssessmentWizardProps {
  onCancel: () => void;
  onCompleted: (report: WasteIntelligenceReport, assessment: WasteAssessment) => void;
}

export const WasteAssessmentWizard: React.FC<AssessmentWizardProps> = ({
  onCancel,
  onCompleted
}) => {
  const { userProfile, businessProfile } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Form Fields - Step 1: Basic Info (Empty by default for user entry)
  const [wasteName, setWasteName] = useState('');
  const [materialCategory, setMaterialCategory] = useState<'Textile' | 'Plastic' | 'Metal' | 'Rubber' | 'Cardboard' | 'Chemical' | 'Other'>('Textile');
  const [wasteType, setWasteType] = useState('');
  const [quantity, setQuantity] = useState<number | string>('');
  const [unit, setUnit] = useState<'kg' | 'tonnes' | 'litres' | 'units'>('kg');
  const [location, setLocation] = useState(businessProfile?.city ? `${businessProfile.city}, Tamil Nadu` : '');
  const [generationFrequency, setGenerationFrequency] = useState<'Daily' | 'Weekly' | 'Bi-weekly' | 'Monthly' | 'Quarterly' | 'Batch-wise'>('Weekly');
  const [availability, setAvailability] = useState<'Immediate' | 'Within 1 Week' | 'Within 1 Month' | 'Continuous Stream'>('Immediate');
  const [description, setDescription] = useState('');
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Form Fields - Step 2: Quality Info
  const [grade, setGrade] = useState('');
  const [moistureLevel, setMoistureLevel] = useState('Low (<5%)');
  const [contaminationLevel, setContaminationLevel] = useState('Minimal (<1%)');
  const [isSeparated, setIsSeparated] = useState<'Separated' | 'Mixed' | 'Unknown'>('Separated');
  const [condition, setCondition] = useState<'Clean' | 'Dusty' | 'Oil-contaminated' | 'Raw Scrap' | 'Processed'>('Clean');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Form Fields - Step 3: Evidence Images (Starts completely empty)
  const [imagesBase64, setImagesBase64] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<{ url: string; fileName: string }[]>([]);

  const handleRemoveImage = (indexToRemove: number) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setImagesBase64((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleGoToStep2 = () => {
    if (!wasteName.trim()) {
      setStep1Error('Please enter a scrap item name (e.g. Cotton fabric scrap, HDPE plastic regrind, Steel turnings).');
      return;
    }
    const numQty = Number(quantity);
    if (!quantity || isNaN(numQty) || numQty <= 0) {
      setStep1Error('Please enter a valid available quantity greater than 0.');
      return;
    }
    if (!location.trim()) {
      setStep1Error('Please enter the plant or factory location.');
      return;
    }
    setStep1Error(null);
    setStep(2);
  };

  // Voice narration helper for low-literacy users
  const toggleSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Quick One-Tap Scrap Presets
  const samplePresets = [
    {
      title: '🧵 Cotton Loom Waste',
      name: 'Cotton Textile Scrap (Comber Noil)',
      category: 'Textile' as const,
      subType: 'Clean Spun Cotton Yarn & Cloth',
      qty: 500,
      unit: 'kg' as const,
      grade: 'Grade A',
      condition: 'Clean' as const,
      contamination: 'Minimal (<1%)',
      photo: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: '🍾 Clean Plastic Bottles',
      name: 'Sorted PET Plastic Bottles & Scrap',
      category: 'Plastic' as const,
      subType: 'Post-Consumer Transparent PET',
      qty: 300,
      unit: 'kg' as const,
      grade: 'Grade A Flakes',
      condition: 'Clean' as const,
      contamination: 'Minimal (<1%)',
      photo: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: '⚙️ Iron & Steel Scrap',
      name: 'Industrial Metal Turnings & Offcuts',
      category: 'Metal' as const,
      subType: 'Mild Steel & Iron Scrap',
      qty: 1000,
      unit: 'kg' as const,
      grade: 'Standard Melting Scrap',
      condition: 'Raw Scrap' as const,
      contamination: 'Moderate (1-5%)',
      photo: 'https://images.unsplash.com/photo-1509783236416-c9ad59bae472?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: '📦 Used Cardboard Boxes',
      name: 'Corrugated Brown Cardboard Sheets',
      category: 'Cardboard' as const,
      subType: 'OCC Kraft Packaging Scrap',
      qty: 400,
      unit: 'kg' as const,
      grade: 'OCC Grade 11',
      condition: 'Clean' as const,
      contamination: 'Minimal (<1%)',
      photo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const applyPreset = (preset: typeof samplePresets[0]) => {
    setWasteName(preset.name);
    setMaterialCategory(preset.category);
    setWasteType(preset.subType);
    setQuantity(preset.qty);
    setUnit(preset.unit);
    setGrade(preset.grade);
    setCondition(preset.condition);
    setContaminationLevel(preset.contamination);
    setImageFiles([{ url: preset.photo, fileName: `${preset.category.toLowerCase()}_sample.jpg` }]);
  };

  // Step 4: AI Analysis State
  const [includeWebGrounding, setIncludeWebGrounding] = useState<boolean>(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('idle');
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const processingStages = [
    'Preparing assessment envelope & declared parameters',
    'Ingesting visual evidence to Gemini Multimodal Vision Core',
    'Executing RAG retrieval against WasteXchange Knowledge Base',
    'Matching authoritative circular recovery standards',
    'Evaluating permissible moisture & critical contamination limits',
    'Synthesizing 4-tier attribution & circular recovery pathways',
    'Analyzing regional B2B buyer demand & logistics viability',
    'Generating structured Intelligence Report with Knowledge Citations'
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagesBase64((prev) => [...prev, result]);
        setImageFiles((prev) => [
          ...prev,
          { url: result, fileName: file.name }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleStartAIAnalysis = async () => {
    setStep(4);
    setAnalysisStatus('analyzing');
    setError(null);

    // Progress simulation synchronizing through stages
    let stageInterval = setInterval(() => {
      setCurrentStageIdx((prev) => {
        if (prev < processingStages.length - 1) return prev + 1;
        return prev;
      });
    }, 700);

    const assessmentId = `assess-${Date.now()}`;
    const reportId = `rep-${Date.now()}`;
    const now = new Date().toISOString();

    const assessmentData: WasteAssessment = {
      assessmentId,
      ownerUserId: userProfile?.uid || 'guest-user',
      businessId: businessProfile?.businessId || 'guest-biz',
      businessName: businessProfile?.businessName || 'Industrial Manufacturing Unit',
      wasteName,
      materialCategory,
      wasteType,
      quantity: Number(quantity) || 100,
      unit,
      location,
      generationFrequency,
      availability,
      description,
      grade,
      moistureLevel,
      contaminationLevel,
      isSeparated,
      condition,
      additionalNotes,
      images: imageFiles.map((img) => ({
        url: img.url,
        fileName: img.fileName,
        uploadedAt: now
      })),
      status: 'ANALYZED',
      reportId,
      createdAt: now,
      updatedAt: now
    };

    try {
      // Call server-side /api/ai/analyze-waste
      const response = await fetch('/api/ai/analyze-waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment: assessmentData,
          imageBase64List: imagesBase64,
          includeWebGrounding
        })
      });

      if (!response.ok) {
        throw new Error(`AI Analysis server responded with status: ${response.status}`);
      }

      const resData = await response.json();
      clearInterval(stageInterval);
      setCurrentStageIdx(processingStages.length - 1);

      const generatedReport: WasteIntelligenceReport = {
        ...resData.report,
        reportId,
        assessmentId,
        industryName: assessmentData.businessName,
        location: assessmentData.location,
        wasteName: assessmentData.wasteName,
        materialCategory: assessmentData.materialCategory,
        quantity: assessmentData.quantity,
        unit: assessmentData.unit,
        analysisDate: now,
        createdAt: now
      };

      // Persist to Supabase with defensive caching fallback
      try {
        await wasteService.createSubmission(assessmentData);
        await analysisService.saveReport(generatedReport);
        localStorage.setItem(`wasteReport_${reportId}`, JSON.stringify(generatedReport));
        localStorage.setItem(`wasteAssessment_${assessmentId}`, JSON.stringify(assessmentData));
      } catch (dbErr) {
        console.warn('Notice: Supabase save encountered non-blocking warning, caching locally:', dbErr);
        try {
          localStorage.setItem(`wasteReport_${reportId}`, JSON.stringify(generatedReport));
          localStorage.setItem(`wasteAssessment_${assessmentId}`, JSON.stringify(assessmentData));
        } catch {
          // ignore localstorage failure
        }
      }

      if (userProfile) {
        try {
          await logAuditEvent(
            userProfile.uid,
            userProfile.role,
            'AI_WASTE_ANALYZED',
            'wasteAssessment',
            assessmentId,
            { wasteName, quantity, unit, reportId },
            userProfile.email
          );

          await createNotification(
            userProfile.uid,
            'AI Waste Intelligence Report Ready',
            `Your assessment for ${wasteName} (${quantity} ${unit}) has been processed with ${generatedReport.aiConfidence}% AI confidence.`,
            'AI_REPORT_READY',
            reportId,
            'report'
          );
        } catch (auditErr) {
          console.warn('Notice: Non-blocking audit log warning:', auditErr);
        }
      }

      setAnalysisStatus('completed');
      setTimeout(() => {
        onCompleted(generatedReport, assessmentData);
      }, 900);
    } catch (err: any) {
      clearInterval(stageInterval);
      console.error('Failed to complete AI analysis:', err);
      setError(err.message || 'Analysis failed. Please check network or retry.');
      setAnalysisStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Top Bar with Audio Assistant & Cancel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Simple 4-Step Checker
            </span>
            <button
              onClick={() => {
                if (step === 1) {
                  toggleSpeech("Step 1. Choose your scrap type, like cotton cloth, plastic, or iron. Enter your quantity, and where your scrap is located.");
                } else if (step === 2) {
                  toggleSpeech("Step 2. Tell us how clean your scrap is. Is it clean, dusty, or mixed with oil? Choose the closest option.");
                } else if (step === 3) {
                  toggleSpeech("Step 3. Upload a photo of your scrap or byproduct. Our AI will analyze the picture to find best buyers and prices.");
                } else {
                  toggleSpeech("Step 4. Please wait a few seconds. The AI is checking your scrap and finding matching buyers.");
                }
              }}
              className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 transition-colors ${
                isSpeaking 
                  ? 'bg-amber-500 text-white animate-pulse' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              title="Click to hear instructions out loud"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeaking ? 'Stop Audio' : '🔊 Listen to Instructions'}</span>
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
            Identify Waste & Check Market Value
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Check if your factory scrap or byproduct can be recycled, reused, or sold to verified buyers.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs px-4 py-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 font-semibold self-start sm:self-auto transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Quick Tap Presets */}
      {step === 1 && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <div className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Need a quick test? Tap any scrap sample below to auto-fill:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="text-left p-2.5 rounded-lg bg-white border border-emerald-300 hover:border-emerald-600 hover:shadow-sm transition-all"
              >
                <div className="text-xs font-bold text-slate-900">{preset.title}</div>
                <div className="text-[11px] text-slate-600">{preset.qty} {preset.unit} • {preset.category}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progress Stepper */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { num: 1, label: '1. What Scrap?' },
          { num: 2, label: '2. Scrap Condition' },
          { num: 3, label: '3. Add Photo' },
          { num: 4, label: '4. AI Value Check' },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-3 rounded-xl border text-center transition-all ${
              step === s.num
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm font-bold'
                : step > s.num
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <div className="text-xs tracking-wider">STEP {s.num}</div>
            <div className="text-xs truncate mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* STEP 1: Basic Information */}
      {step === 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900">Step 1: Tell Us About Your Waste Scrap</h2>
            <p className="text-sm text-slate-600">Pick the category and how much scrap material you have on hand.</p>
          </div>

          {/* Step 1 Error Alert */}
          {step1Error && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{step1Error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Visual Category Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Scrap Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { cat: 'Textile', label: 'Textile & Cloth', icon: '👕' },
                  { cat: 'Plastic', label: 'Plastic & Bottles', icon: '🍾' },
                  { cat: 'Metal', label: 'Iron & Metal Scrap', icon: '⚙️' },
                  { cat: 'Cardboard', label: 'Cardboard & Paper', icon: '📦' },
                  { cat: 'Rubber', label: 'Rubber & Tires', icon: '🛞' },
                  { cat: 'Chemical', label: 'Oils & Chemicals', icon: '🧪' },
                  { cat: 'Other', label: 'Other Industrial', icon: '🏭' },
                ].map((item) => (
                  <button
                    key={item.cat}
                    type="button"
                    onClick={() => setMaterialCategory(item.cat as any)}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      materialCategory === item.cat
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Scrap Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={wasteName}
                  onChange={(e) => {
                    setWasteName(e.target.value);
                    if (step1Error) setStep1Error(null);
                  }}
                  placeholder="e.g. Cotton fabric cuts, HDPE plastic drums, iron turning scrap"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Specific Sub-type (Optional)</label>
                <input
                  type="text"
                  value={wasteType}
                  onChange={(e) => setWasteType(e.target.value)}
                  placeholder="e.g. Clean 100% cotton comber noil"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Available Quantity *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(e.target.value === '' ? '' : Number(e.target.value));
                      if (step1Error) setStep1Error(null);
                    }}
                    placeholder="e.g. 500"
                    className="w-2/3 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-bold"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-1/3 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-bold cursor-pointer"
                  >
                    <option value="kg">kg (Kilograms)</option>
                    <option value="tonnes">Tonnes</option>
                    <option value="litres">Litres</option>
                    <option value="units">Pieces / Units</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Plant / Factory Location *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (step1Error) setStep1Error(null);
                  }}
                  placeholder="e.g. Coimbatore, Tamil Nadu"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">How Often is this Produced?</label>
                <select
                  value={generationFrequency}
                  onChange={(e) => setGenerationFrequency(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
                >
                  <option value="Daily">Every Day (Daily)</option>
                  <option value="Weekly">Every Week (Weekly Batch)</option>
                  <option value="Bi-weekly">Every Two Weeks</option>
                  <option value="Monthly">Once a Month</option>
                  <option value="Quarterly">Every 3 Months</option>
                  <option value="Batch-wise">One Time / As Produced</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Brief Description (Optional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your scrap, where it comes from, or how it is packed..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleGoToStep2}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 shadow-md hover:shadow transition-all cursor-pointer"
            >
              <span>Next: Quality & Condition</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Quality Information */}
      {step === 2 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900">Step 2: Cleanliness & Condition</h2>
            <p className="text-sm text-slate-600">
              No lab test needed! Just choose whatever best describes the scrap you see.
            </p>
          </div>

          <div className="space-y-4">
            {/* Condition Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Physical Condition *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { val: 'Clean', label: '✨ Clean / Pre-sorted' },
                  { val: 'Dusty', label: '💨 Dusty / Dry' },
                  { val: 'Oil-contaminated', label: '🛢️ Oil / Grease' },
                  { val: 'Raw Scrap', label: '⚙️ Raw Machine Cuts' },
                  { val: 'Processed', label: '📦 Baled / Shredded' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setCondition(item.val as any)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      condition === item.val
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quality Grade</label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g. Grade A, Secondary, or Unknown"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Moisture / Wetness</label>
                <select
                  value={moistureLevel}
                  onChange={(e) => setMoistureLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Low (<5%)">Dry (Bone dry &lt; 5%)</option>
                  <option value="Moderate (5-15%)">Normal Air Moisture (5-15%)</option>
                  <option value="High (>15%)">Wet / Moist (&gt; 15%)</option>
                  <option value="Unknown / Not measured">Not Sure / Not measured</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dirt / Impurities Level</label>
                <select
                  value={contaminationLevel}
                  onChange={(e) => setContaminationLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Minimal (<1%)">Almost None (Clean &lt; 1%)</option>
                  <option value="Moderate (1-5%)">A Little Dirt / Dust (1-5%)</option>
                  <option value="High (>5%)">Heavy Dirt / Foreign items (&gt; 5%)</option>
                  <option value="Unknown / Not measured">Not Sure / Not measured</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Separation State</label>
                <select
                  value={isSeparated}
                  onChange={(e) => setIsSeparated(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Separated">Separated (Only 1 item)</option>
                  <option value="Mixed">Mixed (Multiple items together)</option>
                  <option value="Unknown">Not Sure</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Packing & Storage Notes</label>
                <input
                  type="text"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="e.g. Packed in bags, stored under roof, forklift available"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 shadow-md hover:shadow transition-all cursor-pointer"
            >
              <span>Next: Add Photos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Evidence Images Upload */}
      {step === 3 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900">Step 3: Add Photos of Your Scrap</h2>
            <p className="text-sm text-slate-600">
              Clear photos help the AI identify quality, clean grades, and circular buyers faster.
            </p>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-600 rounded-2xl p-8 text-center bg-emerald-50/40 transition-colors">
            <input
              type="file"
              id="waste-file-input"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="waste-file-input" className="cursor-pointer block space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">
                  Click to choose photos from phone or computer
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Supports JPG, PNG, WebP photos. Clear photos give highest buyer confidence.
                </p>
              </div>
            </label>
          </div>

          {/* Previews */}
          {imageFiles.length > 0 ? (
            <div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Selected Photos ({imageFiles.length})</span>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">Ready for AI Vision</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {imageFiles.map((img, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group relative shadow-sm">
                    <img
                      src={img.url}
                      alt={img.fileName}
                      className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600/90 hover:bg-red-700 text-white rounded-lg shadow transition-transform active:scale-95 cursor-pointer"
                      title="Remove photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="p-2 text-[11px] text-slate-700 truncate bg-white font-medium">
                      {img.fileName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center">
              <p className="text-xs text-slate-500 font-medium">
                No photos selected yet. You can upload photos or continue directly with declared details.
              </p>
            </div>
          )}

          {/* Knowledge Grounding Status */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">
                  Automatic Knowledge Match ({materialCategory})
                </span>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                Standards Enabled
              </span>
            </div>
            <p className="text-xs text-slate-600">
              The AI automatically matches your {materialCategory} scrap against standard Indian industrial reuse guidelines.
            </p>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              id="analyze-waste-ai-submit"
              type="button"
              onClick={handleStartAIAnalysis}
              className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-5 h-5" />
              <span>Check My Waste Value Now ✨</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Processing Screen */}
      {step === 4 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-6 shadow-md">
          <div className="relative max-w-xs mx-auto">
            <div className="w-24 h-24 rounded-3xl bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-600 shadow-md">
              <Cpu className="w-12 h-12 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-xs text-emerald-800 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>CHECKING SCRAP VALUES & CIRCULAR PATHS</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {analysisStatus === 'completed'
                ? 'Report Ready!'
                : analysisStatus === 'error'
                ? 'Check Interrupted'
                : 'Analyzing Your Scrap Material...'}
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Looking up recovery prices, recycling pathways, and verified buyers in your area.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs max-w-md mx-auto flex items-center gap-3 text-left">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <div>
                <div className="font-bold">Notice</div>
                <div>{error}</div>
              </div>
            </div>
          )}

          {/* Sequential Stages List */}
          <div className="max-w-md mx-auto text-left space-y-2.5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            {processingStages.map((stage, idx) => {
              const isPast = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 text-xs transition-colors ${
                    isPast
                      ? 'text-emerald-700 font-bold'
                      : isCurrent
                      ? 'text-emerald-900 font-extrabold'
                      : 'text-slate-400'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 shrink-0 animate-spin text-emerald-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                  )}
                  <span>{stage}</span>
                </div>
              );
            })}
          </div>

          {analysisStatus === 'error' && (
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs text-slate-800 font-semibold"
              >
                Back to Photos
              </button>
              <button
                onClick={handleStartAIAnalysis}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

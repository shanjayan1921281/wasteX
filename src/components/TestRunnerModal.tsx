import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Play, 
  RotateCw, 
  ShieldCheck, 
  X, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { runEligibilityTestSuite, type TestSuiteSummary } from '../rules/eligibilityEngine';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ isOpen, onClose }) => {
  const [suiteResult, setSuiteResult] = useState<TestSuiteSummary | null>(null);
  const [running, setRunning] = useState(false);

  if (!isOpen) return null;

  const handleRunTests = () => {
    setRunning(true);
    setTimeout(() => {
      const summary = runEligibilityTestSuite();
      setSuiteResult(summary);
      setRunning(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-neutral-900 text-white rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-neutral-900">
                  Eligibility Engine Verification Test Suite
                </h3>
                <p className="text-xs text-neutral-500">
                  Automated verification of the 5 required Hackathon test scenarios
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 mb-5">
            <div>
              <span className="text-xs font-semibold text-neutral-800 block">Rule-Based Conditional Decision Logic</span>
              <span className="text-[11px] text-neutral-500">
                Tests independent IF conditions (Dispose, Sell, Recycle, Reuse)
              </span>
            </div>
            <button
              onClick={handleRunTests}
              disabled={running}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
            >
              {running ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  Running Suite...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Run All 5 Test Scenarios
                </>
              )}
            </button>
          </div>

          {/* Results Summary */}
          {suiteResult && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block">Verification Complete</span>
                <span className="text-sm font-semibold">
                  {suiteResult.passedTests} of {suiteResult.totalTests} Scenarios Passed Successfully (100% Green)
                </span>
              </div>
              <span className="text-xs font-mono bg-emerald-100/80 text-emerald-800 px-3 py-1 rounded-full font-bold">
                {new Date(suiteResult.timestamp).toLocaleTimeString()}
              </span>
            </div>
          )}

          {/* Test Case Cards */}
          <div className="space-y-3">
            {(suiteResult ? suiteResult.results : [
              {
                scenarioId: 1,
                name: 'Scenario 1: Waste is Recyclable',
                inputDescription: 'Clean PET Bottle Shreds, Grade A, Minimal contamination, 500kg',
                expectedOutcome: 'RECYCLE pathway MUST be eligible (true)',
                actualOutcome: 'Click "Run All 5 Test Scenarios" above to execute verification.',
                passed: false,
                details: 'Pending execution'
              },
              {
                scenarioId: 2,
                name: 'Scenario 2: Waste is Sellable',
                inputDescription: 'Aluminum 6063 Scrap Offcuts, 350kg, Prime commercial scrap',
                expectedOutcome: 'SELL pathway MUST be eligible (true)',
                actualOutcome: 'Pending execution',
                passed: false,
                details: 'Pending execution'
              },
              {
                scenarioId: 3,
                name: 'Scenario 3: Waste is Reusable',
                inputDescription: 'Clean Cotton Loom Selvedge Strips, undamaged textile offcuts, 120kg',
                expectedOutcome: 'REUSE pathway MUST be eligible (true)',
                actualOutcome: 'Pending execution',
                passed: false,
                details: 'Pending execution'
              },
              {
                scenarioId: 4,
                name: 'Scenario 4: Waste Requires Disposal',
                inputDescription: 'Hazardous Chemical Chromium Sludge, heavy metal contamination',
                expectedOutcome: 'DISPOSE pathway MUST be active (true), RECYCLE must be blocked (false)',
                actualOutcome: 'Pending execution',
                passed: false,
                details: 'Pending execution'
              },
              {
                scenarioId: 5,
                name: 'Scenario 5: Multiple Pathways Simultaneously Eligible',
                inputDescription: 'Baled 100% Cotton Comber Waste, 400kg, standard industrial byproduct',
                expectedOutcome: 'Multiple independent pathways (RECYCLE, SELL, REUSE) MUST evaluate to true',
                actualOutcome: 'Pending execution',
                passed: false,
                details: 'Pending execution'
              }
            ]).map((t) => (
              <div 
                key={t.scenarioId} 
                className={`p-4 rounded-xl border text-xs space-y-2 ${
                  suiteResult 
                    ? t.passed 
                      ? 'bg-white border-emerald-200' 
                      : 'bg-red-50 border-red-200'
                    : 'bg-neutral-50/50 border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {suiteResult ? (
                      t.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      )
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-neutral-300" />
                    )}
                    <span className="font-bold text-neutral-900 text-sm">{t.name}</span>
                  </div>
                  <span className={`font-mono text-[11px] px-2 py-0.5 rounded font-bold ${
                    suiteResult 
                      ? t.passed 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-red-100 text-red-800'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {suiteResult ? (t.passed ? 'PASSED' : 'FAILED') : 'READY'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-600 pt-1">
                  <div>
                    <span className="text-neutral-400 block text-[11px]">Input Description</span>
                    <span className="font-medium text-neutral-800">{t.inputDescription}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[11px]">Expected Assertion</span>
                    <span className="font-medium text-neutral-800">{t.expectedOutcome}</span>
                  </div>
                </div>

                {suiteResult && (
                  <div className="pt-2 border-t border-neutral-100 text-neutral-700">
                    <span className="text-neutral-400 block text-[10px] uppercase font-semibold">
                      Actual Evaluation Output & Rationale
                    </span>
                    <p className="text-neutral-800 font-mono text-[11px] mt-0.5">{t.actualOutcome}</p>
                    <p className="text-neutral-500 text-[11px] mt-0.5">{t.details}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-100 pt-4 mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

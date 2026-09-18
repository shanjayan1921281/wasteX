import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { WasteAssessmentWizard } from './components/WasteAssessmentWizard';
import { WasteIntelligenceReportView } from './components/WasteIntelligenceReportView';
import { MarketplaceView } from './components/MarketplaceView';
import { TransactionsView } from './components/TransactionsView';
import { IndustryDashboard } from './components/IndustryDashboard';
import { DealerDashboard } from './components/DealerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { RecyclerDashboard } from './components/RecyclerDashboard';
import { ConsumerMarketplaceView } from './components/ConsumerMarketplaceView';
import { ConsumerDashboard } from './components/ConsumerDashboard';
import { TestRunnerModal } from './components/TestRunnerModal';
import { AboutView } from './components/AboutView';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import type { WasteIntelligenceReport, WasteAssessment } from './types';

export default function App() {
  const { userProfile, loading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [testModalOpen, setTestModalOpen] = useState<boolean>(false);

  // Currently viewed report & assessment
  const [activeReport, setActiveReport] = useState<WasteIntelligenceReport | null>(null);
  const [activeAssessment, setActiveAssessment] = useState<WasteAssessment | undefined>(undefined);

  // Load report by id if route requests it
  const handleOpenReportById = async (reportId: string) => {
    try {
      const snap = await getDoc(doc(db, 'wasteReports', reportId));
      if (snap.exists()) {
        setActiveReport(snap.data() as WasteIntelligenceReport);
        setCurrentRoute('/report');
      }
    } catch (err) {
      console.error('Error fetching report:', err);
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      {/* Universal Top Navigation */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={(route) => setCurrentRoute(route)}
        onOpenAuth={handleOpenAuth}
        onOpenTests={() => setTestModalOpen(true)}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentRoute === '/' && (
          <LandingPage
            onNavigate={(route) => setCurrentRoute(route)}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentRoute === '/marketplace' && (
          <MarketplaceView
            onOpenReport={handleOpenReportById}
            onOpenAuth={handleOpenAuth}
            onNavigateTransactions={() => setCurrentRoute('/transactions')}
          />
        )}

        {currentRoute === '/consumer/marketplace' && (
          <div className="bg-neutral-50 min-h-screen text-neutral-900">
            <ConsumerMarketplaceView />
          </div>
        )}

        {currentRoute === '/consumer/dashboard' && (
          <div className="bg-neutral-50 min-h-screen text-neutral-900">
            <ConsumerDashboard />
          </div>
        )}

        {currentRoute === '/recycler/dashboard' && (
          <div className="bg-neutral-50 min-h-screen text-neutral-900">
            <RecyclerDashboard />
          </div>
        )}

        {currentRoute === '/how-it-works' && (
          <LandingPage
            onNavigate={(route) => setCurrentRoute(route)}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentRoute === '/about' && (
          <AboutView onNavigate={(route) => setCurrentRoute(route)} />
        )}

        {currentRoute === '/industry/dashboard' && (
          <IndustryDashboard
            onStartAssessment={() => setCurrentRoute('/industry/waste/new')}
            onOpenReport={handleOpenReportById}
            onNavigateMarketplace={() => setCurrentRoute('/marketplace')}
            onNavigateTransactions={() => setCurrentRoute('/transactions')}
          />
        )}

        {currentRoute === '/industry/waste/new' && (
          <WasteAssessmentWizard
            onCancel={() => setCurrentRoute('/industry/dashboard')}
            onCompleted={(rep, assess) => {
              setActiveReport(rep);
              setActiveAssessment(assess);
              setCurrentRoute('/report');
            }}
          />
        )}

        {currentRoute === '/report' && activeReport && (
          <WasteIntelligenceReportView
            report={activeReport}
            assessment={activeAssessment}
            onNavigateMarketplace={() => setCurrentRoute('/marketplace')}
            onNavigateRecycler={() => setCurrentRoute('/recycler/dashboard')}
            onBack={() => setCurrentRoute('/industry/dashboard')}
          />
        )}

        {currentRoute === '/dealer/dashboard' && (
          <DealerDashboard
            onNavigateMarketplace={() => setCurrentRoute('/marketplace')}
            onNavigateTransactions={() => setCurrentRoute('/transactions')}
          />
        )}

        {currentRoute === '/admin/dashboard' && (
          <AdminDashboard />
        )}

        {currentRoute === '/transactions' && (
          <TransactionsView />
        )}
      </main>

      {/* 5-Scenario Verification Test Runner Modal */}
      <TestRunnerModal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
      />

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          if (userProfile?.role === 'dealer') {
            setCurrentRoute('/dealer/dashboard');
          } else if (userProfile?.role === 'recycler') {
            setCurrentRoute('/recycler/dashboard');
          } else if (userProfile?.role === 'consumer') {
            setCurrentRoute('/consumer/marketplace');
          } else if (userProfile?.role === 'admin') {
            setCurrentRoute('/admin/dashboard');
          } else {
            setCurrentRoute('/industry/dashboard');
          }
        }}
      />
    </div>
  );
}

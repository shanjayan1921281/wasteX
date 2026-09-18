import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Building2, 
  Truck, 
  Recycle, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  BarChart3, 
  FileText, 
  Activity,
  Loader2,
  BookOpen
} from 'lucide-react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { BusinessProfile, WasteListing, TransactionRecord, AuditLog } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AdminKnowledgeBaseConsole } from './AdminKnowledgeBaseConsole';

export const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'knowledge'>('overview');
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // 1. Businesses
      const bSnap = await getDocs(collection(db, 'businesses'));
      const bArr: BusinessProfile[] = [];
      bSnap.forEach(d => bArr.push(d.data() as BusinessProfile));
      setBusinesses(bArr);

      // 2. Listings
      const lSnap = await getDocs(collection(db, 'wasteListings'));
      const lArr: WasteListing[] = [];
      lSnap.forEach(d => lArr.push(d.data() as WasteListing));
      setListings(lArr);

      // 3. Transactions
      const tSnap = await getDocs(collection(db, 'transactions'));
      const tArr: TransactionRecord[] = [];
      tSnap.forEach(d => tArr.push(d.data() as TransactionRecord));
      setTransactions(tArr);

      // 4. Audit Logs
      const logSnap = await getDocs(collection(db, 'auditLogs'));
      const logArr: AuditLog[] = [];
      logSnap.forEach(d => logArr.push(d.data() as AuditLog));
      setAuditLogs(logArr);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateBusinessStatus = async (businessId: string, status: 'VERIFIED' | 'SUSPENDED') => {
    try {
      await updateDoc(doc(db, 'businesses', businessId), {
        verificationStatus: status,
        updatedAt: new Date().toISOString()
      });
      await loadAdminData();
    } catch (err) {
      console.error('Error updating business status:', err);
    }
  };

  // Real aggregate charts data computed directly from Firestore records
  const categoryTonnage: Record<string, number> = {};
  listings.forEach((l) => {
    const cat = l.materialCategory || 'Other';
    categoryTonnage[cat] = (categoryTonnage[cat] || 0) + (l.quantity || 0);
  });

  const chartData = Object.keys(categoryTonnage).map((cat) => ({
    name: cat,
    tonnage: categoryTonnage[cat]
  }));

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Admin Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <span className="text-xs uppercase tracking-wider text-amber-800 font-bold">
              Verification & Admin Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Platform Network Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time audit trails, business verifications, transaction tracking, and material telemetry.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
        >
          Refresh Data
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
            activeTab === 'overview'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/60'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Overview & Verifications</span>
        </button>

        <button
          onClick={() => setActiveTab('knowledge')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
            activeTab === 'knowledge'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/60'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Waste Standards & Rules</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
            Live
          </span>
        </button>
      </div>

      {activeTab === 'knowledge' ? (
        <AdminKnowledgeBaseConsole />
      ) : (
        <>
          {/* KPI Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 block font-medium">Registered Businesses</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">{businesses.length}</span>
              <span className="text-[11px] text-emerald-700 font-semibold">Mills & Buyers</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 block font-medium">Live Scrap Listings</span>
              <span className="text-2xl font-bold text-emerald-700 mt-1 block">{listings.length}</span>
              <span className="text-[11px] text-emerald-700 font-semibold">Verified streams</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 block font-medium">Active Deals</span>
              <span className="text-2xl font-bold text-teal-700 mt-1 block">{transactions.length}</span>
              <span className="text-[11px] text-slate-500">In-transit or scheduled</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 block font-medium">System Log Events</span>
              <span className="text-2xl font-bold text-amber-700 mt-1 block">{auditLogs.length}</span>
              <span className="text-[11px] text-slate-500">Security actions tracked</span>
            </div>
          </div>

          {/* Analytics Chart based on real Firestore entries */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Scrap Volume by Category (kg)</h2>
                <p className="text-xs sm:text-sm text-slate-500">Aggregated live from active listings</p>
              </div>
              <span className="text-xs text-emerald-700 font-bold">Real Data</span>
            </div>

            {chartData.length > 0 ? (
              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '0.75rem', color: '#0F172A', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="tonnage" fill="#059669" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                No sufficient volume data yet.
              </div>
            )}
          </div>

          {/* Business KYC & Platform Verification Table */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Business Verifications</h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Verify factories and licensed recyclers to maintain trusted trading.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-bold">Business Name</th>
                    <th className="py-3 px-4 font-bold">Role</th>
                    <th className="py-3 px-4 font-bold">Location</th>
                    <th className="py-3 px-4 font-bold">Verification Status</th>
                    <th className="py-3 px-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {businesses.map((biz) => (
                    <tr key={biz.businessId} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{biz.businessName}</div>
                        <div className="text-[11px] text-slate-500">{biz.email}</div>
                      </td>
                      <td className="py-3.5 px-4 capitalize text-emerald-800 font-semibold">
                        {biz.businessType}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {biz.city}, {biz.state}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            biz.verificationStatus === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : biz.verificationStatus === 'SUSPENDED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {biz.verificationStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {biz.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => handleUpdateBusinessStatus(biz.businessId, 'VERIFIED')}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Verify
                          </button>
                        )}
                        {biz.verificationStatus !== 'SUSPENDED' && (
                          <button
                            onClick={() => handleUpdateBusinessStatus(biz.businessId, 'SUSPENDED')}
                            className="px-3 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-bold text-[11px] cursor-pointer"
                          >
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Security Audit Log Stream */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">Activity & Audit Log</h2>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {auditLogs.length === 0 ? (
                <div className="text-xs text-slate-500">No activity logs recorded yet.</div>
              ) : (
                auditLogs.slice(0, 15).map((log, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-emerald-800">{log.action}</span>
                      <span className="text-slate-600 ml-2">by user {log.actorUserId.slice(0, 8)} ({log.actorRole})</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

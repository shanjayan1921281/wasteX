import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc,
  setDoc,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Truck, 
  CheckCircle2, 
  Clock, 
  Check, 
  X, 
  ChevronRight, 
  AlertCircle, 
  Building2, 
  MapPin, 
  Calendar, 
  ShieldCheck,
  Loader2
} from 'lucide-react';
import type { PurchaseRequest, TransactionRecord } from '../types';
import { logAuditEvent, createNotification } from '../lib/auditAndNotifications';

export const TransactionsView: React.FC = () => {
  const { userProfile, businessProfile } = useAuth();
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'requests' | 'transactions'>('requests');

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Purchase Requests
      const reqSnap = await getDocs(collection(db, 'purchaseRequests'));
      const reqList: PurchaseRequest[] = [];
      reqSnap.forEach((d) => reqList.push(d.data() as PurchaseRequest));
      setPurchaseRequests(reqList);

      // 2. Fetch Transactions
      const txSnap = await getDocs(collection(db, 'transactions'));
      const txList: TransactionRecord[] = [];
      txSnap.forEach((d) => txList.push(d.data() as TransactionRecord));
      setTransactions(txList);
    } catch (err) {
      console.error('Error fetching transaction records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Accept Purchase Request -> Spawns Transaction
  const handleAcceptRequest = async (request: PurchaseRequest) => {
    setActionLoading(true);
    try {
      const transactionId = `tx-${Date.now()}`;
      const now = new Date().toISOString();

      // 1. Create Transaction
      const newTransaction: TransactionRecord = {
        transactionId,
        purchaseRequestId: request.requestId,
        listingId: request.listingId,
        wasteName: request.wasteName,
        buyerBusinessId: request.buyerBusinessId,
        buyerBusinessName: request.buyerBusinessName,
        buyerUserId: request.buyerUserId,
        sellerBusinessId: request.sellerBusinessId,
        sellerBusinessName: request.sellerBusinessName,
        sellerUserId: request.sellerUserId,
        quantity: request.requestedQuantity,
        unit: request.unit,
        location: 'Coimbatore, Tamil Nadu',
        status: 'TRANSACTION_CONFIRMED',
        pickupDate: request.proposedPickupDate || now.split('T')[0],
        timeline: [
          {
            status: 'TRANSACTION_CONFIRMED',
            timestamp: now,
            note: 'Seller accepted purchase request. Transaction contract confirmed.',
            actor: request.sellerBusinessName
          }
        ],
        createdAt: now,
        updatedAt: now
      };

      await setDoc(doc(db, 'transactions', transactionId), newTransaction);

      // 2. Update Request Status to ACCEPTED
      await updateDoc(doc(db, 'purchaseRequests', request.requestId), {
        status: 'ACCEPTED',
        transactionId,
        updatedAt: now
      });

      // 3. Update Listing Available Quantity
      const listingRef = doc(db, 'wasteListings', request.listingId);
      // Optional decrement if doc exists
      await setDoc(listingRef, { status: 'RESERVED', updatedAt: now }, { merge: true });

      // 4. Audit & Notify Buyer
      if (userProfile) {
        await logAuditEvent(
          userProfile.uid,
          userProfile.role,
          'ACCEPT_PURCHASE_REQUEST',
          'transaction',
          transactionId,
          { requestId: request.requestId, quantity: request.requestedQuantity },
          userProfile.email
        );

        await createNotification(
          request.buyerUserId,
          'Purchase Request Accepted!',
          `${request.sellerBusinessName} accepted your request for ${request.requestedQuantity} ${request.unit} of ${request.wasteName}. Transaction #${transactionId.slice(0, 8)} is confirmed.`,
          'REQUEST_ACCEPTED',
          transactionId,
          'transaction'
        );
      }

      await loadData();
      setActiveTab('transactions');
    } catch (err) {
      console.error('Error accepting request:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Reject Purchase Request
  const handleRejectRequest = async (request: PurchaseRequest) => {
    setActionLoading(true);
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'purchaseRequests', request.requestId), {
        status: 'REJECTED',
        updatedAt: now
      });

      if (userProfile) {
        await createNotification(
          request.buyerUserId,
          'Purchase Request Declined',
          `Your request for ${request.wasteName} could not be fulfilled at this time.`,
          'REQUEST_REJECTED',
          request.requestId,
          'request'
        );
      }
      await loadData();
    } catch (err) {
      console.error('Error rejecting request:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Progress Transaction Stage
  const handleAdvanceTransactionStatus = async (
    tx: TransactionRecord, 
    nextStatus: 'PICKUP_SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED',
    noteText: string
  ) => {
    setActionLoading(true);
    try {
      const now = new Date().toISOString();
      const updatedTimeline = [
        ...tx.timeline,
        {
          status: nextStatus,
          timestamp: now,
          note: noteText,
          actor: userProfile?.name || 'Authorized Party'
        }
      ];

      const updates: any = {
        status: nextStatus,
        timeline: updatedTimeline,
        updatedAt: now
      };

      if (nextStatus === 'COMPLETED') {
        updates.completedAt = now;
      }

      await updateDoc(doc(db, 'transactions', tx.transactionId), updates);

      if (userProfile) {
        await logAuditEvent(
          userProfile.uid,
          userProfile.role,
          'UPDATE_TRANSACTION_STATUS',
          'transaction',
          tx.transactionId,
          { nextStatus, noteText },
          userProfile.email
        );

        // Notify counter-party
        const recipientUid = userProfile.uid === tx.buyerUserId ? tx.sellerUserId : tx.buyerUserId;
        await createNotification(
          recipientUid,
          `Transaction Updated: ${nextStatus.replace('_', ' ')}`,
          `Transaction for ${tx.wasteName} has progressed to ${nextStatus}. Note: ${noteText}`,
          'TRANSACTION_UPDATE',
          tx.transactionId,
          'transaction'
        );
      }

      await loadData();
    } catch (err) {
      console.error('Error updating transaction status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-emerald-700 font-bold">
              Orders & Deals
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
              Live Database
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Buyer Requests & Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review purchase requests, confirm sales, and track dispatch and delivery.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Buyer Requests ({purchaseRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
              activeTab === 'transactions'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Order Timeline ({transactions.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-xs text-slate-500">Loading orders...</p>
        </div>
      ) : activeTab === 'requests' ? (
        /* PURCHASE REQUESTS LIST */
        <div className="space-y-4">
          {purchaseRequests.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-sm text-slate-500 shadow-xs">
              No purchase requests received yet. Post items to the marketplace to get orders!
            </div>
          ) : (
            purchaseRequests.map((req) => (
              <div
                key={req.requestId}
                className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 hover:border-emerald-300 transition-colors shadow-xs"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">{req.wasteName}</h3>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          req.status === 'ACCEPTED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : req.status === 'REJECTED'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2">
                      <span>Buyer: <strong className="text-slate-900">{req.buyerBusinessName}</strong></span>
                      <span>Seller: <strong className="text-slate-900">{req.sellerBusinessName}</strong></span>
                      <span>Target Pickup: <strong className="text-slate-900">{req.proposedPickupDate}</strong></span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-bold text-emerald-700">
                      {req.requestedQuantity} {req.unit}
                    </span>
                    <span className="text-[11px] text-slate-500 block">Requested Amount</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700">
                  <strong className="text-slate-900">Buyer Note:</strong> "{req.message}"
                </div>

                {req.status === 'PENDING' && (
                  <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                    <button
                      onClick={() => handleRejectRequest(req)}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
                    >
                      Decline Request
                    </button>
                    <button
                      onClick={() => handleAcceptRequest(req)}
                      disabled={actionLoading}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept & Create Order</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* TRANSACTIONS TIMELINE LIST */
        <div className="space-y-6">
          {transactions.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-sm text-slate-500 shadow-xs">
              No active orders found. Accept a purchase request to track your deal timeline here.
            </div>
          ) : (
            transactions.map((tx) => {
              const statusSequence = [
                'TRANSACTION_CONFIRMED',
                'PICKUP_SCHEDULED',
                'IN_TRANSIT',
                'DELIVERED',
                'COMPLETED'
              ];
              const currentIdx = statusSequence.indexOf(tx.status);

              return (
                <div
                  key={tx.transactionId}
                  className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm"
                >
                  {/* Tx Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold">
                        <Truck className="w-4 h-4" />
                        <span>ORDER #{tx.transactionId.slice(0, 16)}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">{tx.wasteName}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-1.5">
                        <span>Seller: <strong className="text-slate-900">{tx.sellerBusinessName}</strong></span>
                        <span>Buyer: <strong className="text-slate-900">{tx.buyerBusinessName}</strong></span>
                        <span>Location: <strong className="text-slate-900">{tx.location}</strong></span>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl text-right">
                      <span className="text-[10px] text-emerald-800 uppercase font-bold block">Contract Volume</span>
                      <span className="text-xl font-bold text-emerald-900">{tx.quantity} {tx.unit}</span>
                    </div>
                  </div>

                  {/* Visual Status Progress Flow */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    {statusSequence.map((stepName, sIdx) => {
                      const isCompleted = sIdx <= currentIdx;
                      const isCurrent = sIdx === currentIdx;

                      return (
                        <div
                          key={stepName}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            isCurrent
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-2xs'
                              : isCompleted
                              ? 'bg-emerald-50/50 border-emerald-200 text-emerald-700'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <div className="text-[10px] uppercase tracking-wider font-semibold">
                            STEP 0{sIdx + 1}
                          </div>
                          <div className="font-semibold text-xs mt-1 truncate">
                            {stepName.replace('_', ' ')}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Timeline History */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Delivery & Tracking History
                    </h4>
                    <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      {tx.timeline?.map((ev, eIdx) => (
                        <div key={eIdx} className="flex items-start gap-3 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{ev.status}</span>
                              <span className="text-[10px] text-slate-500">
                                • {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({ev.actor})
                              </span>
                            </div>
                            <p className="text-slate-600 mt-0.5">{ev.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Advance Transaction Actions */}
                  {tx.status !== 'COMPLETED' && (
                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-slate-600 font-medium">
                        Update order to next checkpoint:
                      </span>

                      <div className="flex gap-2">
                        {tx.status === 'TRANSACTION_CONFIRMED' && (
                          <button
                            onClick={() =>
                              handleAdvanceTransactionStatus(
                                tx,
                                'PICKUP_SCHEDULED',
                                'Truck booked and scheduled for factory warehouse pickup.'
                              )
                            }
                            disabled={actionLoading}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                          >
                            Mark Pickup Scheduled
                          </button>
                        )}

                        {tx.status === 'PICKUP_SCHEDULED' && (
                          <button
                            onClick={() =>
                              handleAdvanceTransactionStatus(
                                tx,
                                'IN_TRANSIT',
                                'Materials loaded on vehicle and en route to buyer facility.'
                              )
                            }
                            disabled={actionLoading}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                          >
                            Mark In Transit
                          </button>
                        )}

                        {tx.status === 'IN_TRANSIT' && (
                          <button
                            onClick={() =>
                              handleAdvanceTransactionStatus(
                                tx,
                                'DELIVERED',
                                'Consignment arrived at buyer facility and passed inspection.'
                              )
                            }
                            disabled={actionLoading}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                          >
                            Mark Delivered
                          </button>
                        )}

                        {tx.status === 'DELIVERED' && (
                          <button
                            onClick={() =>
                              handleAdvanceTransactionStatus(
                                tx,
                                'COMPLETED',
                                'Materials accepted and payment cleared. Deal completed.'
                              )
                            }
                            disabled={actionLoading}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                          >
                            Mark Order Completed
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

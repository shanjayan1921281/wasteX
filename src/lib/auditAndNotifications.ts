import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { UserRole } from '../types';

export async function logAuditEvent(
  actorUserId: string,
  actorRole: UserRole,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata?: Record<string, any>,
  actorEmail?: string
) {
  try {
    await addDoc(collection(db, 'auditLogs'), {
      actorUserId,
      actorEmail: actorEmail || 'unknown',
      actorRole,
      action,
      resourceType,
      resourceId,
      timestamp: new Date().toISOString(),
      metadata: metadata || {}
    });
  } catch (err) {
    console.warn('Failed to record audit log:', err);
  }
}

export async function createNotification(
  recipientUserId: string,
  title: string,
  message: string,
  type: 'AI_REPORT_READY' | 'BUYER_MATCH' | 'PURCHASE_REQUEST' | 'REQUEST_ACCEPTED' | 'REQUEST_REJECTED' | 'TRANSACTION_UPDATE' | 'VERIFICATION',
  referenceId?: string,
  referenceType?: 'report' | 'listing' | 'request' | 'transaction' | 'business'
) {
  try {
    await addDoc(collection(db, 'notifications'), {
      recipientUserId,
      title,
      message,
      type,
      referenceId: referenceId || '',
      referenceType: referenceType || '',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Failed to dispatch notification:', err);
  }
}

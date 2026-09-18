import { supabase, isSupabaseConfigured } from './supabase';
import type { UserRole, AuditLog, NotificationItem } from '../types';

export async function logAuditEvent(
  actorUserId: string,
  actorRole: UserRole,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata?: Record<string, any>,
  actorEmail?: string
): Promise<void> {
  try {
    if (isSupabaseConfigured()) {
      await supabase.from('audit_logs').insert({
        actor_user_id: actorUserId,
        actor_email: actorEmail || 'unknown',
        actor_role: actorRole,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        metadata: metadata || {},
        timestamp: new Date().toISOString()
      });
    } else {
      // Local session audit cache
      const cached = JSON.parse(sessionStorage.getItem('audit_logs') || '[]');
      cached.unshift({
        logId: `log-${Date.now()}`,
        actorUserId,
        actorEmail: actorEmail || 'unknown',
        actorRole,
        action,
        resourceType,
        resourceId,
        metadata: metadata || {},
        timestamp: new Date().toISOString()
      });
      sessionStorage.setItem('audit_logs', JSON.stringify(cached.slice(0, 100)));
    }
  } catch (err) {
    console.warn('Notice recording audit log:', err);
  }
}

export async function createNotification(
  recipientUserId: string,
  title: string,
  message: string,
  type: 'AI_REPORT_READY' | 'BUYER_MATCH' | 'PURCHASE_REQUEST' | 'REQUEST_ACCEPTED' | 'REQUEST_REJECTED' | 'TRANSACTION_UPDATE' | 'VERIFICATION',
  referenceId?: string,
  referenceType?: 'report' | 'listing' | 'request' | 'transaction' | 'business'
): Promise<void> {
  try {
    if (isSupabaseConfigured() && recipientUserId.includes('-') && recipientUserId.length > 30) {
      await supabase.from('notifications').insert({
        recipient_user_id: recipientUserId,
        title,
        message,
        type,
        reference_id: referenceId || '',
        reference_type: referenceType || '',
        is_read: false,
        created_at: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn('Notice dispatching notification:', err);
  }
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  if (!isSupabaseConfigured()) {
    return JSON.parse(sessionStorage.getItem('audit_logs') || '[]');
  }

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error || !data) return [];

    return data.map(d => ({
      logId: d.id,
      actorUserId: d.actor_user_id,
      actorEmail: d.actor_email,
      actorRole: d.actor_role as UserRole,
      action: d.action,
      resourceType: d.resource_type,
      resourceId: d.resource_id,
      metadata: d.metadata || {},
      timestamp: d.timestamp
    }));
  } catch (err) {
    console.warn('Notice loading audit logs from Supabase:', err);
    return [];
  }
}

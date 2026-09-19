import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { WasteAssessment } from '../types';

export const wasteService = {
  async uploadWasteImage(userId: string, file: Blob, fileName: string): Promise<string> {
    if (!isSupabaseConfigured()) {
      return `https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80`;
    }

    try {
      const cleanFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '')}`;
      const filePath = `${userId}/${cleanFileName}`;

      const { data, error } = await supabase.storage
        .from('waste-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.warn('Supabase storage upload error:', error);
        return URL.createObjectURL(file);
      }

      const { data: publicUrlData } = supabase.storage
        .from('waste-images')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.warn('Fallback generating local blob url for image:', err);
      return URL.createObjectURL(file);
    }
  },

  async createSubmission(assessment: WasteAssessment): Promise<void> {
    // 1. Save to LocalStorage
    try {
      const stored = localStorage.getItem('wastexchange_submissions');
      const list: WasteAssessment[] = stored ? JSON.parse(stored) : [];
      const updated = [assessment, ...list.filter(a => a.assessmentId !== assessment.assessmentId)];
      localStorage.setItem('wastexchange_submissions', JSON.stringify(updated));
      localStorage.setItem(`wasteAssessment_${assessment.assessmentId}`, JSON.stringify(assessment));
    } catch (e) {
      console.warn('LocalStorage save error in waste submission:', e);
    }

    // 2. Save to Supabase
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('waste_submissions').upsert({
          id: assessment.assessmentId.includes('-') && assessment.assessmentId.length > 30 ? assessment.assessmentId : undefined,
          user_id: assessment.ownerUserId.includes('-') && assessment.ownerUserId.length > 30 ? assessment.ownerUserId : undefined,
          waste_name: assessment.wasteName,
          waste_category: assessment.materialCategory,
          waste_type: assessment.wasteType,
          quantity: assessment.quantity,
          quantity_unit: assessment.unit,
          location: assessment.location,
          generation_frequency: assessment.generationFrequency,
          availability: assessment.availability,
          grade: assessment.grade,
          moisture_level: assessment.moistureLevel,
          contamination_level: assessment.contaminationLevel,
          is_separated: assessment.isSeparated,
          condition: assessment.condition,
          additional_notes: assessment.additionalNotes,
          image_path: assessment.images?.[0]?.url || '',
          status: assessment.status === 'LISTED' ? 'listed' : assessment.status === 'ANALYZED' ? 'analyzed' : 'submitted',
          is_demo: Boolean(assessment.isDemo),
          created_at: assessment.createdAt || new Date().toISOString(),
          updated_at: assessment.updatedAt || new Date().toISOString()
        });
      } catch (err) {
        console.warn('Error saving waste submission to Supabase:', err);
      }
    }
  },

  async getSubmissions(userId?: string): Promise<WasteAssessment[]> {
    let localSubmissions: WasteAssessment[] = [];
    try {
      const stored = localStorage.getItem('wastexchange_submissions');
      if (stored) {
        localSubmissions = JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    let remoteSubmissions: WasteAssessment[] = [];
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('waste_submissions').select('*').order('created_at', { ascending: false });
        if (userId && userId.includes('-') && userId.length > 30) {
          query = query.eq('user_id', userId);
        }

        const { data, error } = await query;
        if (!error && data) {
          remoteSubmissions = data.map((d) => ({
            assessmentId: d.id,
            ownerUserId: d.user_id,
            businessId: `biz-${(d.user_id || 'owner').slice(0, 8)}`,
            businessName: d.waste_name,
            wasteName: d.waste_name,
            materialCategory: d.waste_category as any,
            wasteType: d.waste_type || 'Industrial Byproduct',
            quantity: Number(d.quantity) || 0,
            unit: d.quantity_unit as any,
            location: d.location || 'Tamil Nadu',
            generationFrequency: d.generation_frequency as any,
            availability: d.availability as any,
            description: d.additional_notes || '',
            grade: d.grade || 'Grade A',
            moistureLevel: d.moisture_level || 'Low',
            contaminationLevel: d.contamination_level || 'Minimal',
            isSeparated: d.is_separated as any,
            condition: d.condition as any,
            images: d.image_path ? [{ url: d.image_path, fileName: 'evidence.jpg', uploadedAt: d.created_at }] : [],
            status: (d.status?.toUpperCase() || 'ANALYZED') as any,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
            isDemo: d.is_demo
          }));
        }
      } catch (err) {
        console.warn('Error querying waste submissions from Supabase:', err);
      }
    }

    const all = [...localSubmissions, ...remoteSubmissions];
    const map = new Map<string, WasteAssessment>();
    all.forEach(item => {
      if (item.assessmentId && !map.has(item.assessmentId)) {
        map.set(item.assessmentId, item);
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }
};

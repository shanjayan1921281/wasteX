import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { MaterialRequirement, PurchaseRequest, TransactionRecord, WasteListing } from '../types';

export const dealerService = {
  async getRequirements(): Promise<MaterialRequirement[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('material_requirements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map(d => ({
        requirementId: d.requirement_id || d.id,
        dealerBusinessId: d.dealer_business_id || d.dealer_user_id || 'biz-dealer',
        dealerUserId: d.dealer_user_id,
        dealerBusinessName: d.dealer_business_name,
        title: d.title,
        materialCategory: d.material_category,
        specificMaterial: d.specific_material,
        minQuantity: Number(d.min_quantity) || 0,
        maxQuantity: Number(d.max_quantity) || 0,
        unit: d.unit,
        requiredQuality: d.required_quality,
        preferredLocation: d.preferred_location,
        frequency: d.frequency,
        targetPriceRange: d.target_price_range,
        additionalNotes: d.additional_notes,
        status: d.status,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        isDemo: d.is_demo
      }));
    } catch (err) {
      console.warn('Error querying material requirements from Supabase:', err);
      return [];
    }
  },

  async createRequirement(req: MaterialRequirement): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase.from('material_requirements').upsert({
        requirement_id: req.requirementId,
        dealer_user_id: req.dealerUserId?.includes('-') && req.dealerUserId.length > 30 ? req.dealerUserId : undefined,
        dealer_business_name: req.dealerBusinessName,
        title: req.title,
        material_category: req.materialCategory,
        specific_material: req.specificMaterial,
        min_quantity: req.minQuantity,
        max_quantity: req.maxQuantity,
        unit: req.unit,
        required_quality: req.requiredQuality,
        preferred_location: req.preferredLocation,
        frequency: req.frequency,
        target_price_range: req.targetPriceRange,
        additional_notes: req.additionalNotes,
        status: req.status,
        is_demo: Boolean(req.isDemo),
        created_at: req.createdAt || new Date().toISOString(),
        updated_at: req.updatedAt || new Date().toISOString()
      });
    } catch (err) {
      console.warn('Error saving material requirement to Supabase:', err);
    }
  },

  async saveRequirement(req: MaterialRequirement): Promise<void> {
    return this.createRequirement(req);
  }
};

export const transactionService = {
  async getPurchaseRequests(): Promise<PurchaseRequest[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('purchase_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map(d => ({
        requestId: d.request_id || d.id,
        listingId: d.listing_id,
        wasteName: d.waste_name,
        sellerBusinessId: d.seller_business_id || d.seller_user_id || 'biz-seller',
        sellerUserId: d.seller_user_id,
        sellerBusinessName: d.seller_business_name,
        buyerBusinessId: d.buyer_business_id || d.buyer_user_id || 'biz-buyer',
        buyerUserId: d.buyer_user_id,
        buyerBusinessName: d.buyer_business_name,
        requestedQuantity: Number(d.requested_quantity) || 0,
        unit: d.unit,
        proposedPickupDate: d.proposed_pickup_date,
        message: d.message,
        status: d.status,
        rejectionReason: d.rejection_reason,
        transactionId: d.transaction_id,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        isDemo: d.is_demo
      }));
    } catch (err) {
      console.warn('Error fetching purchase requests from Supabase:', err);
      return [];
    }
  },

  async savePurchaseRequest(pr: PurchaseRequest): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase.from('purchase_requests').upsert({
        request_id: pr.requestId,
        listing_id: pr.listingId,
        waste_name: pr.wasteName,
        seller_user_id: pr.sellerUserId,
        seller_business_name: pr.sellerBusinessName,
        buyer_user_id: pr.buyerUserId,
        buyer_business_name: pr.buyerBusinessName,
        requested_quantity: pr.requestedQuantity,
        unit: pr.unit,
        proposed_pickup_date: pr.proposedPickupDate,
        message: pr.message,
        status: pr.status,
        rejection_reason: pr.rejectionReason,
        transaction_id: pr.transactionId,
        is_demo: Boolean(pr.isDemo),
        created_at: pr.createdAt || new Date().toISOString(),
        updated_at: pr.updatedAt || new Date().toISOString()
      });
    } catch (err) {
      console.warn('Error saving purchase request to Supabase:', err);
    }
  },

  async getTransactions(): Promise<TransactionRecord[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map(d => ({
        transactionId: d.transaction_id || d.id,
        purchaseRequestId: d.purchase_request_id,
        listingId: d.listing_id,
        wasteName: d.waste_name,
        buyerBusinessId: d.buyer_business_id || d.buyer_user_id || 'biz-buyer',
        buyerUserId: d.buyer_user_id,
        buyerBusinessName: d.buyer_business_name,
        sellerBusinessId: d.seller_business_id || d.seller_user_id || 'biz-seller',
        sellerUserId: d.seller_user_id,
        sellerBusinessName: d.seller_business_name,
        quantity: Number(d.quantity) || 0,
        unit: d.unit,
        location: d.location,
        status: d.status,
        pickupDate: d.pickup_date,
        deliveryDate: d.delivery_date,
        notes: d.notes,
        timeline: d.timeline || [],
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        isDemo: d.is_demo
      }));
    } catch (err) {
      console.warn('Error fetching transactions from Supabase:', err);
      return [];
    }
  },

  async saveTransaction(tx: TransactionRecord): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase.from('transactions').upsert({
        transaction_id: tx.transactionId,
        purchase_request_id: tx.purchaseRequestId,
        listing_id: tx.listingId,
        waste_name: tx.wasteName,
        buyer_user_id: tx.buyerUserId,
        buyer_business_name: tx.buyerBusinessName,
        seller_user_id: tx.sellerUserId,
        seller_business_name: tx.sellerBusinessName,
        quantity: tx.quantity,
        unit: tx.unit,
        location: tx.location,
        status: tx.status,
        pickup_date: tx.pickupDate,
        delivery_date: tx.deliveryDate,
        notes: tx.notes,
        timeline: tx.timeline || [],
        is_demo: Boolean(tx.isDemo),
        created_at: tx.createdAt || new Date().toISOString(),
        updated_at: tx.updatedAt || new Date().toISOString()
      });
    } catch (err) {
      console.warn('Error saving transaction to Supabase:', err);
    }
  }
};

export const marketplaceService = {
  async getListings(): Promise<WasteListing[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('waste_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map(d => ({
        listingId: d.listing_id || d.id,
        assessmentId: d.assessment_id,
        reportId: d.report_id,
        sellerBusinessId: d.seller_business_name,
        sellerBusinessName: d.seller_business_name,
        sellerUserId: d.seller_user_id,
        wasteName: d.waste_name,
        materialCategory: d.material_category,
        wasteType: d.waste_type || 'Industrial Scrap',
        quantity: Number(d.quantity) || 0,
        availableQuantity: Number(d.available_quantity) || Number(d.quantity) || 0,
        minPurchaseQuantity: Number(d.min_purchase_quantity) || 100,
        unit: d.unit,
        quality: d.quality,
        grade: d.grade,
        location: d.location,
        availability: d.availability,
        description: d.description,
        images: d.images || [],
        aiMatchPotential: d.ai_match_potential,
        aiReportSummary: d.ai_report_summary,
        recommendedPathway: d.recommended_pathway,
        status: d.status,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        isDemo: d.is_demo
      }));
    } catch (err) {
      console.warn('Error fetching waste listings from Supabase:', err);
      return [];
    }
  },

  async saveListing(listing: WasteListing): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase.from('waste_listings').upsert({
        listing_id: listing.listingId,
        assessment_id: listing.assessmentId,
        report_id: listing.reportId,
        seller_user_id: listing.sellerUserId?.includes('-') && listing.sellerUserId.length > 30 ? listing.sellerUserId : undefined,
        seller_business_name: listing.sellerBusinessName,
        waste_name: listing.wasteName,
        material_category: listing.materialCategory,
        waste_type: listing.wasteType,
        quantity: listing.quantity,
        available_quantity: listing.availableQuantity,
        min_purchase_quantity: listing.minPurchaseQuantity,
        unit: listing.unit,
        quality: listing.quality,
        grade: listing.grade,
        location: listing.location,
        availability: listing.availability,
        description: listing.description,
        images: listing.images || [],
        ai_match_potential: listing.aiMatchPotential,
        ai_report_summary: listing.aiReportSummary,
        recommended_pathway: listing.recommendedPathway,
        status: listing.status,
        is_demo: Boolean(listing.isDemo),
        created_at: listing.createdAt || new Date().toISOString(),
        updated_at: listing.updatedAt || new Date().toISOString()
      });
    } catch (err) {
      console.warn('Error saving listing to Supabase:', err);
    }
  }
};

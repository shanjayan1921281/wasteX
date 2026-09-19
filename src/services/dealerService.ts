import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { MaterialRequirement, PurchaseRequest, TransactionRecord, WasteListing } from '../types';

const SEED_LISTINGS: WasteListing[] = [
  {
    listingId: 'list-seed-01',
    assessmentId: 'assess-seed-01',
    reportId: 'rep-seed-01',
    sellerBusinessId: 'biz-industry-01',
    sellerBusinessName: 'Kongu Cotton & Spinning Mills Ltd',
    sellerUserId: 'demo-industry-01',
    wasteName: 'Comber Noil & Spun Cotton Waste',
    materialCategory: 'Textile',
    wasteType: '100% Cotton Mill Spinning Byproduct',
    quantity: 1200,
    availableQuantity: 1200,
    minPurchaseQuantity: 200,
    unit: 'kg',
    quality: 'Grade A Industrial Secondary',
    grade: 'Grade A (100% Pure White Cotton)',
    location: 'Coimbatore, Tamil Nadu',
    availability: 'Immediate',
    description: 'Dry, unbleached comber noil baled under hydraulic compression (approx 150kg/bale). Stored in covered dry warehouse.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80',
        fileName: 'cotton_comber_bales.jpg'
      }
    ],
    aiMatchPotential: 'High Demand (6 buyer nodes)',
    aiReportSummary: '94% pure cellulose fibers, ideal for rotor open-end yarn spinning',
    recommendedPathway: 'Mechanical Recycling & Rotor Yarn Spinning',
    status: 'LISTED',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    isDemo: true
  },
  {
    listingId: 'list-seed-02',
    assessmentId: 'assess-seed-02',
    reportId: 'rep-seed-02',
    sellerBusinessId: 'biz-industry-02',
    sellerBusinessName: 'Tamil Poly-Pack Extrusions',
    sellerUserId: 'demo-industry-02',
    wasteName: 'Clean Industrial HDPE Blue Drums & Offcuts',
    materialCategory: 'Plastic',
    wasteType: 'Post-Industrial High Density Polyethylene',
    quantity: 850,
    availableQuantity: 850,
    minPurchaseQuantity: 100,
    unit: 'kg',
    quality: 'Grade A Clean Secondary',
    grade: 'Blow Moulding Grade',
    location: 'Tiruppur, Tamil Nadu',
    availability: 'Immediate',
    description: 'Triple-rinsed and pre-shredded HDPE regrind flakes with zero heavy chemical residue. MFI 0.05-0.1.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
        fileName: 'hdpe_clean_flakes.jpg'
      }
    ],
    aiMatchPotential: 'High Demand (4 buyer nodes)',
    aiReportSummary: '98% HDPE polymer content, suitable for agricultural drip irrigation pipe re-extrusion',
    recommendedPathway: 'Granulation & Secondary Pipe Compounding',
    status: 'LISTED',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    isDemo: true
  },
  {
    listingId: 'list-seed-03',
    assessmentId: 'assess-seed-03',
    reportId: 'rep-seed-03',
    sellerBusinessId: 'biz-industry-03',
    sellerBusinessName: 'Coimbatore Precision Engineering Works',
    sellerUserId: 'demo-industry-03',
    wasteName: 'Mild Steel CNC Turnings & Bushings',
    materialCategory: 'Metal',
    wasteType: 'MS Machining Swarf & Turnings',
    quantity: 2500,
    availableQuantity: 2500,
    minPurchaseQuantity: 500,
    unit: 'kg',
    quality: 'Standard Melting Scrap',
    grade: 'IS 2062 Grade Turning Scrap',
    location: 'Peelamedu, Coimbatore',
    availability: 'Continuous Stream',
    description: 'Low-oil centrifugal dried steel turning swarf. Generated weekly from automotive shaft turning operations.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1509783236416-c9ad59bae472?auto=format&fit=crop&w=800&q=80',
        fileName: 'mild_steel_swarf.jpg'
      }
    ],
    aiMatchPotential: 'High Demand (8 buyer nodes)',
    aiReportSummary: '99% iron content, high induction furnace melting efficiency',
    recommendedPathway: 'Foundry Re-Melting & Ingot Casting',
    status: 'LISTED',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    isDemo: true
  }
];

const SEED_REQUIREMENTS: MaterialRequirement[] = [
  {
    requirementId: 'req-seed-01',
    dealerBusinessId: 'biz-dealer-01',
    dealerUserId: 'demo-dealer-01',
    dealerBusinessName: 'Murugan Scrap Aggregators',
    title: 'Urgent: Clean Cotton Comber & Loom Waste',
    materialCategory: 'Textile',
    specificMaterial: 'Comber Noil & OE Spinning Waste',
    minQuantity: 500,
    maxQuantity: 10000,
    unit: 'kg',
    requiredQuality: 'Dry, uncolored, moisture < 8%',
    preferredLocation: 'Coimbatore / Tiruppur / Erode',
    frequency: 'Weekly',
    targetPriceRange: '₹85 - ₹110 / kg spot payment',
    additionalNotes: 'Spot cash settlement on weight-bridge slip. Immediate pickup with our 14-ft container truck.',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    isDemo: true
  },
  {
    requirementId: 'req-seed-02',
    dealerBusinessId: 'biz-dealer-02',
    dealerUserId: 'demo-dealer-02',
    dealerBusinessName: 'Kongu Green Polymer Processors',
    title: 'Regular Requirement: HDPE Drum Scrap & Pallets',
    materialCategory: 'Plastic',
    specificMaterial: 'High Density Polyethylene (Blow / Injection)',
    minQuantity: 300,
    maxQuantity: 5000,
    unit: 'kg',
    requiredQuality: 'Pre-rinsed, oil-free',
    preferredLocation: 'Coimbatore & Erode Industrial Zones',
    frequency: 'Monthly',
    targetPriceRange: '₹42 - ₹55 / kg based on MFI',
    additionalNotes: 'Direct factory gate weighing. Environmental manifest provided.',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    isDemo: true
  }
];

export const dealerService = {
  async getRequirements(): Promise<MaterialRequirement[]> {
    let localReqs: MaterialRequirement[] = [];
    try {
      const stored = localStorage.getItem('wastexchange_requirements');
      if (stored) {
        localReqs = JSON.parse(stored);
      }
    } catch {
      // ignore localstorage error
    }

    let remoteReqs: MaterialRequirement[] = [];
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('material_requirements')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          remoteReqs = data.map(d => ({
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
        }
      } catch (err) {
        console.warn('Error querying material requirements from Supabase:', err);
      }
    }

    const all = [...localReqs, ...remoteReqs, ...SEED_REQUIREMENTS];
    const map = new Map<string, MaterialRequirement>();
    all.forEach(item => {
      if (item.requirementId && !map.has(item.requirementId)) {
        map.set(item.requirementId, item);
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  },

  async createRequirement(req: MaterialRequirement): Promise<void> {
    try {
      const stored = localStorage.getItem('wastexchange_requirements');
      const list: MaterialRequirement[] = stored ? JSON.parse(stored) : [];
      const updated = [req, ...list.filter(r => r.requirementId !== req.requirementId)];
      localStorage.setItem('wastexchange_requirements', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    if (isSupabaseConfigured()) {
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
    }
  },

  async saveRequirement(req: MaterialRequirement): Promise<void> {
    return this.createRequirement(req);
  }
};

export const transactionService = {
  async getPurchaseRequests(): Promise<PurchaseRequest[]> {
    let localRequests: PurchaseRequest[] = [];
    try {
      const stored = localStorage.getItem('wastexchange_purchase_requests');
      if (stored) {
        localRequests = JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    let remoteRequests: PurchaseRequest[] = [];
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('purchase_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          remoteRequests = data.map(d => ({
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
            proposedPrice: d.proposed_price,
            proposedPickupDate: d.proposed_pickup_date,
            message: d.message,
            status: d.status,
            rejectionReason: d.rejection_reason,
            transactionId: d.transaction_id,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
            isDemo: d.is_demo
          }));
        }
      } catch (err) {
        console.warn('Error querying purchase requests from Supabase:', err);
      }
    }

    const all = [...localRequests, ...remoteRequests];
    const map = new Map<string, PurchaseRequest>();
    all.forEach(item => {
      if (item.requestId && !map.has(item.requestId)) {
        map.set(item.requestId, item);
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  },

  async createPurchaseRequest(pr: PurchaseRequest): Promise<void> {
    try {
      const stored = localStorage.getItem('wastexchange_purchase_requests');
      const list: PurchaseRequest[] = stored ? JSON.parse(stored) : [];
      const updated = [pr, ...list.filter(r => r.requestId !== pr.requestId)];
      localStorage.setItem('wastexchange_purchase_requests', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('purchase_requests').upsert({
          request_id: pr.requestId,
          listing_id: pr.listingId,
          waste_name: pr.wasteName,
          buyer_user_id: pr.buyerUserId?.includes('-') && pr.buyerUserId.length > 30 ? pr.buyerUserId : undefined,
          buyer_business_name: pr.buyerBusinessName,
          seller_user_id: pr.sellerUserId?.includes('-') && pr.sellerUserId.length > 30 ? pr.sellerUserId : undefined,
          seller_business_name: pr.sellerBusinessName,
          requested_quantity: pr.requestedQuantity,
          unit: pr.unit,
          proposed_price: pr.proposedPrice,
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
    }
  },

  async savePurchaseRequest(pr: PurchaseRequest): Promise<void> {
    return this.createPurchaseRequest(pr);
  },

  async getTransactions(): Promise<TransactionRecord[]> {
    let localTxs: TransactionRecord[] = [];
    try {
      const stored = localStorage.getItem('wastexchange_transactions');
      if (stored) {
        localTxs = JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    let remoteTxs: TransactionRecord[] = [];
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          remoteTxs = data.map(d => ({
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
        }
      } catch (err) {
        console.warn('Error fetching transactions from Supabase:', err);
      }
    }

    const all = [...localTxs, ...remoteTxs];
    const map = new Map<string, TransactionRecord>();
    all.forEach(item => {
      if (item.transactionId && !map.has(item.transactionId)) {
        map.set(item.transactionId, item);
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  },

  async saveTransaction(tx: TransactionRecord): Promise<void> {
    try {
      const stored = localStorage.getItem('wastexchange_transactions');
      const list: TransactionRecord[] = stored ? JSON.parse(stored) : [];
      const updated = [tx, ...list.filter(r => r.transactionId !== tx.transactionId)];
      localStorage.setItem('wastexchange_transactions', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('transactions').upsert({
          transaction_id: tx.transactionId,
          purchase_request_id: tx.purchaseRequestId,
          listing_id: tx.listingId,
          waste_name: tx.wasteName,
          buyer_user_id: tx.buyerUserId?.includes('-') && tx.buyerUserId.length > 30 ? tx.buyerUserId : undefined,
          buyer_business_name: tx.buyerBusinessName,
          seller_user_id: tx.sellerUserId?.includes('-') && tx.sellerUserId.length > 30 ? tx.sellerUserId : undefined,
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
  }
};

export const marketplaceService = {
  async getListings(): Promise<WasteListing[]> {
    // 1. Fetch from LocalStorage
    let localListings: WasteListing[] = [];
    try {
      const stored = localStorage.getItem('wastexchange_listings');
      if (stored) {
        localListings = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading local listings:', e);
    }

    // 2. Fetch from Supabase if configured
    let remoteListings: WasteListing[] = [];
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('waste_listings')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          remoteListings = data.map(d => ({
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
        }
      } catch (err) {
        console.warn('Error fetching waste listings from Supabase:', err);
      }
    }

    // 3. Merge: Local items take precedence, then remote, then seed items
    const mergedMap = new Map<string, WasteListing>();

    // Local items (newly created by the user in this browser session)
    localListings.forEach(l => {
      if (l.listingId) mergedMap.set(l.listingId, l);
    });

    // Remote items
    remoteListings.forEach(l => {
      if (l.listingId && !mergedMap.has(l.listingId)) {
        mergedMap.set(l.listingId, l);
      }
    });

    // Baseline Seed items
    SEED_LISTINGS.forEach(l => {
      if (l.listingId && !mergedMap.has(l.listingId)) {
        mergedMap.set(l.listingId, l);
      }
    });

    const result = Array.from(mergedMap.values());
    return result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  },

  async saveListing(listing: WasteListing): Promise<void> {
    // 1. Immediately save to LocalStorage so it appears instantly on the marketplace
    try {
      const stored = localStorage.getItem('wastexchange_listings');
      const list: WasteListing[] = stored ? JSON.parse(stored) : [];
      const updated = [listing, ...list.filter(item => item.listingId !== listing.listingId)];
      localStorage.setItem('wastexchange_listings', JSON.stringify(updated));
      localStorage.setItem(`wasteListing_${listing.listingId}`, JSON.stringify(listing));
      window.dispatchEvent(new CustomEvent('wastexchange_listing_saved', { detail: listing }));
    } catch (e) {
      console.warn('Error saving listing to local storage:', e);
    }

    // 2. Persist to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('waste_listings').upsert({
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

        if (error) {
          console.warn('Supabase listing upsert warning (local copy preserved):', error);
        }
      } catch (err) {
        console.warn('Error saving listing to Supabase:', err);
      }
    }
  }
};

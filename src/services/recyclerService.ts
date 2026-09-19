import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { 
  RecyclingRequest, 
  RecyclingStage, 
  RecycledProduct, 
  ConsumerOrder 
} from '../types';

export const SEED_RECYCLING_REQUESTS: RecyclingRequest[] = [
  {
    requestId: 'rec-req-101',
    wasteAssessmentId: 'assess-tx-01',
    wasteName: 'Baled Comber Cotton Spinning Waste',
    materialCategory: 'Textiles',
    quantity: 1200,
    unit: 'kg',
    wasteOwnerUserId: 'user-industry-01',
    wasteOwnerName: 'Kongu Cotton & Spinning Mills',
    wasteOwnerLocation: 'Coimbatore, Tamil Nadu',
    recyclerId: 'rec-01',
    recyclerName: 'Kongu Green Polymer & Fibre Processors',
    status: 'PROCESSED',
    stageHistory: [
      { stage: 'SUBMITTED', timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), note: 'Batch submitted from mill waste stream', updatedBy: 'Kongu Cotton Mills' },
      { stage: 'ACCEPTED', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), note: 'Inspection approved: 98.4% cotton purity', updatedBy: 'Kongu Recyclers QC' },
      { stage: 'COLLECTED', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), note: 'Logistics dispatched with GPS tracking #TRK-CBE-92', updatedBy: 'WasteXchange Fleet' },
      { stage: 'PROCESSING', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), note: 'Fibre opening and carding stage in progress', updatedBy: 'Facility Operator 2' },
      { stage: 'PROCESSED', timestamp: new Date().toISOString(), note: 'Regenerated organic yarn sliver ready for product conversion', updatedBy: 'Lead Engineer' }
    ],
    processingDetails: {
      temperatureCelsius: 85,
      energyKwh: 340,
      yieldPercentage: 92,
      outputGrade: 'Grade-A Regenerated Open-End Yarn Sliver'
    },
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    requestId: 'rec-req-102',
    wasteAssessmentId: 'assess-pl-02',
    wasteName: 'High-Density Polyethylene (HDPE) Regrind Flakes',
    materialCategory: 'Plastics & Polymers',
    quantity: 3500,
    unit: 'kg',
    wasteOwnerUserId: 'user-industry-02',
    wasteOwnerName: 'Premier Polymers & Blow-Moulding Unit',
    wasteOwnerLocation: 'Erode, Tamil Nadu',
    recyclerId: 'rec-01',
    recyclerName: 'Kongu Green Polymer & Fibre Processors',
    status: 'PROCESSING',
    stageHistory: [
      { stage: 'SUBMITTED', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), note: 'Post-industrial clean drum trim scrap', updatedBy: 'Premier Polymers' },
      { stage: 'ACCEPTED', timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(), note: 'Density 0.955 g/cm³ verified with zero PVC contamination', updatedBy: 'Kongu Recyclers QC' },
      { stage: 'COLLECTED', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), note: 'Transport delivered to Erode sorting bay', updatedBy: 'WasteXchange Fleet' },
      { stage: 'PROCESSING', timestamp: new Date().toISOString(), note: 'Hot-wash cycle and twin-screw extrusion compounding', updatedBy: 'Plant Supervisor' }
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    requestId: 'rec-req-103',
    wasteAssessmentId: 'assess-met-03',
    wasteName: 'Aluminium Extrusion Off-Cuts (Grade 6063-T6)',
    materialCategory: 'Metals & Alloys',
    quantity: 2400,
    unit: 'kg',
    wasteOwnerUserId: 'user-industry-03',
    wasteOwnerName: 'Apex Precision Extrusions Pvt Ltd',
    wasteOwnerLocation: 'Hosur, Tamil Nadu',
    recyclerId: 'rec-01',
    recyclerName: 'Kongu Green Polymer & Fibre Processors',
    status: 'COLLECTED',
    stageHistory: [
      { stage: 'SUBMITTED', timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(), note: 'Anodized 6063 clean architectural profiles', updatedBy: 'Apex Precision' },
      { stage: 'ACCEPTED', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), note: 'Spectrometry analysis confirmed Mg: 0.5%, Si: 0.4%', updatedBy: 'Kongu Recyclers QC' },
      { stage: 'COLLECTED', timestamp: new Date().toISOString(), note: 'Loaded and en route to furnace remelting line', updatedBy: 'WasteXchange Logistics' }
    ],
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const SEED_PRODUCTS: RecycledProduct[] = [
  {
    productId: 'prod-seed-01',
    title: '100% Recycled Cotton Heavy Canvas Eco Tote',
    category: 'Fashion & Apparel',
    price: 349,
    currency: 'INR',
    stock: 85,
    unit: 'pieces',
    wasteOriginName: 'Baled Comber Cotton Spinning Waste',
    sourceMaterial: 'Regenerated Mill Spinning Comber Cotton',
    recyclerId: 'rec-01',
    recyclerName: 'Kongu Green Polymer & Fibre Processors',
    description: 'Durable 380 GSM everyday carry tote bag woven purely from diverted textile mill spinning secondary fibers. Zero virgin cotton used.',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'
    ],
    environmentalSavings: {
      co2KgSaved: 4.8,
      virginMaterialAvoidedKg: 0.4,
      waterLitersSaved: 1200
    },
    specifications: {
      'Fabric Weight': '380 GSM Heavy Weave',
      'Handle Reinforcement': 'Cross-stitch Bar-tacked',
      'Traceability Source': 'Kongu Cotton Mills, Coimbatore',
      'Eco Certification': 'Circular Material Verified (WasteXchange ISO-14021)'
    },
    featured: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    productId: 'prod-seed-02',
    title: 'Modular High-Density Recycled Interlocking Paver Tile',
    category: 'Building & Construction',
    price: 480,
    currency: 'INR',
    stock: 250,
    unit: 'sq ft',
    wasteOriginName: 'High-Density Polyethylene Regrind Flakes',
    sourceMaterial: 'Decontaminated Post-Industrial HDPE Regrind',
    recyclerId: 'rec-01',
    recyclerName: 'Kongu Green Polymer & Fibre Processors',
    description: 'Heavy duty, weather-resistant interlocking ground pavers for parking bays and walkways made from re-engineered HDPE scrap.',
    images: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
    ],
    environmentalSavings: {
      co2KgSaved: 14.2,
      virginMaterialAvoidedKg: 6.5,
      waterLitersSaved: 350
    },
    specifications: {
      'Load Capacity': 'Up to 25 Tonnes / sq.m',
      'UV Stability': 'Class 4 (10+ Year Outdoor Life)',
      'Water Absorption': '< 0.02%',
      'Origin Batch': 'Premier Polymers, Erode'
    },
    featured: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    productId: 'prod-seed-03',
    title: 'Architectural Anodized Aluminium Desk Organizer Set',
    category: 'Home & Living',
    price: 890,
    currency: 'INR',
    stock: 40,
    unit: 'sets',
    wasteOriginName: 'Aluminium Extrusion Off-Cuts (6063)',
    sourceMaterial: 'Precision Remelted Grade 6063 Aluminium Alloy',
    recyclerId: 'rec-01',
    recyclerName: 'Kongu Green Polymer & Fibre Processors',
    description: 'Precision CNC-machined minimalist desktop organizer set manufactured from structural extrusion cutoffs.',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80'
    ],
    environmentalSavings: {
      co2KgSaved: 18.5,
      virginMaterialAvoidedKg: 2.2,
      waterLitersSaved: 480
    },
    specifications: {
      'Finish': 'Matte Bead-Blasted Gunmetal',
      'Recycled Content': '100% Remelt Secondary Alloy',
      'Origin Batch': 'Apex Precision Extrusions'
    },
    featured: true,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

export const recyclerService = {
  async getRequests(): Promise<RecyclingRequest[]> {
    const local = localStorage.getItem('wastexchange_recycling_requests');
    let localItems: RecyclingRequest[] = [];
    if (local) {
      try {
        localItems = JSON.parse(local);
      } catch (e) {
        console.warn('Failed to parse local recycling requests:', e);
      }
    }

    if (!isSupabaseConfigured()) {
      return localItems.length > 0 ? localItems : SEED_RECYCLING_REQUESTS;
    }

    try {
      const { data, error } = await supabase
        .from('recycling_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return localItems.length > 0 ? localItems : SEED_RECYCLING_REQUESTS;
      }

      const remoteItems: RecyclingRequest[] = data.map(d => ({
        requestId: d.id,
        wasteAssessmentId: d.waste_id || d.id,
        wasteName: d.waste_name,
        materialCategory: d.material_category,
        quantity: Number(d.quantity) || 0,
        unit: d.unit || 'kg',
        wasteOwnerUserId: d.waste_owner_user_id || 'user-owner-default',
        wasteOwnerName: d.waste_owner_name || 'Industrial Stream',
        wasteOwnerLocation: d.waste_owner_location || 'Tamil Nadu',
        recyclerId: d.recycler_id || 'rec-01',
        recyclerName: d.recycler_name || 'Authorized Recycler',
        status: (d.status?.toUpperCase() || 'SUBMITTED') as RecyclingStage,
        stageHistory: d.stage_history || [],
        processingDetails: d.processing_details,
        convertedProductId: d.converted_product_id,
        createdAt: d.created_at,
        updatedAt: d.updated_at
      }));

      const map = new Map<string, RecyclingRequest>();
      [...SEED_RECYCLING_REQUESTS, ...remoteItems, ...localItems].forEach(r => map.set(r.requestId, r));
      return Array.from(map.values());
    } catch (err) {
      console.warn('Error fetching recycling requests from Supabase:', err);
      return localItems.length > 0 ? localItems : SEED_RECYCLING_REQUESTS;
    }
  },

  async saveRequest(req: RecyclingRequest): Promise<void> {
    try {
      const existing = await this.getRequests();
      const idx = existing.findIndex(r => r.requestId === req.requestId);
      if (idx >= 0) {
        existing[idx] = req;
      } else {
        existing.unshift(req);
      }
      localStorage.setItem('wastexchange_recycling_requests', JSON.stringify(existing));
      window.dispatchEvent(new CustomEvent('wastexchange_recycler_updated'));
    } catch (e) {
      console.warn('Local save failed:', e);
    }

    if (!isSupabaseConfigured()) return;

    try {
      await supabase.from('recycling_requests').upsert({
        id: req.requestId?.includes('-') && req.requestId.length > 30 ? req.requestId : undefined,
        waste_name: req.wasteName,
        material_category: req.materialCategory,
        quantity: req.quantity,
        unit: req.unit,
        waste_owner_name: req.wasteOwnerName,
        waste_owner_location: req.wasteOwnerLocation,
        recycler_id: req.recyclerId?.includes('-') && req.recyclerId.length > 30 ? req.recyclerId : undefined,
        recycler_name: req.recyclerName,
        status: req.status,
        stage_history: req.stageHistory || [],
        processing_details: req.processingDetails,
        converted_product_id: req.convertedProductId?.includes('-') && req.convertedProductId.length > 30 ? req.convertedProductId : undefined,
        created_at: req.createdAt || new Date().toISOString(),
        updated_at: req.updatedAt || new Date().toISOString()
      });
    } catch (err) {
      console.warn('Error saving recycling request to Supabase:', err);
    }
  },

  async updateStage(requestId: string, stage: RecyclingStage, note: string): Promise<void> {
    const existing = await this.getRequests();
    const req = existing.find(r => r.requestId === requestId);
    if (req) {
      req.status = stage;
      req.updatedAt = new Date().toISOString();
      req.stageHistory.push({
        stage,
        timestamp: new Date().toISOString(),
        note,
        updatedBy: req.recyclerName || 'Facility Supervisor'
      });
      await this.saveRequest(req);
    }

    if (!isSupabaseConfigured()) return;

    try {
      await supabase
        .from('recycling_requests')
        .update({
          status: stage,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);
    } catch (err) {
      console.warn('Error updating stage in Supabase:', err);
    }
  }
};

export const productService = {
  async getProducts(category?: string, search?: string): Promise<RecycledProduct[]> {
    const local = localStorage.getItem('wastexchange_products');
    let localList: RecycledProduct[] = [];
    if (local) {
      try {
        localList = JSON.parse(local);
      } catch (e) {
        console.warn('Failed to parse local products:', e);
      }
    }

    let combined = localList.length > 0 ? localList : SEED_PRODUCTS;

    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('products').select('*').order('created_at', { ascending: false });
        if (category && category !== 'All') {
          query = query.eq('category', category);
        }
        if (search) {
          query = query.ilike('name', `%${search}%`);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const remoteList: RecycledProduct[] = data.map(d => ({
            productId: d.id,
            recyclingRequestId: d.recycling_request_id || d.id,
            title: d.name,
            category: (d.category || 'Industrial Feedstock') as any,
            price: Number(d.price) || 0,
            currency: d.currency || 'INR',
            stock: d.quantity || 0,
            unit: d.unit || 'units',
            wasteOriginName: d.waste_origin_name || 'Recycled Feedstock',
            sourceMaterial: d.material || 'Recycled Polymer',
            recyclerId: d.recycler_id || 'rec-01',
            recyclerName: d.recycler_name || 'EcoLoop Converters',
            description: d.description || '',
            images: d.images && d.images.length > 0 ? d.images : (d.image_path ? [d.image_path] : ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80']),
            environmentalSavings: {
              co2KgSaved: d.environmental_savings?.co2KgSaved || 5,
              virginMaterialAvoidedKg: d.environmental_savings?.virginMaterialAvoidedKg || 2,
              waterLitersSaved: d.environmental_savings?.waterLitersSaved || 50
            },
            specifications: d.specifications || {},
            featured: Boolean(d.featured),
            createdAt: d.created_at
          }));

          const map = new Map<string, RecycledProduct>();
          [...SEED_PRODUCTS, ...remoteList, ...localList].forEach(p => map.set(p.productId, p));
          combined = Array.from(map.values());
        }
      } catch (err) {
        console.warn('Error fetching products from Supabase:', err);
      }
    }

    if (category && category !== 'All') {
      combined = combined.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      combined = combined.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.sourceMaterial.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }

    return combined;
  },

  async createProduct(product: RecycledProduct): Promise<void> {
    try {
      const existing = await this.getProducts();
      const idx = existing.findIndex(p => p.productId === product.productId);
      if (idx >= 0) {
        existing[idx] = product;
      } else {
        existing.unshift(product);
      }
      localStorage.setItem('wastexchange_products', JSON.stringify(existing));
      window.dispatchEvent(new CustomEvent('wastexchange_product_created', { detail: product }));
    } catch (e) {
      console.warn('Error persisting product locally:', e);
    }

    if (!isSupabaseConfigured()) return;

    try {
      await supabase.from('products').upsert({
        id: product.productId?.includes('-') && product.productId.length > 30 ? product.productId : undefined,
        name: product.title,
        category: product.category,
        material: product.sourceMaterial,
        waste_origin_name: product.wasteOriginName,
        recycler_name: product.recyclerName,
        price: product.price,
        currency: product.currency || 'INR',
        quantity: product.stock,
        unit: product.unit,
        description: product.description,
        image_path: product.images?.[0] || '',
        images: product.images || [],
        environmental_savings: product.environmentalSavings,
        specifications: product.specifications || {},
        featured: Boolean(product.featured),
        status: 'published',
        created_at: product.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Error creating product in Supabase:', err);
    }
  }
};

export const orderService = {
  async getOrders(): Promise<ConsumerOrder[]> {
    const local = localStorage.getItem('wastexchange_consumer_orders');
    let localOrders: ConsumerOrder[] = [];
    if (local) {
      try {
        localOrders = JSON.parse(local);
      } catch (e) {
        console.warn('Failed to parse local orders:', e);
      }
    }

    if (!isSupabaseConfigured()) return localOrders;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error || !data) return localOrders;

      const remoteOrders: ConsumerOrder[] = data.map(d => ({
        orderId: d.id,
        consumerUserId: d.consumer_user_id || 'user-consumer-default',
        consumerName: d.consumer_name || 'Consumer',
        consumerEmail: d.consumer_email || '',
        items: (d.order_items || []).map((oi: any) => ({
          productId: oi.product_id || oi.id,
          productTitle: oi.product_name,
          category: 'Consumer Goods',
          price: Number(oi.unit_price) || 0,
          quantity: oi.quantity || 1,
          imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
          sourceMaterial: oi.source_material || 'Recycled Secondary Material',
          recyclerName: oi.recycler_name || 'Eco Converter',
          subtotal: Number(oi.subtotal) || (Number(oi.unit_price) || 0) * (oi.quantity || 1)
        })),
        totalAmount: Number(d.total_amount) || 0,
        shippingAddress: d.shipping_address || {
          street: 'Main Road',
          city: 'Coimbatore',
          state: 'Tamil Nadu',
          pincode: '641001',
          phone: '+91 98765 43210'
        },
        status: (d.status?.toUpperCase() || 'ORDER_PLACED') as any,
        totalEcoImpact: {
          co2SavedKg: d.total_eco_impact?.co2SavedKg || 10,
          plasticAvoidedKg: d.total_eco_impact?.plasticAvoidedKg || 4
        },
        trackingNumber: d.tracking_number || `TRK-${d.id?.slice(0, 8) || 'WX'}`,
        createdAt: d.created_at,
        updatedAt: d.updated_at
      }));

      const map = new Map<string, ConsumerOrder>();
      [...remoteOrders, ...localOrders].forEach(o => map.set(o.orderId, o));
      return Array.from(map.values());
    } catch (err) {
      console.warn('Error fetching orders from Supabase:', err);
      return localOrders;
    }
  },

  async createOrder(order: ConsumerOrder): Promise<void> {
    try {
      const existing = await this.getOrders();
      existing.unshift(order);
      localStorage.setItem('wastexchange_consumer_orders', JSON.stringify(existing));
      window.dispatchEvent(new CustomEvent('wastexchange_order_placed', { detail: order }));
    } catch (e) {
      console.warn('Local save failed:', e);
    }

    if (!isSupabaseConfigured()) return;

    try {
      const { data: ord, error: ordErr } = await supabase
        .from('orders')
        .insert({
          id: order.orderId?.includes('-') && order.orderId.length > 30 ? order.orderId : undefined,
          consumer_user_id: order.consumerUserId?.includes('-') && order.consumerUserId.length > 30 ? order.consumerUserId : undefined,
          consumer_name: order.consumerName,
          consumer_email: order.consumerEmail,
          total_amount: order.totalAmount,
          shipping_address: order.shippingAddress,
          status: order.status,
          total_eco_impact: order.totalEcoImpact,
          tracking_number: order.trackingNumber,
          created_at: order.createdAt || new Date().toISOString()
        })
        .select()
        .single();

      if (ordErr || !ord) {
        console.warn('Failed to insert order in Supabase:', ordErr);
        return;
      }

      const itemsToInsert = order.items.map(it => ({
        order_id: ord.id,
        product_id: it.productId?.includes('-') && it.productId.length > 30 ? it.productId : undefined,
        product_name: it.productTitle,
        unit_price: it.price,
        quantity: it.quantity,
        subtotal: it.subtotal,
        recycler_name: it.recyclerName,
        source_material: it.sourceMaterial
      }));

      await supabase.from('order_items').insert(itemsToInsert);
    } catch (err) {
      console.warn('Error creating order in Supabase:', err);
    }
  }
};

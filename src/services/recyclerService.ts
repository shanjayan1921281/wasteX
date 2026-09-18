import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { 
  RecyclingRequest, 
  RecyclingStage, 
  RecycledProduct, 
  ConsumerOrder 
} from '../types';

export const recyclerService = {
  async getRequests(): Promise<RecyclingRequest[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('recycling_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map(d => ({
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
    } catch (err) {
      console.warn('Error fetching recycling requests from Supabase:', err);
      return [];
    }
  },

  async saveRequest(req: RecyclingRequest): Promise<void> {
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
    if (!isSupabaseConfigured()) return [];

    try {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });
      if (category && category !== 'All') {
        query = query.eq('category', category);
      }
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query;
      if (error || !data) return [];

      return data.map(d => ({
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
    } catch (err) {
      console.warn('Error fetching products from Supabase:', err);
      return [];
    }
  },

  async createProduct(product: RecycledProduct): Promise<void> {
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
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map(d => ({
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
    } catch (err) {
      console.warn('Error fetching orders from Supabase:', err);
      return [];
    }
  },

  async createOrder(order: ConsumerOrder): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .insert({
          id: order.orderId?.includes('-') && order.orderId.length > 30 ? order.orderId : undefined,
          consumer_user_id: order.consumerUserId?.includes('-') && order.consumerUserId.length > 30 ? order.consumerUserId : undefined,
          consumer_name: order.consumerName,
          consumer_email: order.consumerEmail,
          status: order.status.toLowerCase(),
          total_amount: order.totalAmount,
          shipping_address: order.shippingAddress,
          total_eco_impact: order.totalEcoImpact,
          tracking_number: order.trackingNumber,
          created_at: order.createdAt || new Date().toISOString(),
          updated_at: order.updatedAt || new Date().toISOString()
        })
        .select()
        .single();

      if (orderErr || !orderData) {
        console.warn('Notice inserting order in Supabase:', orderErr);
        return;
      }

      const itemsToInsert = order.items.map(it => ({
        order_id: orderData.id,
        product_name: it.productTitle,
        quantity: it.quantity,
        unit_price: it.price,
        source_material: it.sourceMaterial,
        recycler_name: it.recyclerName,
        subtotal: it.subtotal || it.price * it.quantity
      }));

      await supabase.from('order_items').insert(itemsToInsert);
    } catch (err) {
      console.warn('Error persisting order in Supabase:', err);
    }
  }
};

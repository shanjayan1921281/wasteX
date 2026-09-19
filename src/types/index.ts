export type UserRole = 'owner' | 'industry' | 'dealer' | 'recycler' | 'consumer' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  businessId?: string;
  phone?: string;
  location?: string;
  isVerified: boolean;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface BusinessProfile {
  businessId: string;
  ownerUserId: string;
  businessName: string;
  businessType: 'industry' | 'dealer' | 'recycler' | 'consumer' | 'admin' | 'owner';
  role: UserRole;
  industryCategory: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface WasteAssessment {
  assessmentId: string;
  ownerUserId: string;
  businessId: string;
  businessName: string;
  wasteName: string;
  materialCategory: 'Textile' | 'Plastic' | 'Metal' | 'Rubber' | 'Cardboard' | 'Chemical' | 'Other';
  wasteType: string;
  quantity: number;
  unit: 'kg' | 'tonnes' | 'litres' | 'units';
  location: string;
  generationFrequency: 'Daily' | 'Weekly' | 'Bi-weekly' | 'Monthly' | 'Quarterly' | 'Batch-wise';
  availability: 'Immediate' | 'Within 1 Week' | 'Within 1 Month' | 'Continuous Stream';
  description: string;
  
  // Quality info
  grade: string;
  moistureLevel: string; // e.g. "Low (<5%)", "Medium", "High", "Unknown"
  contaminationLevel: string; // e.g. "Minimal (<2%)", "Moderate", "High", "Unknown"
  isSeparated: 'Separated' | 'Mixed' | 'Unknown';
  condition: 'Clean' | 'Dusty' | 'Oil-contaminated' | 'Raw Scrap' | 'Processed';
  additionalNotes?: string;
  
  // Evidence
  images: {
    url: string;
    fileName: string;
    uploadedAt: string;
  }[];
  
  status: 'DRAFT' | 'ANALYZED' | 'LISTED';
  reportId?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface WasteIntelligenceReport {
  reportId: string;
  assessmentId: string;
  industryName: string;
  location: string;
  wasteName: string;
  materialCategory: string;
  quantity: number;
  unit: string;
  analysisDate: string;
  aiConfidence: number; // 0 - 100
  disclaimer: string;
  
  executiveSummary: {
    materialIdentified: string;
    currentQuantity: string;
    estimatedQuality: string;
    recoverability: 'High' | 'Medium' | 'Low';
    potentialReuse: string;
    marketDemand: 'High Demand' | 'Medium Demand' | 'Moderate' | 'Low Demand' | 'Niche';
    potentialBuyerCount: number;
    recommendedAction: string;
    summaryText: string;
  };

  compositionAnalysis: {
    primaryMaterial: string;
    primaryPercentage: number;
    secondaryMaterials: { material: string; percentage: number }[];
    possibleContaminants: string[];
    materialConfidence: number;
    qualityGrade: string;
    labelNote: string;
  };

  quantityAnalysis: {
    currentAvailableQuantity: string;
    averageWeeklyGeneration: string;
    estimatedMonthlyGeneration: string;
    estimatedRecoverableQuantity: string;
    calculatedNotes: string;
  };

  generationPattern: {
    weeklyGeneration: string;
    monthlyGeneration: string;
    peakGenerationPeriods: string;
    productionRelationship: string;
    estimatedFutureAvailability: string;
  };

  pathways: {
    directReuse: PathwayDetail;
    recycling: PathwayDetail;
    recovery: PathwayDetail;
    upcycling: PathwayDetail;
  };

  aiRecommendation: {
    recommendedPathway: string;
    whyThisPathway: string;
    recommendedNextAction: string;
    potentialPreparationRequired: string;
    potentialBuyerCategory: string;
  };

  marketDemandAnalysis: {
    demandLevel: 'High Demand' | 'Medium Demand' | 'Low Demand';
    potentialBuyerCategories: string[];
    typicalRequiredQuantities: string;
    targetLocations: string[];
    numberOfPotentialMatches: number;
    demandSummary: string;
  };

  // RAG Knowledge Layer & Attribution
  sourceAttribution?: {
    userProvidedData: {
      declaredQuantity: string;
      declaredGrade: string;
      declaredFrequency: string;
      declaredMoisture: string;
      declaredContamination: string;
      declaredCondition: string;
      facilityLocation: string;
      notes: string;
    };
    aiVisualEstimate: {
      hasVisualEvidence: boolean;
      visualPurityEstimate: string;
      apparentPackagingOrBaling: string;
      surfaceTextureAndParticleForm: string;
      visualContaminationObservations: string;
    };
    knowledgeBasedInfo: {
      authoritativeSourceTitle: string;
      documentCode: string;
      governingStandards: string;
      permissibleMoistureThreshold: string;
      criticalContaminationThresholds: string;
      scientificRecoveryDirectives: string;
      nonRecyclabilityCaveats: string;
    };
    aiInference: {
      recoveryFeasibilitySummary: string;
      marketDemandRationale: string;
      regionalLogisticsFeasibility: string;
      commercialRisksAndPreparation: string;
    };
  };

  knowledgeCitations?: KnowledgeCitation[];
  groundingSources?: { title: string; url: string }[];

  createdAt: string;
  isDemo?: boolean;
}

export interface KnowledgeCitation {
  documentCode: string;
  documentTitle: string;
  section: string;
  keyFinding: string;
  relevanceScore: number;
}

export interface KnowledgeDocument {
  id: string;
  code: string;
  title: string;
  category: string;
  keywords: string[];
  summary: string;
  lastUpdated: string;
  authoritativeSource: string;
  content: string;
  sectionsCount: number;
  wordCount: number;
  sections?: { title: string; content: string }[];
}

export interface KnowledgeSearchResult {
  document: KnowledgeDocument;
  relevanceScore: number;
  matchingSections: {
    title: string;
    snippet: string;
  }[];
}

export interface PathwayDetail {
  suitability: 'High' | 'Medium' | 'Low' | 'Not Recommended';
  requiredProcessing: string;
  possibleOutput: string;
  benefits: string;
  limitations: string;
  confidenceScore: number;
}

export interface WasteListing {
  listingId: string;
  assessmentId: string;
  reportId: string;
  sellerBusinessId: string;
  sellerBusinessName: string;
  sellerUserId: string;
  wasteName: string;
  materialCategory: string;
  wasteType: string;
  quantity: number;
  availableQuantity: number;
  minPurchaseQuantity: number;
  unit: string;
  quality: string;
  grade: string;
  location: string;
  availability: string;
  description: string;
  images: { url: string; fileName: string }[];
  aiMatchPotential: string;
  aiReportSummary: string;
  recommendedPathway: string;
  status: 'LISTED' | 'RESERVED' | 'SOLD' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface MaterialRequirement {
  requirementId: string;
  dealerBusinessId: string;
  dealerBusinessName: string;
  dealerUserId: string;
  title: string;
  materialCategory: string;
  specificMaterial: string;
  minQuantity: number;
  maxQuantity: number;
  unit: string;
  requiredQuality: string;
  preferredLocation: string;
  frequency: 'One-time' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Continuous';
  targetPriceRange?: string;
  additionalNotes?: string;
  status: 'ACTIVE' | 'PAUSED' | 'FULFILLED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface BuyerMatch {
  matchId: string;
  listingId: string;
  requirementId: string;
  buyerBusinessId: string;
  buyerBusinessName: string;
  sellerBusinessId: string;
  sellerBusinessName: string;
  score: number; // 0 - 100
  breakdown: {
    material: number; // /30
    quantity: number; // /20
    quality: number;  // /15
    location: number; // /15
    demand: number;   // /10
    availability: number; // /10
  };
  reasons: string[];
  aiExplanation: string;
  createdAt: string;
  isDemo?: boolean;
}

export interface PurchaseRequest {
  requestId: string;
  listingId: string;
  wasteName: string;
  sellerBusinessId: string;
  sellerBusinessName: string;
  sellerUserId: string;
  buyerBusinessId: string;
  buyerBusinessName: string;
  buyerUserId: string;
  requestedQuantity: number;
  unit: string;
  proposedPrice?: string | number;
  proposedPickupDate: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  rejectionReason?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface TransactionRecord {
  transactionId: string;
  purchaseRequestId: string;
  listingId: string;
  wasteName: string;
  buyerBusinessId: string;
  buyerBusinessName: string;
  buyerUserId: string;
  sellerBusinessId: string;
  sellerBusinessName: string;
  sellerUserId: string;
  quantity: number;
  unit: string;
  location: string;
  status: 'TRANSACTION_CONFIRMED' | 'PICKUP_SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED';
  pickupDate: string;
  deliveryDate?: string;
  notes?: string;
  timeline: {
    status: string;
    timestamp: string;
    note: string;
    actor: string;
  }[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  isDemo?: boolean;
}

export interface NotificationItem {
  notificationId: string;
  recipientUserId: string;
  title: string;
  message: string;
  type: 'AI_REPORT_READY' | 'BUYER_MATCH' | 'PURCHASE_REQUEST' | 'REQUEST_ACCEPTED' | 'REQUEST_REJECTED' | 'TRANSACTION_UPDATE' | 'VERIFICATION';
  referenceId?: string;
  referenceType?: 'report' | 'listing' | 'request' | 'transaction' | 'business';
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  logId: string;
  actorUserId: string;
  actorEmail?: string;
  actorRole: UserRole;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// HACKATHON CORE CIRCULAR LIFECYCLE & ELIGIBILITY ENGINE TYPES
// ============================================================================

export type PathwayType = 'DISPOSE' | 'SELL' | 'RECYCLE' | 'REUSE';

export interface PathwayEvaluation {
  pathway: PathwayType;
  eligible: boolean;
  confidenceScore: number; // 0 - 100
  title: string;
  rationale: string;
  guidance: string;
  requirements: string[];
  recommendedCategory?: string;
  actions: {
    label: string;
    actionType: 'DISPOSE_INSTRUCTIONS' | 'CONNECT_DEALER' | 'REQUEST_RECYCLER' | 'VIEW_REUSE_IDEAS';
  };
}

export interface ExtractedWasteAttributes {
  wasteType: string;
  material: string;
  condition: string;
  quality: string;
  quantity: number;
  unit: string;
  contamination: string;
  recoverability: 'High' | 'Medium' | 'Low';
  possibleApplications: string[];
  isHazardous: boolean;
  isClean: boolean;
  hasHighMoisture: boolean;
  isDegraded: boolean;
}

export interface EligibilityResult {
  evaluationId: string;
  assessmentId: string;
  wasteName: string;
  materialCategory: string;
  evaluatedAt: string;
  engineVersion: string;
  methodology: 'Rule-Based Conditional Decision Logic';
  extractedAttributes: ExtractedWasteAttributes;
  pathways: {
    dispose: PathwayEvaluation;
    sell: PathwayEvaluation;
    recycle: PathwayEvaluation;
    reuse: PathwayEvaluation;
  };
  activePathwaysCount: number;
  selectedPathway?: PathwayType;
}

export interface RecyclerProfile {
  recyclerId: string;
  businessName: string;
  acceptedMaterials: string[];
  processingCapabilities: string[];
  minBatchKg: number;
  location: string;
  contactEmail: string;
  phone: string;
  rating: number;
  certifications: string[];
}

export interface DealerProfile {
  dealerId: string;
  businessName: string;
  acceptedMaterials: string[];
  purchasePriceRange: string;
  minQuantityKg: number;
  location: string;
  contactEmail: string;
  phone: string;
  rating: number;
}

export type RecyclingStage = 
  | 'SUBMITTED'
  | 'ACCEPTED'
  | 'COLLECTED'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'CONVERTED_TO_PRODUCT'
  | 'REJECTED';

export interface RecyclingRequest {
  requestId: string;
  wasteAssessmentId: string;
  wasteName: string;
  materialCategory: string;
  quantity: number;
  unit: string;
  wasteOwnerUserId: string;
  wasteOwnerName: string;
  wasteOwnerLocation?: string;
  recyclerId: string;
  recyclerName: string;
  status: RecyclingStage;
  stageHistory: {
    stage: RecyclingStage;
    timestamp: string;
    note: string;
    updatedBy: string;
  }[];
  processingDetails?: {
    processMethod: string;
    yieldPercentage: number;
    processingStartDate?: string;
    processingEndDate?: string;
    outputMaterial: string;
  };
  convertedProductId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecycledProduct {
  productId: string;
  title: string;
  category: 'Fashion & Apparel' | 'Home & Living' | 'Industrial Feedstock' | 'Packaging' | 'Building & Construction' | 'Consumer Goods';
  sourceMaterial: string;
  wasteOriginName: string;
  recyclingRequestId?: string;
  recyclerId: string;
  recyclerName: string;
  price: number; // in INR
  currency: string;
  stock: number;
  unit: string;
  description: string;
  specifications: Record<string, string>;
  images: string[];
  environmentalSavings: {
    co2KgSaved: number;
    waterLitersSaved: number;
    virginMaterialAvoidedKg: number;
  };
  featured: boolean;
  createdAt: string;
}

export interface CartItem {
  product: RecycledProduct;
  quantity: number;
}

export interface ConsumerOrder {
  orderId: string;
  consumerUserId: string;
  consumerName: string;
  consumerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  items: {
    productId: string;
    productTitle: string;
    price: number;
    quantity: number;
    sourceMaterial: string;
    recyclerName: string;
    subtotal: number;
  }[];
  totalAmount: number;
  totalEcoImpact: {
    co2SavedKg: number;
    plasticAvoidedKg: number;
  };
  status: 'ORDER_PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED';
  trackingNumber: string;
  createdAt: string;
  updatedAt: string;
}


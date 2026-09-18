import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import type { 
  BusinessProfile, 
  MaterialRequirement, 
  WasteAssessment, 
  WasteListing, 
  WasteIntelligenceReport,
  BuyerMatch,
  PurchaseRequest,
  TransactionRecord
} from '../types';

export async function seedDemoDataIfNeeded(): Promise<boolean> {
  // Guard: Only seed if an authenticated user session is active
  if (!auth.currentUser) {
    return false;
  }

  try {
    const demoQuery = query(collection(db, 'businesses'), where('isDemo', '==', true));
    const snapshot = await getDocs(demoQuery);
    if (!snapshot.empty) {
      return false; // Already seeded
    }

    const now = new Date().toISOString();

    // 1. Sample Businesses
    const demoBusinesses: BusinessProfile[] = [
      {
        businessId: 'demo-biz-textile-01',
        ownerUserId: 'demo-user-industry-01',
        businessName: 'Apex Spinning & Weaving Mills',
        businessType: 'industry',
        role: 'industry',
        industryCategory: 'Textile Manufacturing',
        description: 'Large-scale cotton combed yarn and woven fabric production facility with 50,000 spindles.',
        phone: '+91 94432 18920',
        email: 'materials@apextextiles.demo',
        address: 'Avinashi Road, Peelamedu',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        country: 'India',
        verificationStatus: 'VERIFIED',
        createdAt: now,
        updatedAt: now,
        isDemo: true
      },
      {
        businessId: 'demo-biz-dealer-01',
        ownerUserId: 'demo-user-dealer-01',
        businessName: 'Vortex Circular Polymers & Fibres',
        businessType: 'dealer',
        role: 'dealer',
        industryCategory: 'Recycling & Secondary Materials Trading',
        description: 'Authorized aggregator and mechanical fiber opener supplying open-end rotor mills and geotextile plants.',
        phone: '+91 98941 77651',
        email: 'procurement@vortexcircular.demo',
        address: 'SIPCOT Industrial Complex',
        city: 'Tiruppur',
        state: 'Tamil Nadu',
        country: 'India',
        verificationStatus: 'VERIFIED',
        createdAt: now,
        updatedAt: now,
        isDemo: true
      },
      {
        businessId: 'demo-biz-plastic-02',
        ownerUserId: 'demo-user-industry-02',
        businessName: 'Kovai Polymer Extrusions',
        businessType: 'industry',
        role: 'industry',
        industryCategory: 'Plastic Manufacturing',
        description: 'Precision blow moulding and industrial sheet extrusion unit.',
        phone: '+91 94882 33410',
        email: 'sustainability@kovaipolymers.demo',
        address: 'Kurichi Industrial Estate',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        country: 'India',
        verificationStatus: 'VERIFIED',
        createdAt: now,
        updatedAt: now,
        isDemo: true
      },
      {
        businessId: 'demo-biz-dealer-02',
        ownerUserId: 'demo-user-dealer-02',
        businessName: 'EcoRegen Materials Hub',
        businessType: 'dealer',
        role: 'dealer',
        industryCategory: 'Secondary Raw Material Aggregators',
        description: 'Bulk procurer of clean HDPE, PET, and sorted cardboard bales across western Tamil Nadu.',
        phone: '+91 97890 12345',
        email: 'buyer@ecoregen.demo',
        address: 'Perundurai Road',
        city: 'Erode',
        state: 'Tamil Nadu',
        country: 'India',
        verificationStatus: 'VERIFIED',
        createdAt: now,
        updatedAt: now,
        isDemo: true
      }
    ];

    for (const biz of demoBusinesses) {
      await setDoc(doc(db, 'businesses', biz.businessId), biz);
    }

    // 2. Demo Material Requirements published by Dealers
    const demoRequirements: MaterialRequirement[] = [
      {
        requirementId: 'req-demo-01',
        dealerBusinessId: 'demo-biz-dealer-01',
        dealerBusinessName: 'Vortex Circular Polymers & Fibres',
        dealerUserId: 'demo-user-dealer-01',
        title: 'Combed Cotton Waste / Selvage Cuts',
        materialCategory: 'Textile',
        specificMaterial: 'Cotton Textile Waste',
        minQuantity: 300,
        maxQuantity: 1500,
        unit: 'kg',
        requiredQuality: 'Clean, segregated, moisture < 8%',
        preferredLocation: 'Tiruppur / Coimbatore',
        frequency: 'Monthly',
        targetPriceRange: '₹35 - ₹48 / kg',
        additionalNotes: 'Need 100% white/raw combed cotton strips without synthetic polyester contamination for rotor spinning.',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        isDemo: true
      },
      {
        requirementId: 'req-demo-02',
        dealerBusinessId: 'demo-biz-dealer-02',
        dealerBusinessName: 'EcoRegen Materials Hub',
        dealerUserId: 'demo-user-dealer-02',
        title: 'Post-Industrial HDPE Purge & Scrap',
        materialCategory: 'Plastic',
        specificMaterial: 'HDPE Plastic Scrap',
        minQuantity: 1000,
        maxQuantity: 5000,
        unit: 'kg',
        requiredQuality: 'Clean regrind or unburnt purge chunks',
        preferredLocation: 'Erode / Salem / Coimbatore',
        frequency: 'Continuous',
        targetPriceRange: '₹42 - ₹55 / kg',
        additionalNotes: 'Immediate weighing and payment on unloading at Erode warehouse.',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        isDemo: true
      }
    ];

    for (const req of demoRequirements) {
      await setDoc(doc(db, 'materialRequirements', req.requirementId), req);
    }

    // 3. Demo Waste Assessment & Intelligence Report (The Signature Demo: 500 kg Cotton Textile Waste)
    const demoAssessmentId = 'assess-demo-cotton-01';
    const demoReportId = 'rep-demo-cotton-01';
    const demoListingId = 'list-demo-cotton-01';

    const demoAssessment: WasteAssessment = {
      assessmentId: demoAssessmentId,
      ownerUserId: 'demo-user-industry-01',
      businessId: 'demo-biz-textile-01',
      businessName: 'Apex Spinning & Weaving Mills',
      wasteName: 'Cotton Textile Waste (Comber Noil & Loom Selvage)',
      materialCategory: 'Textile',
      wasteType: '100% Cotton Fiber Byproduct',
      quantity: 500,
      unit: 'kg',
      location: 'Coimbatore, Tamil Nadu',
      generationFrequency: 'Weekly',
      availability: 'Immediate',
      description: 'Clean post-industrial comber noil and loom selvedge edges generated during fine count spinning and weaving.',
      grade: 'Grade A Industrial Secondary',
      moistureLevel: 'Low (<5%)',
      contaminationLevel: 'Minimal (<1%)',
      isSeparated: 'Separated',
      condition: 'Clean',
      additionalNotes: 'Baled in uniform 100kg HDPE-wrapped cubes, stored inside dry warehouse.',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80',
          fileName: 'cotton_bale_evidence_01.jpg',
          uploadedAt: now
        }
      ],
      status: 'LISTED',
      reportId: demoReportId,
      createdAt: now,
      updatedAt: now,
      isDemo: true
    };

    await setDoc(doc(db, 'wasteAssessments', demoAssessmentId), demoAssessment);

    const demoReport: WasteIntelligenceReport = {
      reportId: demoReportId,
      assessmentId: demoAssessmentId,
      industryName: 'Apex Spinning & Weaving Mills',
      location: 'Coimbatore, Tamil Nadu',
      wasteName: 'Cotton Textile Waste (Comber Noil & Loom Selvage)',
      materialCategory: 'Textile',
      quantity: 500,
      unit: 'kg',
      analysisDate: now,
      aiConfidence: 94,
      disclaimer: 'AI-generated estimate based on provided operational parameters and image evidence. Laboratory testing may be required for commercial or regulatory compliance.',
      executiveSummary: {
        materialIdentified: 'Refined Combed Cotton Fiber & Woven Selvage',
        currentQuantity: '500 kg',
        estimatedQuality: 'Grade A High-Purity Industrial Secondary',
        recoverability: 'High',
        potentialReuse: 'Open-end yarn spinning (Ne 10s-16s), surgical absorbent cotton, automotive acoustic felt',
        marketDemand: 'High Demand',
        potentialBuyerCount: 7,
        recommendedAction: 'List immediately on B2B Marketplace targeting Tiruppur rotor spinning clusters',
        summaryText: 'Material exhibits superior staple fiber length retention with minimal non-lint contamination (<1.2%), making it prime feedstock for regenerated open-end yarn.'
      },
      compositionAnalysis: {
        primaryMaterial: 'Natural Cellulose / Cotton Staple',
        primaryPercentage: 96,
        secondaryMaterials: [
          { material: 'Micro-fibers & lint dust', percentage: 3 },
          { material: 'Natural vegetable trace waxes', percentage: 1 }
        ],
        possibleContaminants: ['Atmospheric dust', 'Trace paper cone fibers'],
        materialConfidence: 95,
        qualityGrade: 'Grade A Industrial Recyclable',
        labelNote: 'AI visual & declared parameter evaluation. Moisture certified <5%.'
      },
      quantityAnalysis: {
        currentAvailableQuantity: '500 kg',
        averageWeeklyGeneration: '500 kg / week',
        estimatedMonthlyGeneration: '2,000 kg / month',
        estimatedRecoverableQuantity: '480 kg (96% recovery efficiency)',
        calculatedNotes: 'Minimal 4% carding fly loss during blowroom opening.'
      },
      generationPattern: {
        weeklyGeneration: 'Stable recurring 500 kg weekly batch',
        monthlyGeneration: 'Approx 2 metric tonnes monthly',
        peakGenerationPeriods: 'Peak spinning shifts (October - March)',
        productionRelationship: 'Directly linked to 50s/60s combed cotton yarn orders',
        estimatedFutureAvailability: 'Continuous steady availability'
      },
      pathways: {
        directReuse: {
          suitability: 'Medium',
          requiredProcessing: 'Sorting and trimming',
          possibleOutput: 'Workshop cleaning rag bales',
          benefits: 'Zero processing overhead',
          limitations: 'Yields 40% lower revenue than yarn spinning recovery',
          confidenceScore: 82
        },
        recycling: {
          suitability: 'High',
          requiredProcessing: 'Blowroom opening, carding, open-end rotor spinning',
          possibleOutput: 'Regenerated coarse cotton yarn for denim weft & mop yarns',
          benefits: 'Top commercial return; strong local demand in Tiruppur cluster',
          limitations: 'Requires clean transport without moisture ingress',
          confidenceScore: 96
        },
        recovery: {
          suitability: 'High',
          requiredProcessing: 'Thermal bonding with low-melt bicomponent fiber',
          possibleOutput: 'Acoustic vehicle floor insulation mats',
          benefits: 'Absorbs 100% of batch regardless of slight shade variation',
          limitations: 'Requires bulk shipment',
          confidenceScore: 91
        },
        upcycling: {
          suitability: 'Medium',
          requiredProcessing: 'Enzymatic hydro-cellulose extraction',
          possibleOutput: 'Microcrystalline cellulose & handmade rag art paper',
          benefits: 'High value multiplier for luxury packaging',
          limitations: 'Niche processing facilities required',
          confidenceScore: 78
        }
      },
      aiRecommendation: {
        recommendedPathway: 'Textile Rotor Recycling / Regenerated Fibre Spinning',
        whyThisPathway: 'The high fiber staple length and negligible contamination yield 96% spinning efficiency for secondary yarn.',
        recommendedNextAction: 'Publish to WasteXchange B2B Marketplace targeting regional dealers in Tiruppur/Erode.',
        potentialPreparationRequired: 'Maintain baled packaging under dry warehouse conditions.',
        potentialBuyerCategory: 'Rotor Spinning Mills, Secondary Fiber Traders & Non-Woven Manufacturers'
      },
      marketDemandAnalysis: {
        demandLevel: 'High Demand',
        potentialBuyerCategories: [
          'Tiruppur Open-End Mills',
          'Automotive Felt Fabricators',
          'Export Fiber Recyclers'
        ],
        typicalRequiredQuantities: '300 kg to 5,000 kg per dispatch',
        targetLocations: ['Tiruppur', 'Coimbatore', 'Erode', 'Rajapalayam'],
        numberOfPotentialMatches: 7,
        demandSummary: 'High regional appetite driven by 25% virgin cotton price escalation.'
      },
      createdAt: now,
      isDemo: true
    };

    await setDoc(doc(db, 'wasteReports', demoReportId), demoReport);

    // 4. Demo Waste Listing in Marketplace
    const demoListing: WasteListing = {
      listingId: demoListingId,
      assessmentId: demoAssessmentId,
      reportId: demoReportId,
      sellerBusinessId: 'demo-biz-textile-01',
      sellerBusinessName: 'Apex Spinning & Weaving Mills',
      sellerUserId: 'demo-user-industry-01',
      wasteName: 'Cotton Textile Waste (Comber Noil & Loom Selvage)',
      materialCategory: 'Textile',
      wasteType: '100% Cotton Fiber Byproduct',
      quantity: 500,
      availableQuantity: 500,
      minPurchaseQuantity: 100,
      unit: 'kg',
      quality: 'Grade A Industrial Secondary, Clean, Low Moisture',
      grade: 'Grade A',
      location: 'Coimbatore, Tamil Nadu',
      availability: 'Immediate',
      description: 'Clean post-industrial comber noil and loom selvedge edges. Inspected with WasteXchange AI Intelligence (Score 94%). Available for immediate dispatch in 100kg bales.',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80',
          fileName: 'cotton_bale_evidence_01.jpg'
        }
      ],
      aiMatchPotential: 'High (94% Compatibility with Regional Rotor Mills)',
      aiReportSummary: '96% cellulose purity, <1% contamination, prime feedstock for regenerated spinning.',
      recommendedPathway: 'Textile Rotor Recycling / Regenerated Fibre Spinning',
      status: 'LISTED',
      createdAt: now,
      updatedAt: now,
      isDemo: true
    };

    await setDoc(doc(db, 'wasteListings', demoListingId), demoListing);

    // 5. Pre-calculated AI Buyer Match for this Listing
    const demoMatch: BuyerMatch = {
      matchId: 'match-demo-01',
      listingId: demoListingId,
      requirementId: 'req-demo-01',
      buyerBusinessId: 'demo-biz-dealer-01',
      buyerBusinessName: 'Vortex Circular Polymers & Fibres',
      sellerBusinessId: 'demo-biz-textile-01',
      sellerBusinessName: 'Apex Spinning & Weaving Mills',
      score: 94,
      breakdown: {
        material: 30, // 30/30
        quantity: 19, // 19/20 (500kg is right in 300-1500kg range)
        quality: 15,  // 15/15 (Clean Grade A matches clean requirement)
        location: 13, // 13/15 (Coimbatore to Tiruppur ~50km distance)
        demand: 9,    // 9/10 (Active requirement)
        availability: 8 // 8/10 (Immediate)
      },
      reasons: [
        'Material 100% compatible (Cotton Textile Waste)',
        'Quantity requirement fully satisfied (500 kg within 300–1500 kg range)',
        'Clean sorted quality matches rotor spinning specifications',
        'Close geographical proximity (Coimbatore - Tiruppur industrial corridor)',
        'Active verified buyer demand profile'
      ],
      aiExplanation: 'The 500 kg Cotton Textile Waste listing directly fulfills Vortex Circular Polymers requirement for high-purity spinning feed. Logistics transit is optimal (~50 km) along Avinashi road corridor.',
      createdAt: now,
      isDemo: true
    };

    await setDoc(doc(db, 'buyerMatches', demoMatch.matchId), demoMatch);

    // 6. Pre-seeded Sample Transaction Workflow for demonstration
    const sampleReqId = 'req-purchase-demo-01';
    const sampleTxId = 'tx-demo-01';

    const samplePurchaseRequest: PurchaseRequest = {
      requestId: sampleReqId,
      listingId: demoListingId,
      wasteName: 'Cotton Textile Waste (Comber Noil & Loom Selvage)',
      sellerBusinessId: 'demo-biz-textile-01',
      sellerBusinessName: 'Apex Spinning & Weaving Mills',
      sellerUserId: 'demo-user-industry-01',
      buyerBusinessId: 'demo-biz-dealer-01',
      buyerBusinessName: 'Vortex Circular Polymers & Fibres',
      buyerUserId: 'demo-user-dealer-01',
      requestedQuantity: 400,
      unit: 'kg',
      proposedPickupDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      message: 'We inspected the AI Intelligence Report (94% confidence). Our rotor mill in Tiruppur can take 400 kg immediately with our dedicated covered truck.',
      status: 'ACCEPTED',
      transactionId: sampleTxId,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: now,
      isDemo: true
    };

    await setDoc(doc(db, 'purchaseRequests', sampleReqId), samplePurchaseRequest);

    const sampleTransaction: TransactionRecord = {
      transactionId: sampleTxId,
      purchaseRequestId: sampleReqId,
      listingId: demoListingId,
      wasteName: 'Cotton Textile Waste (Comber Noil & Loom Selvage)',
      buyerBusinessId: 'demo-biz-dealer-01',
      buyerBusinessName: 'Vortex Circular Polymers & Fibres',
      buyerUserId: 'demo-user-dealer-01',
      sellerBusinessId: 'demo-biz-textile-01',
      sellerBusinessName: 'Apex Spinning & Weaving Mills',
      sellerUserId: 'demo-user-industry-01',
      quantity: 400,
      unit: 'kg',
      location: 'Coimbatore, Tamil Nadu',
      status: 'PICKUP_SCHEDULED',
      pickupDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      notes: 'Driver details and lorry registration TN-38-BZ-4102 verified for warehouse entry.',
      timeline: [
        {
          status: 'TRANSACTION_CONFIRMED',
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
          note: 'Seller accepted 400 kg purchase request against AI Intelligence Report specifications.',
          actor: 'Apex Spinning & Weaving Mills'
        },
        {
          status: 'PICKUP_SCHEDULED',
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
          note: 'Pickup scheduled for dispatch dock 2. Logistics truck dispatched.',
          actor: 'Vortex Circular Polymers'
        }
      ],
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: now,
      isDemo: true
    };

    await setDoc(doc(db, 'transactions', sampleTxId), sampleTransaction);

    return true;
  } catch (err) {
    console.warn('Notice while seeding demo data:', err);
    return false;
  }
}

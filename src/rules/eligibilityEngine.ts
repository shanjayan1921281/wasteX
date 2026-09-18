/**
 * ============================================================================
 * ELIGIBILITY RULE ENGINE
 * ============================================================================
 * 
 * ALGORITHM CLASSIFICATION:
 * Rule-Based Conditional Decision Logic
 * 
 * ARCHITECTURE PRINCIPLE:
 * AI Analysis → Extracted Attributes → Rule-Based Decision Engine
 * 
 * CRITICAL LOGIC DIRECTIVE:
 * Uses INDEPENDENT IF CONDITIONS. Multiple circular pathways can simultaneously
 * be applicable to the exact same industrial or consumer waste stream.
 * 
 * IF recyclable = true   → RECYCLE pathway active
 * IF sellable = true     → SELL pathway active
 * IF reusable = true     → REUSE pathway active
 * IF disposalRequired    → DISPOSE pathway active
 * 
 * No black-box machine learning (CNN/YOLO/RandomForest) is claimed for this layer.
 * All logic is inspectable, deterministic, and verifiable.
 * ============================================================================
 */

import type { 
  EligibilityResult, 
  ExtractedWasteAttributes, 
  PathwayEvaluation, 
  RecyclerProfile, 
  DealerProfile 
} from '../types';

// Authoritative material recyclability registry
const RECYCLABLE_MATERIALS = [
  'textile', 'cotton', 'polyester', 'denim', 'yarn',
  'plastic', 'hdpe', 'pet', 'ldpe', 'pp', 'polymers',
  'metal', 'aluminum', 'copper', 'steel', 'brass', 'iron',
  'cardboard', 'paper', 'corrugated box',
  'rubber', 'vulcanized rubber', 'tire crumb'
];

// Hazardous materials that require certified disposal
const HAZARDOUS_INDICATORS = [
  'chemical', 'acid', 'solvent', 'heavy metal', 'mercury', 'lead', 
  'asbestos', 'toxic', 'biohazard', 'sludge', 'pcb', 'radioactive',
  'corrosive', 'flammable'
];

/**
 * Extracts and normalizes structured attributes from the AI report and assessment
 */
export function extractWasteAttributes(
  wasteData: {
    wasteName: string;
    materialCategory: string;
    quantity: number;
    unit: string;
    condition?: string;
    grade?: string;
    contaminationLevel?: string;
    moistureLevel?: string;
    aiReport?: any;
    description?: string;
  }
): ExtractedWasteAttributes {
  const nameLower = (wasteData.wasteName || '').toLowerCase();
  const catLower = (wasteData.materialCategory || '').toLowerCase();
  const descLower = (wasteData.description || '').toLowerCase();
  const contaminationLower = (wasteData.contaminationLevel || '').toLowerCase();
  const condLower = (wasteData.condition || '').toLowerCase();
  const allText = `${nameLower} ${catLower} ${descLower} ${contaminationLower} ${condLower}`;

  // Hazardous determination
  const isHazardous = HAZARDOUS_INDICATORS.some(term => allText.includes(term));

  // Cleanliness determination
  const isClean = 
    condLower.includes('clean') || 
    contaminationLower.includes('minimal') || 
    contaminationLower.includes('<1%') || 
    contaminationLower.includes('<2%') ||
    contaminationLower.includes('low') ||
    !contaminationLower.includes('high');

  // Moisture determination
  const hasHighMoisture = 
    (wasteData.moistureLevel || '').toLowerCase().includes('high') || 
    (wasteData.moistureLevel || '').toLowerCase().includes('>15%');

  // Severe degradation determination
  const isDegraded = 
    condLower.includes('degraded') || 
    condLower.includes('rotten') || 
    condLower.includes('burnt') ||
    condLower.includes('weathered');

  // Potential circular applications
  const possibleApplications: string[] = [];
  if (allText.includes('textile') || allText.includes('cotton') || allText.includes('yarn')) {
    possibleApplications.push('Rotor yarn spinning', 'Thermal insulation felts', 'Industrial wipes & mops', 'Geotextiles');
  } else if (allText.includes('plastic') || allText.includes('hdpe') || allText.includes('pet')) {
    possibleApplications.push('Bottle-to-bottle food grade flakes', 'Injection molded crates & pallets', 'Post-consumer polymer pellets');
  } else if (allText.includes('metal') || allText.includes('aluminum')) {
    possibleApplications.push('Secondary foundry re-melting', 'Extrusion billet production', 'Precision automotive castings');
  } else if (allText.includes('cardboard') || allText.includes('paper')) {
    possibleApplications.push('Kraft paper pulping', 'Egg tray & packaging cushioning', 'Corrugated medium board');
  } else if (allText.includes('rubber')) {
    possibleApplications.push('Rubberized asphalt road surfacing', 'Playground acoustic tiles', 'Molded conveyor pads');
  } else {
    possibleApplications.push('Secondary aggregate blending', 'Industrial solid recovered fuel (SRF)', 'Downstream composite fillers');
  }

  // Recoverability estimation
  let recoverability: 'High' | 'Medium' | 'Low' = 'High';
  if (isHazardous || isDegraded) {
    recoverability = 'Low';
  } else if (!isClean || hasHighMoisture) {
    recoverability = 'Medium';
  }

  return {
    wasteType: wasteData.wasteName || 'Industrial Secondary Material',
    material: wasteData.materialCategory || 'General Industrial',
    condition: wasteData.condition || 'Sorted Scrap',
    quality: wasteData.grade || (isClean ? 'Grade A Secondary' : 'Grade B Mixed'),
    quantity: Number(wasteData.quantity) || 100,
    unit: wasteData.unit || 'kg',
    contamination: wasteData.contaminationLevel || (isClean ? 'Minimal (<2%)' : 'Moderate'),
    recoverability,
    possibleApplications,
    isHazardous,
    isClean,
    hasHighMoisture,
    isDegraded
  };
}

/**
 * Evaluates the 4 independent circular pathways based on extracted attributes
 */
export function evaluateEligibility(
  attributes: ExtractedWasteAttributes,
  assessmentId: string = `eval-${Date.now()}`
): EligibilityResult {
  const matLower = attributes.material.toLowerCase();
  const typeLower = attributes.wasteType.toLowerCase();
  const combinedMat = `${matLower} ${typeLower}`;

  // ==========================================================================
  // RULE 1: RECYCLE PATHWAY (Independent Condition)
  // Material is mechanically/chemically recyclable, non-hazardous, not degraded
  // ==========================================================================
  const isMaterialRecyclable = RECYCLABLE_MATERIALS.some(m => combinedMat.includes(m));
  const recyclableEligible = isMaterialRecyclable && !attributes.isHazardous && !attributes.isDegraded;
  
  let recycleScore = 0;
  let recycleRationale = '';
  let recycleGuidance = '';

  if (recyclableEligible) {
    recycleScore = attributes.isClean ? 94 : 78;
    recycleRationale = `Material matches approved mechanical circular recycling feedstocks. Low contamination enables high-yield pelletizing, re-spinning, or smelting.`;
    recycleGuidance = `Route batch directly to verified regional recycling units for processing into new industrial or consumer products.`;
  } else if (attributes.isHazardous) {
    recycleScore = 15;
    recycleRationale = `Contaminated with hazardous indicators; direct recycling would violate environmental standards without specialized neutralizers.`;
    recycleGuidance = `Requires specialized hazardous treatment before any secondary recovery can be attempted.`;
  } else {
    recycleScore = 40;
    recycleRationale = `Limited mechanical recycling infrastructure currently available for this specific composite mixture.`;
    recycleGuidance = `Consider exploring direct reuse or downcycling applications.`;
  }

  const recyclePathway: PathwayEvaluation = {
    pathway: 'RECYCLE',
    eligible: recyclableEligible,
    confidenceScore: recycleScore,
    title: 'Industrial & Mechanical Recycling',
    rationale: recycleRationale,
    guidance: recycleGuidance,
    requirements: [
      'Baled or bagged in clean moisture-barrier containment',
      'Non-hazardous verification certificate',
      'Batch minimum volume compliant with regional recycler acceptance'
    ],
    actions: {
      label: 'Connect to Certified Recycler',
      actionType: 'REQUEST_RECYCLER'
    }
  };

  // ==========================================================================
  // RULE 2: SELL PATHWAY (Independent Condition)
  // Material possesses commercial secondary market value, commercial batch qty, clean
  // ==========================================================================
  const hasCommercialBatchSize = attributes.quantity >= 50; // min 50kg for commercial trading
  const sellableEligible = !attributes.isHazardous && hasCommercialBatchSize && (attributes.isClean || isMaterialRecyclable);

  let sellScore = 0;
  let sellRationale = '';
  let sellGuidance = '';

  if (sellableEligible) {
    sellScore = attributes.isClean && attributes.quantity >= 200 ? 92 : 80;
    sellRationale = `Material holds verifiable spot market secondary value. Authorized dealers and scrap aggregators actively purchase this grade.`;
    sellGuidance = `Connect with local authorized scrap aggregators or list directly on WasteXchange B2B Marketplace.`;
  } else if (!hasCommercialBatchSize) {
    sellScore = 35;
    sellRationale = `Quantity (${attributes.quantity} ${attributes.unit}) is below minimum commercial trading threshold of 50 kg for bulk scrap aggregators.`;
    sellGuidance = `Accumulate additional volume until minimum commercial truckload or pallet weight is reached.`;
  } else {
    sellScore = 20;
    sellRationale = `Presence of contaminants or hazardous residues prevents open B2B commercial secondary trading.`;
    sellGuidance = `Decontaminate stream or utilize certified disposal avenues.`;
  }

  const sellPathway: PathwayEvaluation = {
    pathway: 'SELL',
    eligible: sellableEligible,
    confidenceScore: sellScore,
    title: 'B2B Secondary Material Sale',
    rationale: sellRationale,
    guidance: sellGuidance,
    requirements: [
      'Commercial invoice or manifest generation',
      'Weight slip verified via certified weighbridge',
      'Acceptance criteria matching authorized buyer specifications'
    ],
    actions: {
      label: 'Find Matching Scrap Dealers',
      actionType: 'CONNECT_DEALER'
    }
  };

  // ==========================================================================
  // RULE 3: REUSE PATHWAY (Independent Condition)
  // Distinct from recycling. Focuses on direct repurposing, upcycling, or modular reuse
  // ==========================================================================
  const reusableEligible = !attributes.isHazardous && !attributes.isDegraded;

  let reuseScore = 0;
  let reuseRationale = '';
  let reuseGuidance = '';

  if (reusableEligible) {
    reuseScore = 85;
    reuseRationale = `Structural integrity of material permits direct secondary functional utilization without requiring energy-intensive thermal or chemical remelting.`;
    reuseGuidance = `Suggested applications: ${attributes.possibleApplications.slice(0, 3).join(', ')}.`;
  } else {
    reuseScore = 25;
    reuseRationale = `Physical degradation or chemical contamination precludes direct safe functional reuse.`;
    reuseGuidance = `Do not attempt unvetted direct reuse due to material fatigue or safety risks.`;
  }

  const reusePathway: PathwayEvaluation = {
    pathway: 'REUSE',
    eligible: reusableEligible,
    confidenceScore: reuseScore,
    title: 'Direct Upcycling & Functional Reuse',
    rationale: reuseRationale,
    guidance: reuseGuidance,
    requirements: [
      'Surface cleaning or particulate dusting',
      'Dimensional sorting for intended repurposing process',
      'Adherence to worker health & safety protective equipment'
    ],
    actions: {
      label: 'View Practical Upcycling Ideas',
      actionType: 'VIEW_REUSE_IDEAS'
    }
  };

  // ==========================================================================
  // RULE 4: DISPOSE PATHWAY (Independent Condition)
  // Active if hazardous, severely degraded, high contamination, or legal compliance mandates
  // ==========================================================================
  const disposalEligible = attributes.isHazardous || attributes.isDegraded || (!recyclableEligible && !sellableEligible && !reusableEligible);

  let disposeScore = 0;
  let disposeCategory = 'Non-Hazardous Municipal Sanitary Landfill';
  let disposeRationale = '';
  let disposeGuidance = '';

  if (attributes.isHazardous) {
    disposeScore = 98;
    disposeCategory = 'Hazardous Waste TSDF (Treatment, Storage & Disposal Facility)';
    disposeRationale = `Contains hazardous indicators (${attributes.material}). Legal compliance strictly mandates authorized TSDF manifest handling.`;
    disposeGuidance = `Engage state-authorized hazardous waste carriers. Strictly avoid municipal dumping or unauthorized open incineration.`;
  } else if (attributes.isDegraded) {
    disposeScore = 88;
    disposeCategory = 'Engineered Industrial Landfill / Bio-stabilization';
    disposeRationale = `Severely degraded material cannot be recovered economically through circular methods.`;
    disposeGuidance = `Segregate from recyclable waste and dispatch through authorized municipal industrial solid waste channel.`;
  } else if (!recyclableEligible && !sellableEligible) {
    disposeScore = 75;
    disposeCategory = 'Refuse-Derived Fuel (RDF) / Waste-to-Energy (WtE)';
    disposeRationale = `While non-hazardous, low purity prevents material reclamation. Co-processing in cement kilns or WtE is indicated.`;
    disposeGuidance = `Dispatch to authorized RDF aggregator for thermal recovery.`;
  } else {
    disposeScore = 20; // Safe disposal is always available as fallback, but discouraged when circular pathways are open
    disposeCategory = 'Standard Industrial Disposal (Last Resort)';
    disposeRationale = `High circular recoverability exists. Physical disposal should only be considered as a last-resort contingency.`;
    disposeGuidance = `Prioritize Sell, Recycle, or Reuse pathways before considering disposal.`;
  }

  const disposePathway: PathwayEvaluation = {
    pathway: 'DISPOSE',
    eligible: disposalEligible,
    confidenceScore: disposeScore,
    title: 'Authorized Industrial Disposal',
    rationale: disposeRationale,
    guidance: disposeGuidance,
    recommendedCategory: disposeCategory,
    requirements: [
      'Form 10 / Manifest compliance for hazardous categories',
      'Pre-treatment or neutralization where applicable',
      'Authorized transport permit verification'
    ],
    actions: {
      label: 'View Disposal Guidelines',
      actionType: 'DISPOSE_INSTRUCTIONS'
    }
  };

  // Calculate active pathways count
  const activeCount = [
    recyclableEligible, 
    sellableEligible, 
    reusableEligible, 
    disposalEligible
  ].filter(Boolean).length;

  return {
    evaluationId: `eval-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    assessmentId,
    wasteName: attributes.wasteType,
    materialCategory: attributes.material,
    evaluatedAt: new Date().toISOString(),
    engineVersion: '2.4.0-hackathon-core',
    methodology: 'Rule-Based Conditional Decision Logic',
    extractedAttributes: attributes,
    pathways: {
      dispose: disposePathway,
      sell: sellPathway,
      recycle: recyclePathway,
      reuse: reusePathway
    },
    activePathwaysCount: activeCount,
    selectedPathway: recyclableEligible ? 'RECYCLE' : sellableEligible ? 'SELL' : reusableEligible ? 'REUSE' : 'DISPOSE'
  };
}

// ============================================================================
// VERIFIED REGISTRY OF DEALERS & RECYCLERS FOR MATCHING
// ============================================================================

export const REGISTERED_DEALERS: DealerProfile[] = [
  {
    dealerId: 'dealer-01',
    businessName: 'Vortex Circular Polymers & Fibres',
    acceptedMaterials: ['Textile', 'Cotton', 'Polyester', 'Plastic', 'HDPE'],
    purchasePriceRange: '₹35 - ₹65 / kg',
    minQuantityKg: 100,
    location: 'Tiruppur / Coimbatore, Tamil Nadu',
    contactEmail: 'procurement@vortexcircular.com',
    phone: '+91 98941 77651',
    rating: 4.8
  },
  {
    dealerId: 'dealer-02',
    businessName: 'EcoRegen Scrap Aggregators',
    acceptedMaterials: ['Plastic', 'HDPE', 'PET', 'Cardboard', 'Paper'],
    purchasePriceRange: '₹22 - ₹48 / kg',
    minQuantityKg: 200,
    location: 'Erode, Tamil Nadu',
    contactEmail: 'buyer@ecoregen.org',
    phone: '+91 97890 12345',
    rating: 4.6
  },
  {
    dealerId: 'dealer-03',
    businessName: 'MetalloRecycle Commodities',
    acceptedMaterials: ['Metal', 'Aluminum', 'Copper', 'Steel', 'Iron'],
    purchasePriceRange: '₹140 - ₹380 / kg',
    minQuantityKg: 50,
    location: 'Chennai, Tamil Nadu',
    contactEmail: 'trading@metallorecycle.com',
    phone: '+91 94432 99881',
    rating: 4.9
  }
];

export const REGISTERED_RECYCLERS: RecyclerProfile[] = [
  {
    recyclerId: 'recycler-01',
    businessName: 'Apex Regenerated Spinning & Fiber Works',
    acceptedMaterials: ['Textile', 'Cotton', 'Yarn', 'Denim'],
    processingCapabilities: ['Mechanical fiber opening', 'Garnetting', 'Open-end rotor re-spinning', 'Non-woven felting'],
    minBatchKg: 200,
    location: 'Coimbatore, Tamil Nadu',
    contactEmail: 'intake@apexregenerated.com',
    phone: '+91 94432 18922',
    rating: 4.9,
    certifications: ['Global Recycled Standard (GRS)', 'OEKO-TEX Standard 100', 'ISO 14001']
  },
  {
    recyclerId: 'recycler-02',
    businessName: 'PolyCycle Advanced Extrusions',
    acceptedMaterials: ['Plastic', 'HDPE', 'PET', 'LDPE', 'PP'],
    processingCapabilities: ['Hot-wash flake production', 'Twin-screw decontamination', 'Repro pellet compounding'],
    minBatchKg: 150,
    location: 'Kurichi Industrial Estate, Coimbatore',
    contactEmail: 'facility@polycycle.com',
    phone: '+91 98422 44101',
    rating: 4.7,
    certifications: ['CPCB Authorized Plastic Recycler', 'EPR Authorized Facility']
  },
  {
    recyclerId: 'recycler-03',
    businessName: 'EcoKraft Pulp & Packaging Solutions',
    acceptedMaterials: ['Cardboard', 'Paper', 'Corrugated'],
    processingCapabilities: ['Hydrapulping', 'De-inking', 'Molded fiber protective packaging'],
    minBatchKg: 300,
    location: 'Perundurai, Tamil Nadu',
    contactEmail: 'pulp@ecokraft.com',
    phone: '+91 94881 77620',
    rating: 4.8,
    certifications: ['FSC Recycled 100%', 'Zero Liquid Discharge']
  }
];

/**
 * Matches suitable scrap dealers/buyers for a waste stream
 */
export function matchDealers(materialCategory: string, wasteName: string): DealerProfile[] {
  const query = `${materialCategory} ${wasteName}`.toLowerCase();
  return REGISTERED_DEALERS.filter(dealer => 
    dealer.acceptedMaterials.some(m => query.includes(m.toLowerCase()))
  );
}

/**
 * Matches certified recyclers for a waste stream
 */
export function matchRecyclers(materialCategory: string, wasteName: string): RecyclerProfile[] {
  const query = `${materialCategory} ${wasteName}`.toLowerCase();
  return REGISTERED_RECYCLERS.filter(recycler => 
    recycler.acceptedMaterials.some(m => query.includes(m.toLowerCase()))
  );
}

// ============================================================================
// AUTOMATED TEST SUITE: 5 HACKATHON VERIFICATION SCENARIOS
// ============================================================================

export interface TestCaseResult {
  scenarioId: number;
  name: string;
  inputDescription: string;
  expectedOutcome: string;
  actualOutcome: string;
  passed: boolean;
  evaluatedPathways: {
    dispose: boolean;
    sell: boolean;
    recycle: boolean;
    reuse: boolean;
  };
  details: string;
}

export interface TestSuiteSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  timestamp: string;
  results: TestCaseResult[];
}

/**
 * Executes verification test suite covering the 5 scenarios mandated by hackathon:
 * 1. Waste is recyclable
 * 2. Waste is sellable
 * 3. Waste is reusable
 * 4. Waste requires disposal
 * 5. Multiple pathways are simultaneously eligible
 */
export function runEligibilityTestSuite(): TestSuiteSummary {
  const results: TestCaseResult[] = [];

  // --------------------------------------------------------------------------
  // TEST 1: Waste is recyclable (Clean PET Flakes / Shreds)
  // --------------------------------------------------------------------------
  const attr1 = extractWasteAttributes({
    wasteName: 'PET Bottle Shreds',
    materialCategory: 'Plastic',
    quantity: 500,
    unit: 'kg',
    condition: 'Clean flakes',
    grade: 'Grade A',
    contaminationLevel: 'Minimal (<1%)'
  });
  const res1 = evaluateEligibility(attr1, 'test-01');
  const pass1 = res1.pathways.recycle.eligible === true;
  results.push({
    scenarioId: 1,
    name: 'Scenario 1: Waste is Recyclable',
    inputDescription: 'Clean PET Bottle Shreds, Grade A, Minimal contamination, 500kg',
    expectedOutcome: 'RECYCLE pathway MUST be eligible (true)',
    actualOutcome: `RECYCLE eligible: ${res1.pathways.recycle.eligible} (Score: ${res1.pathways.recycle.confidenceScore}%)`,
    passed: pass1,
    evaluatedPathways: {
      dispose: res1.pathways.dispose.eligible,
      sell: res1.pathways.sell.eligible,
      recycle: res1.pathways.recycle.eligible,
      reuse: res1.pathways.reuse.eligible
    },
    details: res1.pathways.recycle.rationale
  });

  // --------------------------------------------------------------------------
  // TEST 2: Waste is sellable (High Value Aluminum Extrusion Offcuts)
  // --------------------------------------------------------------------------
  const attr2 = extractWasteAttributes({
    wasteName: 'Aluminum 6063 Scrap Offcuts',
    materialCategory: 'Metal',
    quantity: 350,
    unit: 'kg',
    condition: 'Raw Scrap Offcuts',
    grade: 'Prime Commercial Scrap',
    contaminationLevel: 'None'
  });
  const res2 = evaluateEligibility(attr2, 'test-02');
  const pass2 = res2.pathways.sell.eligible === true;
  results.push({
    scenarioId: 2,
    name: 'Scenario 2: Waste is Sellable',
    inputDescription: 'Aluminum 6063 Scrap Offcuts, 350kg, Commercial grade',
    expectedOutcome: 'SELL pathway MUST be eligible (true) with high commercial score',
    actualOutcome: `SELL eligible: ${res2.pathways.sell.eligible} (Score: ${res2.pathways.sell.confidenceScore}%)`,
    passed: pass2,
    evaluatedPathways: {
      dispose: res2.pathways.dispose.eligible,
      sell: res2.pathways.sell.eligible,
      recycle: res2.pathways.recycle.eligible,
      reuse: res2.pathways.reuse.eligible
    },
    details: res2.pathways.sell.rationale
  });

  // --------------------------------------------------------------------------
  // TEST 3: Waste is reusable (Clean Cotton Loom Selvedge & Yarn Strips)
  // --------------------------------------------------------------------------
  const attr3 = extractWasteAttributes({
    wasteName: 'Cotton Loom Selvedge Strips',
    materialCategory: 'Textile',
    quantity: 120,
    unit: 'kg',
    condition: 'Clean Strips',
    grade: 'Grade A',
    contaminationLevel: 'Zero contamination'
  });
  const res3 = evaluateEligibility(attr3, 'test-03');
  const pass3 = res3.pathways.reuse.eligible === true;
  results.push({
    scenarioId: 3,
    name: 'Scenario 3: Waste is Reusable',
    inputDescription: 'Clean Cotton Loom Selvedge Strips, undamaged textile offcuts, 120kg',
    expectedOutcome: 'REUSE pathway MUST be eligible (true) with direct upcycling suggestions',
    actualOutcome: `REUSE eligible: ${res3.pathways.reuse.eligible} (Score: ${res3.pathways.reuse.confidenceScore}%)`,
    passed: pass3,
    evaluatedPathways: {
      dispose: res3.pathways.dispose.eligible,
      sell: res3.pathways.sell.eligible,
      recycle: res3.pathways.recycle.eligible,
      reuse: res3.pathways.reuse.eligible
    },
    details: `Applications: ${res3.extractedAttributes.possibleApplications.join(', ')}`
  });

  // --------------------------------------------------------------------------
  // TEST 4: Waste requires disposal (Heavy Metal Chemical Electroplating Sludge)
  // --------------------------------------------------------------------------
  const attr4 = extractWasteAttributes({
    wasteName: 'Electroplating Chromium Sludge Residue',
    materialCategory: 'Chemical',
    quantity: 80,
    unit: 'kg',
    condition: 'Hazardous Sludge',
    grade: 'Industrial Byproduct',
    contaminationLevel: 'High heavy metal content'
  });
  const res4 = evaluateEligibility(attr4, 'test-04');
  const pass4 = res4.pathways.dispose.eligible === true && res4.pathways.recycle.eligible === false;
  results.push({
    scenarioId: 4,
    name: 'Scenario 4: Waste Requires Disposal',
    inputDescription: 'Hazardous Chemical Chromium Sludge, heavy metal contamination',
    expectedOutcome: 'DISPOSE pathway MUST be active (true) with TSDF category, RECYCLE must be blocked (false)',
    actualOutcome: `DISPOSE eligible: ${res4.pathways.dispose.eligible} (${res4.pathways.dispose.recommendedCategory}), RECYCLE: ${res4.pathways.recycle.eligible}`,
    passed: pass4,
    evaluatedPathways: {
      dispose: res4.pathways.dispose.eligible,
      sell: res4.pathways.sell.eligible,
      recycle: res4.pathways.recycle.eligible,
      reuse: res4.pathways.reuse.eligible
    },
    details: res4.pathways.dispose.rationale
  });

  // --------------------------------------------------------------------------
  // TEST 5: Multiple pathways are simultaneously eligible
  // (Standard Baled Cotton Mill Comber Waste: can be RECYCLED, SOLD, or REUSED!)
  // --------------------------------------------------------------------------
  const attr5 = extractWasteAttributes({
    wasteName: 'Comber Noil 100% Cotton Baled',
    materialCategory: 'Textile',
    quantity: 400,
    unit: 'kg',
    condition: 'Clean Baled Fibre',
    grade: 'Grade A Industrial',
    contaminationLevel: 'Minimal (<1.5%)'
  });
  const res5 = evaluateEligibility(attr5, 'test-05');
  // Both Recycle, Sell, and Reuse are eligible simultaneously!
  const pass5 = res5.pathways.recycle.eligible === true && 
                res5.pathways.sell.eligible === true && 
                res5.pathways.reuse.eligible === true && 
                res5.activePathwaysCount >= 3;
  results.push({
    scenarioId: 5,
    name: 'Scenario 5: Multiple Pathways Simultaneously Eligible',
    inputDescription: 'Baled 100% Cotton Comber Waste, 400kg, high purity, standard industrial byproduct',
    expectedOutcome: 'Multiple independent pathways (RECYCLE, SELL, REUSE) MUST simultaneously evaluate to true',
    actualOutcome: `Active Pathways: ${res5.activePathwaysCount} (Recycle: ${res5.pathways.recycle.eligible}, Sell: ${res5.pathways.sell.eligible}, Reuse: ${res5.pathways.reuse.eligible})`,
    passed: pass5,
    evaluatedPathways: {
      dispose: res5.pathways.dispose.eligible,
      sell: res5.pathways.sell.eligible,
      recycle: res5.pathways.recycle.eligible,
      reuse: res5.pathways.reuse.eligible
    },
    details: 'Demonstrates non-mutually exclusive rule architecture. User can decide whether to sell to a dealer, route to a recycler, or upcycle directly.'
  });

  const passedTests = results.filter(r => r.passed).length;
  return {
    totalTests: results.length,
    passedTests,
    failedTests: results.length - passedTests,
    timestamp: new Date().toISOString(),
    results
  };
}

import fs from 'fs';
import path from 'path';
import type { KnowledgeDocument, KnowledgeCitation, KnowledgeSearchResult } from '../types';

const KB_DIR = path.resolve(process.cwd(), 'knowledge_base');

// Ensure knowledge directory exists
if (!fs.existsSync(KB_DIR)) {
  fs.mkdirSync(KB_DIR, { recursive: true });
}

interface ParsedSection {
  title: string;
  content: string;
}

interface InternalDocument extends KnowledgeDocument {
  sections: ParsedSection[];
}

let cachedDocuments: InternalDocument[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5000; // 5 seconds for rapid updates

/**
 * Parses markdown file into structured KnowledgeDocument
 */
function parseMarkdownDocument(filePath: string): InternalDocument | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    const id = fileName.replace(/\.md$/i, '');

    const lines = raw.split('\n');
    let title = id.replace(/_/g, ' ');
    let authoritativeSource = 'WasteXchange Standard';
    let code = 'KB-GEN-00';
    let category = 'General';
    let keywords: string[] = [];

    // Extract headers
    for (let i = 0; i < Math.min(lines.length, 15); i++) {
      const line = lines[i].trim();
      if (line.startsWith('# ')) {
        title = line.replace(/^#\s+/, '').trim();
      } else if (line.toLowerCase().includes('authoritative reference**:')) {
        authoritativeSource = line.split('**:')[1]?.trim() || authoritativeSource;
      } else if (line.toLowerCase().includes('document code**:')) {
        code = line.split('**:')[1]?.replace(/[`*]/g, '').trim() || code;
      } else if (line.toLowerCase().includes('category**:')) {
        category = line.split('**:')[1]?.replace(/[`*]/g, '').trim() || category;
      } else if (line.toLowerCase().includes('keywords**:')) {
        const kwStr = line.split('**:')[1] || '';
        keywords = kwStr.split(',').map((k) => k.trim()).filter(Boolean);
      }
    }

    // Split sections by ##
    const sections: ParsedSection[] = [];
    const sectionBlocks = raw.split(/\n(?=##\s+)/);
    for (const block of sectionBlocks) {
      const match = block.match(/^##\s+(.+)$/m);
      if (match) {
        const secTitle = match[1].trim();
        sections.push({
          title: secTitle,
          content: block.trim()
        });
      }
    }

    // Summary: first 300 characters of the body
    const bodyStart = raw.indexOf('## 1.');
    const summary = bodyStart !== -1 
      ? raw.substring(bodyStart, bodyStart + 350).replace(/[#*`]/g, '').trim() + '...'
      : raw.substring(0, 300).replace(/[#*`]/g, '').trim() + '...';

    const stat = fs.statSync(filePath);
    const wordCount = raw.split(/\s+/).filter(Boolean).length;

    return {
      id,
      code,
      title,
      category,
      keywords,
      summary,
      lastUpdated: stat.mtime.toISOString(),
      authoritativeSource,
      content: raw,
      sectionsCount: sections.length,
      wordCount,
      sections
    };
  } catch (err) {
    console.error(`Error parsing knowledge document ${filePath}:`, err);
    return null;
  }
}

const EMBEDDED_FALLBACK_DOCS: InternalDocument[] = [
  {
    id: 'textile_waste_standards',
    code: 'KB-TX-01',
    title: 'Industrial Textile Byproducts & Fibre Regeneration Standards',
    category: 'Textile',
    keywords: ['Comber noil', 'spinning sweeps', 'selvedge cuts', 'regenerated rotor yarn', 'garnetting', 'cotton cellulose'],
    summary: 'Authoritative standards for textile waste segregation, staple length preservation, moisture limits (max 8.0%), and mechanical yarn regeneration.',
    lastUpdated: '2026-03-01T00:00:00.000Z',
    authoritativeSource: 'WasteXchange Circular Textile Taskforce & Industrial Fiber Recycling Protocol',
    sectionsCount: 4,
    wordCount: 480,
    content: `# Industrial Textile Byproducts & Fibre Regeneration Standards (WasteXchange KB-TX-01)
**Authoritative Reference**: WasteXchange Circular Textile Taskforce & Industrial Fiber Recycling Protocol
**Document Code**: \`KB-TX-01\`
**Category**: \`Textile\`
**Keywords**: Comber noil, spinning sweeps, selvedge cuts, regenerated rotor yarn, garnetting, cotton cellulose

## 1. Material Classification & Physical Attributes
Industrial textile waste generated in yarn spinning, fabric weaving, and garment fabrication is categorized by staple length, twist level, and synthetic admixture:
- Grade A Comber Noil: 100% combed virgin cotton fibers extracted during the combing phase of fine yarn manufacturing (staple length 12-18mm). Contains negligible seed coats or trash.
- Grade B Loom Selvedge & Cuttings: Twisted selvage edges with 70-85% cotton and 15-30% synthetic sizing agents or elastane/polyester warp threads.
- Grade C Mill Sweeps & Card Fly: Shorter staple fibers (<10mm) collected from suction collectors and filtration units.

## 2. Technical Quality Thresholds & Permissible Tolerances
- Moisture Threshold: Equilibrium moisture regain must not exceed 8.0%. Batches > 9.5% are subject to bacterial mold and carding wire jam.
- Contamination Criteria: Non-fibrous particulate < 1.5%. Foreign tramp material (polypropylene baling twine, metal clips, grease) strictly 0.0% tolerance.
- Purity: Comber noil with > 85% fibers above 12mm commands top spot prices in open-end rotor spinning mills.

## 3. Circular Recovery & Industrial Pathways
1. Mechanical Yarn Regeneration (Recycling - Primary): Mechanical garnetting with progressive fine-wire beating rollers, blending with carrier fiber, open-end rotor spinning.
2. Acoustic & Thermal Insulation Nonwovens (Recovery - Secondary): Air-laid aerodynamic web formation with low-melt bicomponent polyester bonding fibers.
3. Cellulose Micro-Powder & Chemical Upcycling (Upcycling - Specialty): Acid hydrolysis into microcrystalline cellulose for archival paper and biopolymers.
4. Direct Wipe & Secondary Rag (Direct Reuse): Cutting, magnetic needle scanning, and shrink-packing into lint-free wipe packs.

## 4. Market Demand Reality & Price Sensitivity
- Actual Market Demand: Sustained High Demand across textile manufacturing belts. Escalating virgin cotton prices drive mills to integrate up to 40% comber noil.`,
    sections: [
      {
        title: '1. Material Classification & Physical Attributes',
        content: 'Industrial textile waste generated in yarn spinning, fabric weaving, and garment fabrication is categorized by staple length, twist level, and synthetic admixture: Grade A Comber Noil, Grade B Loom Selvedge, Grade C Mill Sweeps.'
      },
      {
        title: '2. Technical Quality Thresholds & Permissible Tolerances',
        content: 'Moisture Threshold: Equilibrium moisture regain must not exceed 8.0%. Foreign tramp material strictly 0.0% tolerance.'
      },
      {
        title: '3. Circular Recovery & Industrial Pathways',
        content: '1. Mechanical Yarn Regeneration (Primary), 2. Acoustic & Thermal Insulation Nonwovens (Secondary), 3. Cellulose Micro-Powder (Specialty), 4. Direct Wipe & Secondary Rag (Direct Reuse).'
      },
      {
        title: '4. Market Demand Reality & Price Sensitivity',
        content: 'Sustained High Demand across textile manufacturing belts. Escalating virgin cotton prices drive mills to integrate up to 40% comber noil.'
      }
    ]
  },
  {
    id: 'plastic_polymers_recovery',
    code: 'KB-PL-02',
    title: 'Industrial Thermoplastics Recovery & Resin Compounding Protocol',
    category: 'Plastic',
    keywords: ['HDPE', 'LDPE', 'Polypropylene', 'PP purgings', 'Melt Flow Index (MFI)', 'twin-screw compounding', 'optical sorting'],
    summary: 'Technical specifications for industrial thermoplastics, regrind melt flow characteristics, immiscibility rules, and twin-screw pelletizing standards.',
    lastUpdated: '2026-03-01T00:00:00.000Z',
    authoritativeSource: 'WasteXchange Polymer Circularity Standard & Technical Scrap Specification',
    sectionsCount: 4,
    wordCount: 510,
    content: `# Industrial Thermoplastics Recovery & Resin Compounding Protocol (WasteXchange KB-PL-02)
**Authoritative Reference**: WasteXchange Polymer Circularity Standard & Technical Scrap Specification
**Document Code**: \`KB-PL-02\`
**Category**: \`Plastic\`
**Keywords**: HDPE, LDPE, Polypropylene, PP purgings, Melt Flow Index (MFI), twin-screw compounding, optical sorting

## 1. Resin Classification & Melt Characteristics
- HDPE: Typical density 0.941-0.965 g/cm3. Injection moulding grade vs Blow moulding grade.
- Polypropylene (PP Copolymer & Homopolymer): Density 0.895-0.920 g/cm3.
- LDPE / LLDPE Film: Post-industrial pallet wrap, blown film trimming. High clarity.

## 2. Technical Quality Thresholds & Permissible Tolerances
- Cross-Polymer Immiscibility: PP in HDPE stream must NOT exceed 1.5% by weight.
- Moisture Threshold: Pellets prior to re-extrusion must have moisture < 0.1%.
- Foreign Contamination Limits: Sand/paper < 0.2%. PVC contamination: Strictly 0.0%.

## 3. Circular Recovery & Industrial Pathways
1. Precision Compounding & Regranulation: Shredding, wash bath, continuous vacuum-degassed twin-screw extrusion.
2. Structural Thermoplastic Lumber: Intrusive extrusion into heavy profile molds for boardwalks and pallets.
3. Advanced Pyrolysis: Anaerobic thermal cracking into circular naphtha feedstock.

## 4. Market Demand Reality & Commercial Boundaries
- Market Liquidity: Clean, natural post-industrial HDPE and PP regrind trades with near-instant liquidity at 65-80% of virgin index prices.`,
    sections: [
      {
        title: '1. Resin Classification & Melt Characteristics',
        content: 'Classification across HDPE, PP copolymer/homopolymer, and LDPE films with varying melt flow indices.'
      },
      {
        title: '2. Technical Quality Thresholds & Permissible Tolerances',
        content: 'Cross-polymer contamination limits: PP in HDPE must be under 1.5%. Moisture must be under 0.1%.'
      },
      {
        title: '3. Circular Recovery & Industrial Pathways',
        content: 'Precision regranulation compounding, structural thermoplastic lumber, and chemical pyrolysis.'
      },
      {
        title: '4. Market Demand Reality & Commercial Boundaries',
        content: 'High commercial liquidity for single-stream polymers; complex uncompatibilized laminates require dedicated processing.'
      }
    ]
  },
  {
    id: 'metals_alloys_byproducts',
    code: 'KB-MT-03',
    title: 'Metallurgical Scrap Classification & Foundry Charging Specifications',
    category: 'Metal',
    keywords: ['Ferrous turnings', 'CNC swarf', 'aluminum dross', 'copper wire scrap', 'briquetting', 'induction melting'],
    summary: 'Charging standards for machining chips, CNC swarf, cutting fluid de-oiling (<2.0%), hydraulic briquetting, and alloy purity requirements.',
    lastUpdated: '2026-03-01T00:00:00.000Z',
    authoritativeSource: 'WasteXchange Metallurgical Secondary Raw Materials Benchmark & ASTM Charging Code',
    sectionsCount: 4,
    wordCount: 460,
    content: `# Metallurgical Scrap Classification & Foundry Charging Specifications (WasteXchange KB-MT-03)
**Authoritative Reference**: WasteXchange Metallurgical Secondary Raw Materials Benchmark & ASTM Charging Code
**Document Code**: \`KB-MT-03\`
**Category**: \`Metal\`
**Keywords**: Ferrous turnings, CNC swarf, aluminum dross, copper wire scrap, briquetting, induction melting

## 1. Material Classification & Alloy Chemistry
- Ferrous Turning & Boring Swarf: Spiral turnings and fine chips from lathe, CNC, and broaching operations.
- Aluminum Extrusion Scrap & Turnings (6000 Series / 6063-T6): Clean profile punchings with known Mg-Si stoichiometry.
- Copper & Brass Heavy Scrap: Millberry copper wire (minimum 99.9% Cu), honey brass turnings.

## 2. Technical Quality Thresholds & Permissible Tolerances
- Hydrocarbon & Cutting Fluid: Oil content prior to melting must be reduced to < 2.0% via centrifugal wringer.
- Tramp Iron: Aluminum or brass scrap must have < 0.1% tramp iron with inline neodymium magnetic separation.
- Briquetting: Puck density > 2.1 g/cm3 for aluminum, > 5.5 g/cm3 for cast iron to prevent burn-off.

## 3. Circular Recovery & Industrial Pathways
1. High-Pressure Hydraulic Briquetting & Induction Melting into alloy billets and automotive castings.
2. Rotary Salt Furnace Dross Recovery for aluminum skimmings.
3. Powder Metallurgy & Sintered Components for copper and iron swarf.

## 4. Market Demand Reality & Price Liquidity
- Exceptional Liquidity: Industrial metals command immediate cash settlements benchmarked against spot indexes.`,
    sections: [
      {
        title: '1. Material Classification & Alloy Chemistry',
        content: 'Ferrous turnings, aluminum 6000 series extrusions, copper wire scrap, and white dross classification.'
      },
      {
        title: '2. Technical Quality Thresholds & Permissible Tolerances',
        content: 'Cutting fluid content must be under 2.0%, tramp iron under 0.1%, briquetting required for fine swarf.'
      },
      {
        title: '3. Circular Recovery & Industrial Pathways',
        content: 'Hydraulic briquetting, induction melting, and rotary furnace recovery.'
      },
      {
        title: '4. Market Demand Reality & Price Liquidity',
        content: 'Immediate spot liquidity for clean single-alloy batches.'
      }
    ]
  },
  {
    id: 'cardboard_paper_pulp',
    code: 'KB-CB-05',
    title: 'Corrugated Container Scrap (OCC) & Paper Pulp Circularity Spec',
    category: 'Cardboard',
    keywords: ['Old Corrugated Containers (OCC)', 'Kraft paperboard', 'hydropulping', 'burst factor', 'stickies'],
    summary: 'Technical parameters for OCC Grade 11/12, moisture tolerances (max 10-12%), prohibitive stickies avoidance, and hydropulping recovery.',
    lastUpdated: '2026-03-01T00:00:00.000Z',
    authoritativeSource: 'WasteXchange Secondary Fiber Technical Specification & ISRI Grade Standards',
    sectionsCount: 4,
    wordCount: 420,
    content: `# Corrugated Container Scrap (OCC) & Paper Pulp Circularity Spec (WasteXchange KB-CB-05)
**Authoritative Reference**: WasteXchange Secondary Fiber Technical Specification & ISRI Grade Standards
**Document Code**: \`KB-CB-05\`
**Category**: \`Cardboard\`
**Keywords**: Old Corrugated Containers (OCC), Kraft paperboard, hydropulping, burst factor, stickies

## 1. Material Classification & Fiber Integrity
- Grade 11 OCC (Industrial Corrugated Scrap): Double-wall and single-wall boxes with virgin kraft liners.
- Grade 12 Double Sorted Corrugated (DS OCC): Clean corrugated containers free of boxboard.
- Kraft Multiwall Bag Cuttings: Unprinted unbleached virgin sulfate kraft paper offcuts.

## 2. Technical Quality Thresholds & Permissible Tolerances
- Moisture Threshold: Equilibrium moisture must not exceed 10.0-12.0%.
- Prohibitive Materials: Zero tolerance for wax-impregnated or bitumen-coated cartons.
- Total Outthrows: Must not exceed 1.0%.

## 3. Circular Recovery & Industrial Pathways
1. Hydropulping & Recycled Packaging Board into fluting medium and testliner.
2. Molded Pulp Protective Packaging for electronics and cosmetics.
3. Cellulose Hydroseeding for erosion control.

## 4. Market Demand Reality & Regional Sourcing
- Market Demand: Permanent, highly predictable demand across every packaging mill belt.`,
    sections: [
      {
        title: '1. Material Classification & Fiber Integrity',
        content: 'OCC Grade 11/12 specifications and virgin kraft bag clippings.'
      },
      {
        title: '2. Technical Quality Thresholds & Permissible Tolerances',
        content: 'Moisture must not exceed 10-12%; prohibitive wax and hot-melt stickies must be zero.'
      },
      {
        title: '3. Circular Recovery & Industrial Pathways',
        content: 'Hydropulping, multi-ply board forming, and molded pulp packaging.'
      },
      {
        title: '4. Market Demand Reality & Regional Sourcing',
        content: 'High continuous demand across packaging mills for secondary furnish.'
      }
    ]
  },
  {
    id: 'rubber_elastomers_crumb',
    code: 'KB-RB-04',
    title: 'Elastomer Byproducts, Curing Scrap & Devulcanization Engineering',
    category: 'Rubber',
    keywords: ['Vulcanized rubber', 'EPDM', 'SBR', 'devulcanization', 'crumb rubber', 'crumb modified bitumen'],
    summary: 'Devulcanization engineering, crumb rubber mesh grading (10-40 mesh), moisture threshold (<1.0%), and rubberized bitumen integration.',
    lastUpdated: '2026-03-01T00:00:00.000Z',
    authoritativeSource: 'WasteXchange Elastomer Recycling Protocol & Devulcanization Standard',
    sectionsCount: 4,
    wordCount: 450,
    content: `# Elastomer Byproducts, Curing Scrap & Devulcanization Engineering (WasteXchange KB-RB-04)
**Authoritative Reference**: WasteXchange Elastomer Recycling Protocol & Devulcanization Standard
**Document Code**: \`KB-RB-04\`
**Category**: \`Rubber\`
**Keywords**: Vulcanized rubber, EPDM, SBR, devulcanization, crumb rubber, crumb modified bitumen

## 1. Material Classification & Polymer Crosslinking
- Uncured Compound Scrap: Retains polymer chain mobility; direct-blendable into masterbatch mixers.
- Vulcanized EPDM Scrap: Extruded weatherstrips and hoses with covalent sulfur crosslinks.
- Crumb Buffings (SBR / Natural Rubber): High tensile retreading shavings.

## 2. Technical Quality Thresholds & Permissible Tolerances
- Moisture Threshold: < 1.0% for crumb rubber.
- Foreign Inclusions: Ferrous wire < 0.01%, textile cord fluff < 0.2%.
- Mesh Grading: 30-40 mesh for asphalt road modification (CRMB 55/60).

## 3. Circular Recovery & Industrial Pathways
1. Thermomechanical Devulcanization into reclaim rubber slabs for conveyor belts.
2. Crumb Rubber Modified Bitumen (CRMB) for high-durability highway pavements.
3. Molded Rubber Tiles for playground safety surfaces and acoustic insulation.

## 4. Market Demand Reality & Technical Misconception
- Science Rule: Never declare cured rubber as melt-recyclable; devulcanization or crumb modification is required.`,
    sections: [
      {
        title: '1. Material Classification & Polymer Crosslinking',
        content: 'Differentiating uncured compound scrap from vulcanized EPDM and SBR buffings.'
      },
      {
        title: '2. Technical Quality Thresholds & Permissible Tolerances',
        content: 'Moisture under 1.0%, steel wire under 0.01%, 30-40 mesh grading for CRMB.'
      },
      {
        title: '3. Circular Recovery & Industrial Pathways',
        content: 'Devulcanization, crumb rubber modified bitumen, and molded acoustic tiles.'
      },
      {
        title: '4. Market Demand Reality & Technical Misconception',
        content: 'Cured rubber requires selective sulfur bond cleavage; strong civil infrastructure demand.'
      }
    ]
  },
  {
    id: 'chemical_hazardous_byproducts',
    code: 'KB-CH-06',
    title: 'Industrial Spent Solvents, Spent Acids & Hazardous Sludge Directives',
    category: 'Chemical',
    keywords: ['Spent solvents', 'isopropyl alcohol (IPA)', 'spent pickling acid', 'fractional distillation', 'hazardous waste', 'TSDF'],
    summary: 'Classification of recoverable solvents (IPA, acetone), secondary acid coagulants, and non-recyclable hazardous toxic waste TSDF protocols.',
    lastUpdated: '2026-03-01T00:00:00.000Z',
    authoritativeSource: 'WasteXchange Chemical Byproduct Protocol & CPCB Schedule II Recovery Standards',
    sectionsCount: 4,
    wordCount: 470,
    content: `# Industrial Spent Solvents, Spent Acids & Hazardous Sludge Directives (WasteXchange KB-CH-06)
**Authoritative Reference**: WasteXchange Chemical Byproduct Protocol & CPCB Schedule II Recovery Standards
**Document Code**: \`KB-CH-06\`
**Category**: \`Chemical\`
**Keywords**: Spent solvents, isopropyl alcohol (IPA), spent pickling acid, fractional distillation, hazardous waste, TSDF

## 1. Stream Classification & Regulatory Stratification
- Category A: High-value recoverable solvents (IPA, acetone, ethanol, ethyl acetate).
- Category B: Secondary reagent acids (spent hydrochloric/sulfuric acid pickling liquor).
- Category C: Non-recyclable toxic heavy metal sludges requiring TSDF chemical fixation.

## 2. Technical Quality Thresholds & Permissible Tolerances
- Flash Point: Closed-cup flash point declaration mandatory.
- Halogenated Contamination: Chlorinated solvent mixtures > 0.5% prohibit thermal recovery without scrubber incinerators.
- Heavy Metals in Reagents: Spent pickling acid for ferric chloride must have < 25 ppm toxic trace metals.

## 3. Circular Recovery & Industrial Pathways
1. Thin-Film Vacuum Fractional Distillation: Regenerates technical grade solvents (>98.5% purity).
2. Coagulant Synthesis for Wastewater: Converting spent pickle liquor into Ferric Chloride (FeCl3) flocculants.
3. Stabilization & TSDF Landfill Disposal for hazardous toxic sludges.

## 4. Market Demand Reality & Strict Non-Recyclability Warning
- Regulatory Constraint: Category C toxic sludges have zero commercial buyer market and represent compliance disposal cost. High demand for solvent toll recovery.`,
    sections: [
      {
        title: '1. Stream Classification & Regulatory Stratification',
        content: 'Stratification into Category A recoverable solvents, Category B reagent acids, and Category C non-recyclable sludges.'
      },
      {
        title: '2. Technical Quality Thresholds & Permissible Tolerances',
        content: 'Flash point safety, halogenated solvent limits, and heavy metal concentrations.'
      },
      {
        title: '3. Circular Recovery & Industrial Pathways',
        content: 'Fractional vacuum distillation, ferric chloride wastewater coagulant synthesis, and TSDF stabilization.'
      },
      {
        title: '4. Market Demand Reality & Strict Non-Recyclability Warning',
        content: 'Mandatory non-recyclable categorization for hazardous toxic heavy metal sludges.'
      }
    ]
  }
];

/**
 * Loads all knowledge documents from /knowledge_base with embedded fallback
 */
export function getAllKnowledgeDocuments(forceReload = false): InternalDocument[] {
  const now = Date.now();
  if (!forceReload && cachedDocuments && cachedDocuments.length > 0 && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedDocuments;
  }

  try {
    if (!fs.existsSync(KB_DIR)) {
      cachedDocuments = EMBEDDED_FALLBACK_DOCS;
      lastCacheTime = now;
      return EMBEDDED_FALLBACK_DOCS;
    }

    const files = fs.readdirSync(KB_DIR).filter((f) => f.endsWith('.md'));
    if (files.length === 0) {
      cachedDocuments = EMBEDDED_FALLBACK_DOCS;
      lastCacheTime = now;
      return EMBEDDED_FALLBACK_DOCS;
    }

    const docs: InternalDocument[] = [];

    for (const file of files) {
      const fullPath = path.join(KB_DIR, file);
      const parsed = parseMarkdownDocument(fullPath);
      if (parsed) {
        docs.push(parsed);
      }
    }

    if (docs.length === 0) {
      cachedDocuments = EMBEDDED_FALLBACK_DOCS;
      lastCacheTime = now;
      return EMBEDDED_FALLBACK_DOCS;
    }

    cachedDocuments = docs;
    lastCacheTime = now;
    return docs;
  } catch (err) {
    console.error('Notice: Using embedded knowledge base fallback:', err);
    cachedDocuments = EMBEDDED_FALLBACK_DOCS;
    lastCacheTime = now;
    return EMBEDDED_FALLBACK_DOCS;
  }
}

/**
 * Adds or updates a document in /knowledge_base
 */
export function saveKnowledgeDocument(data: {
  title: string;
  category: string;
  code?: string;
  keywords?: string[];
  authoritativeSource?: string;
  content: string;
}): KnowledgeDocument {
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const code = data.code || `KB-${data.category.substring(0, 2).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
  const fileName = `${slug}.md`;
  const filePath = path.join(KB_DIR, fileName);

  // If content does not have header metadata, construct it
  let finalContent = data.content;
  if (!finalContent.startsWith('# ')) {
    finalContent = `# ${data.title} (${code})
**Authoritative Reference**: ${data.authoritativeSource || 'WasteXchange Industrial Standard'}
**Document Code**: \`${code}\`
**Category**: \`${data.category}\`
**Keywords**: ${(data.keywords || []).join(', ')}

${data.content}`;
  }

  fs.writeFileSync(filePath, finalContent, 'utf-8');
  cachedDocuments = null; // Invalidate cache

  const loaded = parseMarkdownDocument(filePath);
  if (!loaded) {
    throw new Error('Failed to parse saved document');
  }

  return loaded;
}

/**
 * Search knowledge base with relevance scoring
 */
export function searchKnowledgeBase(
  query: string,
  categoryFilter?: string,
  maxResults = 4
): KnowledgeSearchResult[] {
  const docs = getAllKnowledgeDocuments();
  if (!query && !categoryFilter) {
    return docs.slice(0, maxResults).map((d) => ({
      document: d,
      relevanceScore: 100,
      matchingSections: d.sections.slice(0, 2).map((s) => ({
        title: s.title,
        snippet: s.content.substring(0, 200) + '...'
      }))
    }));
  }

  const queryTerms = query
    .toLowerCase()
    .split(/[\s,.-]+/)
    .filter((t) => t.length > 2);

  const results: {
    doc: InternalDocument;
    score: number;
    matchingSections: { title: string; snippet: string }[];
  }[] = [];

  for (const doc of docs) {
    let score = 0;
    const matchingSections: { title: string; snippet: string }[] = [];

    // Category exact match bonus
    if (categoryFilter && doc.category.toLowerCase() === categoryFilter.toLowerCase()) {
      score += 45;
    } else if (categoryFilter && doc.category.toLowerCase().includes(categoryFilter.toLowerCase())) {
      score += 25;
    }

    // Keyword & Title matching
    for (const term of queryTerms) {
      if (doc.title.toLowerCase().includes(term)) {
        score += 25;
      }
      if (doc.keywords.some((k) => k.toLowerCase().includes(term))) {
        score += 20;
      }
      if (doc.category.toLowerCase().includes(term)) {
        score += 15;
      }
    }

    // Section matching
    for (const sec of doc.sections) {
      let secScore = 0;
      const lowerSec = sec.content.toLowerCase();

      for (const term of queryTerms) {
        if (lowerSec.includes(term)) {
          // Count occurrences
          const occurrences = (lowerSec.match(new RegExp(term, 'g')) || []).length;
          secScore += Math.min(occurrences * 4, 20);
        }
      }

      if (secScore > 0) {
        score += secScore;
        // Find best excerpt
        const firstTerm = queryTerms.find((t) => lowerSec.includes(t)) || queryTerms[0] || '';
        const idx = lowerSec.indexOf(firstTerm);
        const start = Math.max(0, idx - 60);
        const snippet = sec.content.substring(start, start + 280) + '...';

        matchingSections.push({
          title: sec.title,
          snippet
        });
      }
    }

    if (score > 0) {
      results.push({
        doc,
        score: Math.min(score, 99),
        matchingSections: matchingSections.slice(0, 3)
      });
    }
  }

  results.sort((a, b) => b.score - a.score);

  return results.slice(0, maxResults).map((r) => ({
    document: r.doc,
    relevanceScore: r.score,
    matchingSections: r.matchingSections.length > 0 
      ? r.matchingSections 
      : r.doc.sections.slice(0, 1).map((s) => ({ title: s.title, snippet: s.content.substring(0, 200) + '...' }))
  }));
}

/**
 * RAG Context Retrieval for Waste Assessment
 * Retrieves authoritative guidelines and generates structured citations
 */
export function retrieveKnowledgeContext(assessment: {
  materialCategory: string;
  wasteName: string;
  wasteType?: string;
  condition?: string;
  grade?: string;
  moistureLevel?: string;
  contaminationLevel?: string;
  additionalNotes?: string;
}) {
  const query = `${assessment.wasteName} ${assessment.wasteType || ''} ${assessment.condition || ''} ${assessment.grade || ''} ${assessment.additionalNotes || ''}`;
  const searchHits = searchKnowledgeBase(query, assessment.materialCategory, 3);

  // Fallback to general category match if no specific hit
  let finalHits = searchHits;
  if (finalHits.length === 0) {
    const allDocs = getAllKnowledgeDocuments();
    const catDoc = allDocs.find((d) => d.category.toLowerCase() === assessment.materialCategory.toLowerCase()) || allDocs[0];
    if (catDoc) {
      finalHits = [{
        document: catDoc,
        relevanceScore: 75,
        matchingSections: catDoc.sections.slice(0, 2).map((s) => ({
          title: s.title,
          snippet: s.content.substring(0, 250) + '...'
        }))
      }];
    }
  }

  // Format the prompt context
  let contextBlock = '=== AUTHORITATIVE WASTEXCHANGE KNOWLEDGE BASE (RETRIEVED VIA RAG) ===\n\n';
  const citations: KnowledgeCitation[] = [];

  for (let i = 0; i < finalHits.length; i++) {
    const hit = finalHits[i];
    const d = hit.document;
    contextBlock += `[DOCUMENT ${i + 1}: ${d.code} - "${d.title}"]\n`;
    contextBlock += `Authoritative Source: ${d.authoritativeSource}\n`;
    contextBlock += `Category: ${d.category}\n`;
    contextBlock += `Content Excerpt:\n${d.content}\n\n`;

    // Extract top section for citation
    const topSec = hit.matchingSections[0] || (d.sections && d.sections[0]);
    citations.push({
      documentCode: d.code,
      documentTitle: d.title,
      section: topSec ? topSec.title : 'Technical Specification',
      keyFinding: topSec ? topSec.snippet.replace(/\n+/g, ' ').substring(0, 220) + '...' : d.summary,
      relevanceScore: hit.relevanceScore
    });
  }

  return {
    contextBlock,
    citations,
    primaryDocument: finalHits[0]?.document
  };
}

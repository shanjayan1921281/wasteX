import type { WasteListing, MaterialRequirement, BuyerMatch } from '../types';

export function calculateDeterministicMatch(
  listing: WasteListing,
  requirement: MaterialRequirement
): BuyerMatch {
  let score = 0;
  const breakdown = {
    material: 0,
    quantity: 0,
    quality: 0,
    location: 0,
    demand: 0,
    availability: 0,
  };
  const reasons: string[] = [];

  // 1. Material Compatibility (max 30 pts)
  const listCat = (listing.materialCategory || '').toLowerCase();
  const reqCat = (requirement.materialCategory || '').toLowerCase();
  const listName = (listing.wasteName || '').toLowerCase();
  const reqSpec = (requirement.specificMaterial || '').toLowerCase();

  if (listCat === reqCat || listName.includes(reqCat) || reqCat.includes(listCat)) {
    breakdown.material += 20;
    if (reqSpec && (listName.includes(reqSpec) || reqSpec.includes(listName))) {
      breakdown.material += 10;
      reasons.push(`Material exact match: ${listing.wasteName} matches ${requirement.specificMaterial}`);
    } else {
      breakdown.material += 6;
      reasons.push(`Category match: ${listing.materialCategory}`);
    }
  } else {
    reasons.push('Secondary material category divergence');
  }

  // 2. Quantity Compatibility (max 20 pts)
  const avail = listing.availableQuantity || listing.quantity;
  const min = requirement.minQuantity;
  const max = requirement.maxQuantity;

  if (avail >= min && avail <= max * 1.5) {
    breakdown.quantity = 20;
    reasons.push(`Quantity optimal (${avail} ${listing.unit} fits required range ${min} - ${max} ${requirement.unit})`);
  } else if (avail >= min * 0.7 && avail < min) {
    breakdown.quantity = 14;
    reasons.push(`Partial quantity available (${avail} ${listing.unit} vs min ${min} ${requirement.unit})`);
  } else if (avail > max * 1.5) {
    breakdown.quantity = 15;
    reasons.push(`Surplus available (${avail} ${listing.unit} exceeds max ${max} ${requirement.unit}; partial procurement possible)`);
  } else {
    breakdown.quantity = 5;
    reasons.push(`Quantity divergence: available ${avail} vs needed ${min}-${max}`);
  }

  // 3. Quality Compatibility (max 15 pts)
  const lGrade = (listing.grade || listing.quality || '').toLowerCase();
  const rQuality = (requirement.requiredQuality || '').toLowerCase();

  if (lGrade.includes('grade a') || lGrade.includes('clean') || rQuality.includes('clean')) {
    breakdown.quality = 15;
    reasons.push('High quality grade meets buyer processing threshold');
  } else if (lGrade.includes('grade b') || lGrade.includes('mixed')) {
    breakdown.quality = 10;
    reasons.push('Acceptable secondary quality tier');
  } else {
    breakdown.quality = 8;
  }

  // 4. Location Proximity (max 15 pts)
  const lLoc = (listing.location || '').toLowerCase();
  const rLoc = (requirement.preferredLocation || '').toLowerCase();

  const wordsL = lLoc.split(/[\s,]+/);
  const matched = wordsL.some(w => w.length > 3 && rLoc.includes(w));

  if (matched) {
    breakdown.location = 15;
    reasons.push(`Direct regional proximity in ${listing.location}`);
  } else {
    breakdown.location = 10;
    reasons.push('Inter-district regional transit required');
  }

  // 5. Demand Activity (max 10 pts)
  if (requirement.status === 'ACTIVE') {
    breakdown.demand = 10;
    reasons.push('Buyer demand currently active and verified');
  } else {
    breakdown.demand = 4;
  }

  // 6. Availability & Logistics (max 10 pts)
  if (listing.availability === 'Immediate') {
    breakdown.availability = 10;
    reasons.push('Immediate dispatch ready');
  } else {
    breakdown.availability = 7;
    reasons.push(`Availability: ${listing.availability}`);
  }

  score = breakdown.material + breakdown.quantity + breakdown.quality + breakdown.location + breakdown.demand + breakdown.availability;
  score = Math.min(100, Math.max(10, score));

  const explanation = `Calculated ${score}% match: ${listing.sellerBusinessName}'s listing for ${listing.wasteName} matches ${requirement.dealerBusinessName}'s procurement criteria for ${requirement.specificMaterial}.`;

  return {
    matchId: `match-${listing.listingId}-${requirement.requirementId}`,
    listingId: listing.listingId,
    requirementId: requirement.requirementId,
    buyerBusinessId: requirement.dealerBusinessId,
    buyerBusinessName: requirement.dealerBusinessName,
    sellerBusinessId: listing.sellerBusinessId,
    sellerBusinessName: listing.sellerBusinessName,
    score,
    breakdown,
    reasons,
    aiExplanation: explanation,
    createdAt: new Date().toISOString(),
  };
}

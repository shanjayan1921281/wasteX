import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { WasteIntelligenceReport } from '../types';

export const analysisService = {
  async saveReport(report: WasteIntelligenceReport): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase.from('waste_analysis').upsert({
        waste_type: report.wasteName,
        material: report.materialCategory,
        condition: report.compositionAnalysis?.qualityGrade || 'Industrial Grade',
        quality: report.executiveSummary?.estimatedQuality || 'Standard',
        quantity: report.quantity,
        quantity_unit: report.unit,
        contamination: report.compositionAnalysis?.possibleContaminants?.join(', ') || 'Minimal',
        recoverability: report.executiveSummary?.recoverability || 'High',
        ai_confidence: report.aiConfidence || 90,
        disclaimer: report.disclaimer,
        composition_analysis: report.compositionAnalysis || {},
        quantity_analysis: report.quantityAnalysis || {},
        generation_pattern: report.generationPattern || {},
        pathways: report.pathways || {},
        ai_recommendation: report.aiRecommendation || {},
        market_demand_analysis: report.marketDemandAnalysis || {},
        possible_applications: report.executiveSummary?.potentialReuse ? [report.executiveSummary.potentialReuse] : [],
        source_attribution: report.sourceAttribution || {},
        knowledge_citations: report.knowledgeCitations || [],
        raw_ai_response: report,
        analyzed_at: report.analysisDate || new Date().toISOString(),
        created_at: report.createdAt || new Date().toISOString()
      });
    } catch (err) {
      console.warn('Error saving waste analysis to Supabase:', err);
    }
  },

  async getReports(): Promise<WasteIntelligenceReport[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('waste_analysis')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((d) => {
        if (d.raw_ai_response && d.raw_ai_response.reportId) {
          return d.raw_ai_response as WasteIntelligenceReport;
        }

        return {
          reportId: d.id,
          assessmentId: d.waste_id || d.id,
          industryName: 'Industrial Facility',
          location: 'Coimbatore, Tamil Nadu',
          wasteName: d.waste_type || 'Industrial Byproduct',
          materialCategory: d.material || 'Textile',
          quantity: Number(d.quantity) || 500,
          unit: d.quantity_unit || 'kg',
          analysisDate: d.analyzed_at || d.created_at,
          aiConfidence: Number(d.ai_confidence) || 90,
          disclaimer: d.disclaimer || 'Advisory circular analysis report',
          executiveSummary: {
            materialIdentified: d.material || 'Industrial Secondary Material',
            currentQuantity: `${d.quantity || 500} ${d.quantity_unit || 'kg'}`,
            estimatedQuality: d.quality || 'Grade A Industrial Secondary',
            recoverability: d.recoverability || 'High',
            potentialReuse: 'Mechanical recycling / Secondary compounding',
            marketDemand: 'High Demand',
            potentialBuyerCount: 6,
            recommendedAction: 'Direct listing on B2B WasteXchange',
            summaryText: 'Verified recyclable stream with high recovery potential.'
          },
          compositionAnalysis: d.composition_analysis || {
            primaryMaterial: d.material || 'Cellulose',
            primaryPercentage: 92,
            secondaryMaterials: [],
            possibleContaminants: ['None'],
            materialConfidence: 94,
            qualityGrade: 'Grade A',
            labelNote: 'Verified'
          },
          quantityAnalysis: d.quantity_analysis || {
            currentAvailableQuantity: `${d.quantity || 500} ${d.quantity_unit || 'kg'}`,
            averageWeeklyGeneration: '500 kg',
            estimatedMonthlyGeneration: '2000 kg',
            estimatedRecoverableQuantity: `${(d.quantity || 500) * 0.9} kg`,
            calculatedNotes: 'High yield stream'
          },
          generationPattern: d.generation_pattern || {
            weeklyGeneration: '500 kg',
            monthlyGeneration: '2000 kg',
            peakGenerationPeriods: 'Continuous',
            productionRelationship: 'Directly linked to spinning schedule',
            estimatedFutureAvailability: 'Continuous Stream'
          },
          pathways: d.pathways || {
            directReuse: { suitability: 'Medium', requiredProcessing: 'Sorting', possibleOutput: 'Wiping rags', benefits: 'Zero cost', limitations: 'Lower value', confidenceScore: 78 },
            recycling: { suitability: 'High', requiredProcessing: 'Mechanical opening', possibleOutput: 'Rotor yarn', benefits: 'Maximum value recovery', limitations: 'Requires baling', confidenceScore: 95 },
            recovery: { suitability: 'Low', requiredProcessing: 'Shredding', possibleOutput: 'Insulation', benefits: 'Diverts from landfill', limitations: 'Low price', confidenceScore: 60 },
            upcycling: { suitability: 'Medium', requiredProcessing: 'Chemical extraction', possibleOutput: 'Micro-powder', benefits: 'Premium value', limitations: 'High capex', confidenceScore: 70 }
          },
          aiRecommendation: d.ai_recommendation || {
            recommendedPathway: 'Mechanical Recycling & Rotor Yarn Spinning',
            whyThisPathway: 'High staple length and low contamination allow direct spinning.',
            recommendedNextAction: 'Publish to B2B Circular Marketplace',
            potentialPreparationRequired: 'Keep dry and bale in uniform 100kg packs',
            potentialBuyerCategory: 'Open-end rotor spinning mills & textile aggregators'
          },
          marketDemandAnalysis: d.marketDemandAnalysis || {
            demandLevel: 'High Demand',
            potentialBuyerCategories: ['Open-end Spinning Mills', 'Fiber Aggregators', 'Automotive Nonwoven Plants'],
            typicalRequiredQuantities: '500 - 5000 kg/month',
            targetLocations: ['Coimbatore', 'Tiruppur', 'Erode', 'Salem'],
            numberOfPotentialMatches: 6,
            demandSummary: 'High commercial demand driven by virgin raw material price appreciation.'
          },
          createdAt: d.created_at
        };
      });
    } catch (err) {
      console.warn('Error querying waste analysis from Supabase:', err);
      return [];
    }
  }
};

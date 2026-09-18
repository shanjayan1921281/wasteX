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

/**
 * Loads all knowledge documents from /knowledge_base
 */
export function getAllKnowledgeDocuments(forceReload = false): InternalDocument[] {
  const now = Date.now();
  if (!forceReload && cachedDocuments && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedDocuments;
  }

  try {
    if (!fs.existsSync(KB_DIR)) {
      return [];
    }

    const files = fs.readdirSync(KB_DIR).filter((f) => f.endsWith('.md'));
    const docs: InternalDocument[] = [];

    for (const file of files) {
      const fullPath = path.join(KB_DIR, file);
      const parsed = parseMarkdownDocument(fullPath);
      if (parsed) {
        docs.push(parsed);
      }
    }

    cachedDocuments = docs;
    lastCacheTime = now;
    return docs;
  } catch (err) {
    console.error('Error reading knowledge base directory:', err);
    return cachedDocuments || [];
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

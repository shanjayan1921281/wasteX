import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Clock, 
  ExternalLink,
  Loader2,
  X,
  FileCheck,
  Tag,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import type { KnowledgeDocument, KnowledgeSearchResult } from '../types';

export const AdminKnowledgeBaseConsole: React.FC = () => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [readingDocLoading, setReadingDocLoading] = useState(false);

  // Search testing state
  const [testQuery, setTestQuery] = useState('comber noil moisture threshold rotor spinning');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHasRun, setSearchHasRun] = useState(false);

  // Document creation state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Textile' | 'Plastic' | 'Metal' | 'Rubber' | 'Cardboard' | 'Chemical' | 'Other'>('Plastic');
  const [newCode, setNewCode] = useState('');
  const [newAuthoritativeSource, setNewAuthoritativeSource] = useState('WasteXchange Industrial Standard');
  const [newKeywords, setNewKeywords] = useState('');
  const [newContent, setNewContent] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Load documents on mount
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/knowledge/documents');
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Error loading knowledge documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Run RAG Search Test
  const handleRunSearchTest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!testQuery.trim() && !categoryFilter) return;

    setIsSearching(true);
    setSearchHasRun(true);
    try {
      const res = await fetch('/api/knowledge/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: testQuery, category: categoryFilter || undefined })
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error('Failed to run search test:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Open Full Document Viewer
  const handleOpenDoc = async (id: string) => {
    setReadingDocLoading(true);
    try {
      const res = await fetch(`/api/knowledge/documents/${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedDoc(data.document);
      }
    } catch (err) {
      console.error('Failed to fetch full document:', err);
    } finally {
      setReadingDocLoading(false);
    }
  };

  // Ingest new document
  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setCreateError('Title and document content are required.');
      return;
    }

    setCreateLoading(true);
    setCreateError(null);

    try {
      const keywordsArray = newKeywords.split(',').map((k) => k.trim()).filter(Boolean);
      const res = await fetch('/api/knowledge/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          code: newCode || undefined,
          authoritativeSource: newAuthoritativeSource,
          keywords: keywordsArray,
          content: newContent
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to ingest document');
      }

      setCreateSuccess(true);
      setTimeout(() => {
        setIsCreateModalOpen(false);
        setCreateSuccess(false);
        setNewTitle('');
        setNewContent('');
        setNewKeywords('');
        setNewCode('');
        fetchDocuments();
      }, 1200);
    } catch (err: any) {
      setCreateError(err.message || 'Ingestion failed');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            <span className="text-xs uppercase tracking-wider text-emerald-800 font-bold">
              Waste Standards & Rules
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Industrial Waste Standards Repository
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
            Verified material specifications, recycling limits, and quality guidelines used by the system to verify waste intelligence reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Standard</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 block font-medium">Standards In Repository</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{documents.length}</span>
          <span className="text-[11px] text-emerald-700 font-semibold">Authoritative standards</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 block font-medium">Total Words Indexed</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {documents.reduce((acc, d) => acc + (d.wordCount || 0), 0).toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-500">Technical reference words</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 block font-medium">Categories Covered</span>
          <span className="text-2xl font-bold text-teal-700 mt-1 block">
            {new Set(documents.map((d) => d.category)).size}
          </span>
          <span className="text-[11px] text-slate-500">Textile, Plastic, Metal, etc.</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 block font-medium">Verification Status</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">ACTIVE</span>
          <span className="text-[11px] text-emerald-700">Standards grounding live</span>
        </div>
      </div>

      {/* Interactive RAG Retrieval Testing Console */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Standards Search & Verification Tool</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Look up relevant specifications, tolerance thresholds, and processing rules for any material.
            </p>
          </div>
          <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
            Semantic Search
          </span>
        </div>

        <form onSubmit={handleRunSearchTest} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="e.g. Comber noil moisture threshold, PP-HDPE cross-contamination..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            >
              <option value="">All Categories</option>
              <option value="Textile">Textile</option>
              <option value="Plastic">Plastic</option>
              <option value="Metal">Metal</option>
              <option value="Rubber">Rubber</option>
              <option value="Cardboard">Cardboard</option>
              <option value="Chemical">Chemical</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isSearching}
              className="w-full h-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Search Specs</span>
            </button>
          </div>
        </form>

        {/* Quick query presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
          <span className="text-slate-500">Quick examples:</span>
          {[
            'comber noil moisture limit',
            'PP and HDPE immiscibility brittle',
            'aluminum turning cutting oil 2%',
            'vulcanized rubber devulcanization CRMB',
            'spent solvent thin-film distillation'
          ].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setTestQuery(preset);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 cursor-pointer font-medium"
            >
              "{preset}"
            </button>
          ))}
        </div>

        {/* Search Results Display */}
        {searchHasRun && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>
                Found <strong className="text-slate-900">{searchResults.length}</strong> matching standard(s):
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold">Sorted by match relevance</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No direct document match for this query. The system falls back to category guidelines.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchResults.map((res, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-colors space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-emerald-800 border border-slate-200 font-bold">
                        {res.document.code}
                      </span>
                      <span className="text-xs font-bold text-amber-700">
                        {res.relevanceScore}% Match
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {res.document.title}
                    </h4>

                    <div className="space-y-1 text-[11px] text-slate-600">
                      {res.matchingSections.slice(0, 2).map((sec, sIdx) => (
                        <div key={sIdx} className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                          <strong className="text-emerald-800 block text-[10px] mb-0.5">
                            {sec.title}
                          </strong>
                          <p className="line-clamp-2 text-slate-700">{sec.snippet}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200">
                      <span>Category: {res.document.category}</span>
                      <button
                        onClick={() => handleOpenDoc(res.document.id)}
                        className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ingested Documents Catalog */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Industry Standards Catalog
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Approved specifications and tolerance guidelines.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {documents.length} standards available
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white text-emerald-800 border border-slate-200">
                      {doc.code}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {doc.category}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                    {doc.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {doc.summary}
                  </p>

                  {/* Keywords Pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {doc.keywords.slice(0, 3).map((kw, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200"
                      >
                        #{kw}
                      </span>
                    ))}
                    {doc.keywords.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{doc.keywords.length - 3}</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500">
                    {doc.wordCount} words
                  </span>
                  <button
                    onClick={() => handleOpenDoc(doc.id)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <span>Read Spec</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Reader Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-700">
                    {selectedDoc.code}
                  </span>
                  <span className="text-[11px] text-slate-400">·</span>
                  <span className="text-xs text-slate-600 font-medium">
                    Category: {selectedDoc.category}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {selectedDoc.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Authoritative Reference: {selectedDoc.authoritativeSource}
                </p>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-800 font-mono whitespace-pre-wrap selection:bg-emerald-100">
              {selectedDoc.content}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>
                Word count: {selectedDoc.wordCount} words · Last updated: {new Date(selectedDoc.lastUpdated).toLocaleDateString()}
              </span>
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                Close Spec
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ingest New Document Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Add Waste Material Specification
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="p-6 overflow-y-auto space-y-4 text-xs">
              {createError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {createSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Specification saved successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Document Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spent Solvents Fractional Distillation Spec"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Material Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="Textile">Textile</option>
                    <option value="Plastic">Plastic</option>
                    <option value="Metal">Metal</option>
                    <option value="Rubber">Rubber</option>
                    <option value="Cardboard">Cardboard</option>
                    <option value="Chemical">Chemical</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Document Code (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. KB-CH-07"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Authoritative Source</label>
                  <input
                    type="text"
                    placeholder="e.g. ASTM / CPCB Standard Reference"
                    value={newAuthoritativeSource}
                    onChange={(e) => setNewAuthoritativeSource(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Keywords (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. solvents, acetone, distillation, hazardous, recovery"
                  value={newKeywords}
                  onChange={(e) => setNewKeywords(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  Specification Content (Markdown) *
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder={`## 1. Material Classification & Properties\nDetail classification and physical characteristics...\n\n## 2. Technical Quality Thresholds & Tolerances\nSpecify moisture %, contamination limits, recycling boundaries...\n\n## 3. Circular Recovery & Industrial Pathways\nDetail processing steps and commercial outputs...`}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || createSuccess}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {createLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>{createLoading ? 'Saving...' : 'Save Specification'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

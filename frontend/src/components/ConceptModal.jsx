import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, BookOpen, BrainCircuit, ArrowRight, CheckCircle2, AlertCircle, Clock, Link2, Sparkles } from 'lucide-react';

export default function ConceptModal({ concept, onClose, onSelectConcept }) {
  const navigate = useNavigate();

  if (!concept) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'STRONG':
        return <span className="badge-status bg-[#7DD6BF] text-[#111111]">🟢 Strong</span>;
      case 'LEARNING':
        return <span className="badge-status bg-[#F8E54B] text-[#111111]">🟡 Learning</span>;
      case 'NEEDS_ATTENTION':
        return <span className="badge-status bg-[#FF8A8A] text-[#111111] animate-pulse">🔴 Needs Attention</span>;
      default:
        return <span className="badge-status bg-gray-100 text-gray-700">⚪ Not Started</span>;
    }
  };

  const handleStartPractice = () => {
    onClose();
    navigate(`/practice/${concept.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border-[3px] border-[#111111] shadow-neo-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl border-[2px] border-[#111111] bg-gray-100 hover:bg-[#FF8A8A] hover:text-white transition-all shadow-neo-sm cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {getStatusBadge(concept.status)}
          {concept.attempts_count > 0 && (
            <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full border border-gray-300">
              Accuracy: {Math.round(concept.accuracy || 0)}% ({concept.attempts_count} attempts)
            </span>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight mb-3">
          {concept.name}
        </h2>

        <p className="text-sm font-medium text-gray-700 leading-relaxed mb-6">
          {concept.description || 'Core concept in the curriculum graph.'}
        </p>

        {/* AI Explanation Card */}
        <div className="card-lavender p-5 mb-6">
          <div className="flex items-center gap-2 mb-2 font-black text-sm text-[#111111]">
            <Sparkles className="w-4 h-4 text-[#3346C8]" />
            <span>AI Concept Breakdown</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-[#111111] whitespace-pre-line leading-relaxed">
            {concept.ai_explanation || 'This concept organizes operations and principles within this domain.'}
          </p>
          
          {concept.ai_example && (
            <div className="mt-3.5 pt-3 border-t border-[#111111]/20 bg-white/70 rounded-xl p-3 border border-[#111111]/30">
              <span className="text-[11px] font-black uppercase text-[#3346C8] block mb-1">
                Practical Example / Code:
              </span>
              <pre className="text-xs font-mono text-gray-900 whitespace-pre-wrap">
                {concept.ai_example}
              </pre>
            </div>
          )}
        </div>

        {/* Prerequisites & Related Concepts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Prerequisites */}
          <div className="card-neo p-4 bg-gray-50">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-600 mb-2.5 flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-[#3346C8]" />
              Prerequisites
            </h4>
            {concept.prerequisites && concept.prerequisites.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {concept.prerequisites.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onSelectConcept && onSelectConcept(p.id)}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-[#111111] shadow-neo-sm hover:bg-[#F8E54B] transition-colors cursor-pointer"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 font-medium">No prior prerequisites required.</p>
            )}
          </div>

          {/* Related Concepts */}
          <div className="card-neo p-4 bg-gray-50">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-600 mb-2.5 flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-[#3346C8]" />
              Related Topics
            </h4>
            {concept.related_concepts && concept.related_concepts.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {concept.related_concepts.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onSelectConcept && onSelectConcept(r.id)}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-[#111111] shadow-neo-sm hover:bg-[#C9B8F5] transition-colors cursor-pointer"
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 font-medium">None linked directly.</p>
            )}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t-2 border-gray-100">
          <button
            onClick={onClose}
            className="w-full sm:w-auto btn-white text-xs px-5 py-3 cursor-pointer"
          >
            Back to Map
          </button>

          <button
            onClick={handleStartPractice}
            className="w-full sm:w-auto btn-primary text-xs sm:text-sm px-6 py-3 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Test Understanding (Practice)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}

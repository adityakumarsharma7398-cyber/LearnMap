import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ArrowRight, RotateCcw, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function RecommendationCard({ recommendation, courseId }) {
  const navigate = useNavigate();

  if (!recommendation) {
    return (
      <div className="card-yellow p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white border-[2px] border-[#111111] flex items-center justify-center text-[#3346C8] shadow-neo-sm shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-gray-800">Next Action</span>
            <h3 className="text-lg font-black text-[#111111]">Explore your LearnMap</h3>
            <p className="text-xs font-medium text-gray-700">Click any concept node in your map to view explanations or test your understanding.</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/map?courseId=${courseId}`)}
          className="btn-primary text-xs px-5 py-2.5 whitespace-nowrap cursor-pointer"
        >
          Open Map →
        </button>
      </div>
    );
  }

  const isRevise = recommendation.type === 'REVISE';

  const handleAction = () => {
    if (recommendation.concept_id) {
      navigate(`/practice/${recommendation.concept_id}`);
    } else {
      navigate(`/map?courseId=${courseId}`);
    }
  };

  return (
    <div className={`rounded-3xl border-[3px] border-[#111111] p-6 shadow-neo-lg relative overflow-hidden ${
      isRevise ? 'bg-[#F9DDEB]' : 'bg-[#C9B8F5]'
    }`}>
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border-[2px] border-[#111111] text-xs font-black text-[#111111] shadow-neo-sm">
          <Target className="w-3.5 h-3.5 text-[#3346C8]" />
          <span>YOUR RECOMMENDED NEXT STEP</span>
        </div>
        
        {isRevise && (
          <span className="badge-status bg-[#FF8A8A] text-[#111111] text-[11px] animate-pulse">
            🔴 Priority Revision
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Left 2 columns: Text & Reasoning */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight mb-2">
            {recommendation.reason.split('because')[0]}
          </h2>

          <div className="card-neo p-3.5 bg-white text-left">
            <span className="text-[11px] font-black uppercase text-[#3346C8] block mb-1">
              Why LearnMap chose this:
            </span>
            <p className="text-xs sm:text-sm font-medium text-gray-800 leading-relaxed">
              {recommendation.reason}
            </p>
            {recommendation.based_on && (
              <p className="text-[11px] font-bold text-gray-500 mt-1.5 pt-1.5 border-t border-gray-100">
                Evidence: {recommendation.based_on}
              </p>
            )}
          </div>
        </div>

        {/* Right column: Action CTAs */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleAction}
            className="w-full btn-primary text-sm py-3.5 flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            <span>{isRevise ? 'Review Now' : 'Start Learning'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate(`/map?courseId=${courseId}`)}
            className="w-full btn-white text-xs py-2.5 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>View in Full Map</span>
          </button>
        </div>
      </div>
    </div>
  );
}

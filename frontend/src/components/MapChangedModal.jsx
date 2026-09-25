import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertTriangle, ArrowRight, MapPin, RefreshCw, X } from 'lucide-react';

export default function MapChangedModal({
  isOpen,
  onClose,
  conceptName,
  previousStatus,
  newStatus,
  incorrectCount,
  accuracy,
  weaknessReason,
  courseId,
  conceptId
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleReviewNow = () => {
    onClose();
    if (conceptId) {
      navigate(`/practice/${conceptId}`);
    } else {
      navigate(`/map?courseId=${courseId}`);
    }
  };

  const handleGoToMap = () => {
    onClose();
    navigate(`/map?courseId=${courseId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-lg bg-[#F9DDEB] rounded-3xl border-[3.5px] border-[#111111] shadow-neo-lg p-6 sm:p-8 text-center overflow-hidden">
        
        {/* Decorative corner badge */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#F8E54B] rounded-full border-[2.5px] border-[#111111] -z-0 opacity-40"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl border-[2px] border-[#111111] bg-white hover:bg-gray-100 shadow-neo-sm cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Wow Icon */}
        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FF6B6B] border-[2.5px] border-[#111111] text-white shadow-neo mb-4 animate-bounce">
          <Sparkles className="w-8 h-8" />
        </div>

        {/* Main Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight mb-2">
          Your LearnMap just changed!
        </h2>

        <p className="text-sm font-bold text-gray-800 mb-6">
          The map evolves with your mistakes to guide your next learning step.
        </p>

        {/* Status Transition Visual Card */}
        <div className="card-neo p-4 bg-white mb-5 text-left border-[2.5px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <span className="text-xs font-black uppercase text-gray-500">Concept Transition</span>
            <div className="flex items-center gap-2 text-xs font-black">
              <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-300">
                {previousStatus || 'NOT_STARTED'}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="px-2 py-0.5 rounded bg-[#FF8A8A] text-[#111111] border border-[#111111] animate-pulse">
                🔴 {newStatus || 'NEEDS_ATTENTION'}
              </span>
            </div>
          </div>

          <h3 className="text-lg font-black text-[#111111] mb-1">
            {conceptName || 'Circular Queue'}
          </h3>

          <p className="text-xs font-medium text-gray-700 leading-relaxed mb-3">
            {weaknessReason || `You made ${incorrectCount || 3} incorrect attempts on queue wrapping and boundary conditions.`}
          </p>

          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <div className="bg-[#F8E54B] px-2.5 py-1 rounded-lg border border-[#111111] text-xs font-black">
              {incorrectCount || 3} Mistakes
            </div>
            <div className="bg-[#C9B8F5] px-2.5 py-1 rounded-lg border border-[#111111] text-xs font-black">
              {Math.round(accuracy || 40)}% Accuracy
            </div>
          </div>
        </div>

        {/* Recommendation explanation note */}
        <div className="bg-white/80 rounded-xl p-3 border border-[#111111] text-xs font-bold text-[#111111] mb-6 text-left">
          🎯 <span className="underline font-black">Why this matters:</span> Mastering {conceptName || 'Circular Queue'} is critical before progressing to dependent topics like Trees and Advanced Graph buffers in your map.
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleGoToMap}
            className="w-full sm:w-1/2 btn-white text-xs py-3 cursor-pointer"
          >
            View Live Map
          </button>
          
          <button
            onClick={handleReviewNow}
            className="w-full sm:w-1/2 btn-primary text-xs py-3 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Review {conceptName || 'Concept'} →</span>
          </button>
        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, XCircle, AlertCircle, RotateCcw, Brain, ShieldAlert } from 'lucide-react';
import { practiceService, conceptService, getStoredCourseId } from '../services/api';
import MapChangedModal from '../components/MapChangedModal';

export default function PracticePage() {
  const { conceptId } = useParams();
  const navigate = useNavigate();

  const [concept, setConcept] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: selectedOption }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showWowModal, setShowWowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConceptAndQuestions();
  }, [conceptId]);

  const loadConceptAndQuestions = async () => {
    setLoading(true);
    try {
      const [conceptData, questionsData] = await Promise.all([
        conceptService.getConceptDetail(conceptId),
        practiceService.getQuestions(conceptId)
      ]);
      setConcept(conceptData);
      setQuestions(questionsData);
    } catch (err) {
      console.error('Error loading practice session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Format answers array
    const answersPayload = questions.map((q) => ({
      question_id: q.id,
      selected_answer: selectedAnswers[q.id] || ''
    }));

    setIsSubmitting(true);
    try {
      const practiceResult = await practiceService.submitPractice(conceptId, answersPayload);
      setResult(practiceResult);

      // If map status changed or weakness detected, trigger the WOW Moment modal!
      if (practiceResult.map_changed || practiceResult.weakness_detected) {
        setShowWowModal(true);
      }
    } catch (err) {
      console.error('Error submitting practice:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick helper to simulate making 3 mistakes on Circular Queue for the Hackathon Demo
  const handleSimulateMistakes = () => {
    const wrongAnswers = {};
    questions.forEach((q, idx) => {
      if (idx < 3) {
        // Pick wrong option
        const wrongOpt = q.options.find((opt) => opt !== q.correct_answer) || q.options[0];
        wrongAnswers[q.id] = wrongOpt;
      } else {
        wrongAnswers[q.id] = q.correct_answer;
      }
    });
    setSelectedAnswers(wrongAnswers);
  };

  const targetCourseId = concept?.course_id || getStoredCourseId();

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Sparkles className="w-8 h-8 text-[#3346C8] animate-spin" />
          <span className="text-sm font-bold">Preparing practice questions...</span>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const allAnswered = questions.every((q) => selectedAnswers[q.id]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Top Breadcrumb & Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate(targetCourseId ? `/map?courseId=${targetCourseId}` : '/map')}
          className="btn-white text-xs px-3.5 py-2 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Map</span>
        </button>

        <div className="text-center">
          <span className="text-xs font-black uppercase tracking-wider text-gray-600 block">
            Practice Session
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#111111]">
            {concept?.name}
          </h1>
        </div>

        {/* 1-Click Demo Shortcut */}
        {!result && (
          <button
            onClick={handleSimulateMistakes}
            title="Auto-fill 3 mistakes to trigger the LearnMap Changed wow-moment demo"
            className="text-[11px] font-black px-2.5 py-1.5 bg-[#F8E54B] text-[#111111] rounded-xl border-[2px] border-[#111111] shadow-neo-sm hover:bg-yellow-300 cursor-pointer"
          >
            ⚡ Demo 3 Mistakes
          </button>
        )}
      </div>

      {!result ? (
        /* Active Question Card */
        <div className="card-neo p-6 sm:p-8 bg-white border-[3px] shadow-neo-lg">
          
          {/* Progress Bar & Counter */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase text-[#3346C8] bg-blue-50 px-3 py-1 rounded-full border border-[#3346C8]">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-xs font-bold text-gray-500">
              Difficulty: {currentQ?.difficulty || 'MEDIUM'}
            </span>
          </div>

          <div className="w-full bg-gray-100 h-2.5 rounded-full border-[1.5px] border-[#111111] mb-6 overflow-hidden">
            <div
              className="bg-[#3346C8] h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <h2 className="text-lg sm:text-xl font-black text-[#111111] leading-relaxed mb-6">
            {currentQ?.question_text}
          </h2>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentQ?.options?.map((option, idx) => {
              const isSelected = selectedAnswers[currentQ.id] === option;
              const optionLetters = ['A', 'B', 'C', 'D'];
              
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(currentQ.id, option)}
                  className={`w-full p-4 rounded-2xl border-[2.5px] border-[#111111] text-left font-bold text-xs sm:text-sm flex items-center gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#C9B8F5] shadow-neo scale-[1.01]'
                      : 'bg-white hover:bg-gray-50 shadow-neo-sm'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-xl border-[2px] border-[#111111] flex items-center justify-center font-black text-xs shrink-0 ${
                    isSelected ? 'bg-[#3346C8] text-white' : 'bg-gray-100'
                  }`}>
                    {optionLetters[idx]}
                  </span>
                  <span className="text-gray-900 leading-snug">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation & Submit */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`btn-white text-xs px-4 py-2.5 flex items-center gap-1.5 ${
                currentIndex === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="btn-primary text-xs px-6 py-2.5 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-mint text-xs sm:text-sm px-7 py-3 flex items-center gap-2 cursor-pointer font-black"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Evaluating Answers...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Practice</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      ) : (
        /* Results View */
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Summary Score Card */}
          <div className={`rounded-3xl border-[3px] border-[#111111] p-6 sm:p-8 shadow-neo-lg text-center ${
            result.accuracy >= 80
              ? 'bg-[#7DD6BF]'
              : result.accuracy >= 50
              ? 'bg-[#F8E54B]'
              : 'bg-[#FF8A8A]'
          }`}>
            <span className="text-xs font-black uppercase tracking-wider text-[#111111] block mb-1">
              Practice Completed
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-[#111111] tracking-tight mb-2">
              {Math.round(result.accuracy)}%
            </h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border-[2px] border-[#111111] text-xs font-black mb-4">
              <span>Status updated to:</span>
              <span>
                {result.new_status === 'STRONG' && '🟢 Strong'}
                {result.new_status === 'LEARNING' && '🟡 Learning'}
                {result.new_status === 'NEEDS_ATTENTION' && '🔴 Needs Attention'}
              </span>
            </div>

            <div className="flex justify-center gap-4 text-xs font-black">
              <span className="bg-white/90 px-3 py-1.5 rounded-xl border border-[#111111]">
                ✓ {result.correct_count} Correct
              </span>
              <span className="bg-white/90 px-3 py-1.5 rounded-xl border border-[#111111]">
                ✗ {result.incorrect_count} Incorrect
              </span>
            </div>
          </div>

          {/* Weakness Diagnostic Card if detected */}
          {result.weakness_detected && (
            <div className="card-pink p-6 border-[3px]">
              <div className="flex items-center gap-2 mb-2 font-black text-sm text-[#111111]">
                <ShieldAlert className="w-5 h-5 text-[#FF6B6B]" />
                <span>We found a learning gap in {result.concept_name}</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-900 leading-relaxed mb-3">
                {result.weakness_reason}
              </p>
              {result.weakness_evidence && (
                <div className="bg-white/90 rounded-xl p-3 border border-[#111111] text-xs font-medium text-gray-800">
                  <strong>Evidence:</strong> {result.weakness_evidence}
                </div>
              )}
            </div>
          )}

          {/* Detailed Question Review Breakdown */}
          <div className="card-neo p-6 bg-white space-y-4">
            <h3 className="text-base font-black text-[#111111]">Question Breakdown & Explanations</h3>
            
            <div className="space-y-3">
              {result.details?.map((detail, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border-[2px] ${
                    detail.is_correct
                      ? 'border-[#7DD6BF] bg-emerald-50/50'
                      : 'border-[#FF8A8A] bg-rose-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-extrabold text-xs text-[#111111]">
                      {idx + 1}. {detail.question_text}
                    </span>
                    <span className="shrink-0 text-xs font-black">
                      {detail.is_correct ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Correct
                        </span>
                      ) : (
                        <span className="text-rose-700 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Incorrect
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="text-xs font-bold space-y-1 mb-2">
                    <p className="text-gray-700">
                      Your answer: <span className="underline">{detail.selected_answer}</span>
                    </p>
                    {!detail.is_correct && (
                      <p className="text-emerald-800">
                        Correct answer: <span>{detail.correct_answer}</span>
                      </p>
                    )}
                  </div>

                  {detail.explanation && (
                    <p className="text-[11px] font-medium text-gray-600 bg-white p-2.5 rounded-xl border border-gray-200">
                      💡 {detail.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={() => {
                setResult(null);
                setSelectedAnswers({});
                setCurrentIndex(0);
              }}
              className="btn-white text-xs w-full sm:w-auto px-5 py-3 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Practice Again</span>
            </button>

            <button
              onClick={() => navigate(targetCourseId ? `/map?courseId=${targetCourseId}` : '/map')}
              className="btn-primary text-xs sm:text-sm w-full sm:w-auto px-7 py-3 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>See Live Updated LearnMap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* Wow-Moment Modal if map changed */}
      {result && (
        <MapChangedModal
          isOpen={showWowModal}
          onClose={() => setShowWowModal(false)}
          conceptName={result.concept_name}
          previousStatus={result.previous_status}
          newStatus={result.new_status}
          incorrectCount={result.incorrect_count}
          accuracy={result.accuracy}
          weaknessReason={result.weakness_reason}
          courseId={concept?.course_id}
          conceptId={concept?.id}
        />
      )}

    </div>
  );
}

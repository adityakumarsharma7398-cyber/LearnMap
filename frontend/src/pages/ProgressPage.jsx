import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sparkles, Trophy, Target, ArrowRight, BarChart3, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { progressService, courseService, getStoredCourseId, setStoredCourseId, demoService } from '../services/api';
import RecommendationCard from '../components/RecommendationCard';

export default function ProgressPage({ currentCourseId: propCourseId, onSelectCourse }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseIdParam = searchParams.get('courseId');

  const [courses, setCourses] = useState([]);
  const [currentCourseId, setCurrentCourseId] = useState(courseIdParam || propCourseId || getStoredCourseId() || '');
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [courseIdParam, propCourseId]);

  const loadProgress = async () => {
    setLoading(true);
    try {
      let courseList = await courseService.getCourses();
      if (!courseList || courseList.length === 0) {
        await demoService.resetDemoSeed();
        courseList = await courseService.getCourses();
      }
      setCourses(courseList || []);

      if (courseList && courseList.length > 0) {
        const preferredId = courseIdParam || propCourseId || getStoredCourseId();
        const matchedCourse = courseList.find((c) => c.id === preferredId) || courseList[0];
        const targetId = matchedCourse.id;

        setCurrentCourseId(targetId);
        setStoredCourseId(targetId);
        if (onSelectCourse) onSelectCourse(targetId);

        if (targetId !== courseIdParam) {
          setSearchParams({ courseId: targetId }, { replace: true });
        }

        const data = await progressService.getProgress(targetId);
        setProgress(data);
      }
    } catch (err) {
      console.error('Error loading progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (id) => {
    setSearchParams({ courseId: id });
    setCurrentCourseId(id);
    setStoredCourseId(id);
    if (onSelectCourse) onSelectCourse(id);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Sparkles className="w-8 h-8 text-[#3346C8] animate-spin" />
          <span className="text-sm font-bold">Calculating mastery progress...</span>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <p className="text-sm font-bold text-gray-700">No progress data available yet.</p>
      </div>
    );
  }

  const masteryPercent = progress.total_concepts > 0
    ? Math.round((progress.strong_count / progress.total_concepts) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Course Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-gray-600 block mb-1">
            Learning Progress & Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111]">
            {progress.course_name}
          </h1>
        </div>

        {courses.length > 1 && (
          <select
            value={currentCourseId}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="px-3 py-2 rounded-xl border-[2px] border-[#111111] bg-white font-bold text-xs shadow-neo-sm"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Prominent Recommendation */}
      <RecommendationCard
        recommendation={progress.next_recommendation}
        courseId={currentCourseId}
      />

      {/* Overall Mastery & Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Mastery Gauge Card */}
        <div className="card-neo p-6 bg-white border-[3px] flex flex-col justify-between">
          <div>
            <span className="text-xs font-black uppercase text-gray-500 block mb-1">
              Curriculum Mastery
            </span>
            <div className="text-4xl font-black text-[#3346C8] mb-2">
              {masteryPercent}%
            </div>
            <p className="text-xs font-medium text-gray-600">
              {progress.strong_count} of {progress.total_concepts} concepts mastered to strong status.
            </p>
          </div>

          <div className="w-full bg-gray-100 h-3 rounded-full border border-[#111111] mt-4 overflow-hidden">
            <div
              className="bg-[#7DD6BF] h-full transition-all duration-500"
              style={{ width: `${masteryPercent}%` }}
            />
          </div>
        </div>

        {/* Status Distribution Breakdown */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card-mint p-4 text-center">
            <span className="text-2xl font-black block">{progress.strong_count}</span>
            <span className="text-[11px] font-extrabold uppercase">🟢 Strong</span>
          </div>

          <div className="card-yellow p-4 text-center">
            <span className="text-2xl font-black block">{progress.learning_count}</span>
            <span className="text-[11px] font-extrabold uppercase">🟡 Learning</span>
          </div>

          <div className="card-pink p-4 text-center">
            <span className="text-2xl font-black block">{progress.needs_attention_count}</span>
            <span className="text-[11px] font-extrabold uppercase">🔴 Attention</span>
          </div>

          <div className="card-neo p-4 bg-white text-center">
            <span className="text-2xl font-black block text-gray-500">{progress.not_started_count}</span>
            <span className="text-[11px] font-extrabold uppercase text-gray-500">⚪ Unstarted</span>
          </div>
        </div>

      </div>

      {/* Concept by Concept Progress Table / Cards */}
      <div className="card-neo p-6 bg-white border-[3px]">
        <h3 className="text-lg font-black text-[#111111] mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#3346C8]" />
          <span>All Concepts in Curriculum</span>
        </h3>

        <div className="divide-y divide-gray-100">
          {progress.concepts?.map((c) => {
            const score = Math.round(c.score || 0);
            return (
              <div
                key={c.id}
                className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-gray-50 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base font-black">
                    {c.status === 'STRONG' && '🟢'}
                    {c.status === 'LEARNING' && '🟡'}
                    {c.status === 'NEEDS_ATTENTION' && '🔴'}
                    {c.status === 'NOT_STARTED' && '⚪'}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#111111]">{c.name}</h4>
                    <p className="text-[11px] text-gray-500 font-medium">
                      {c.attempts_count ? `${c.attempts_count} practice attempts` : 'No attempts recorded'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  {c.attempts_count > 0 ? (
                    <div className="w-28 text-right">
                      <span className="text-xs font-black text-[#111111]">{score}% Accuracy</span>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full border border-gray-300 mt-0.5 overflow-hidden">
                        <div
                          className={`h-full ${score >= 80 ? 'bg-[#7DD6BF]' : score >= 50 ? 'bg-[#F8E54B]' : 'bg-[#FF8A8A]'}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-gray-400">Not Started</span>
                  )}

                  <button
                    onClick={() => navigate(`/practice/${c.id}`)}
                    className="btn-white text-xs px-3 py-1.5 cursor-pointer hover:bg-[#F8E54B]"
                  >
                    Practice
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

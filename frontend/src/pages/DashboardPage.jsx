import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sparkles, BarChart2, BookOpen, AlertTriangle, ArrowRight, Layers, CheckCircle2, Clock } from 'lucide-react';
import { courseService, progressService, conceptService, getStoredCourseId, setStoredCourseId, demoService } from '../services/api';
import RecommendationCard from '../components/RecommendationCard';

export default function DashboardPage({ currentCourseId, onSelectCourse, onOpenCourseModal }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseIdParam = searchParams.get('courseId');

  const [courses, setCourses] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [courseIdParam, currentCourseId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      let courseList = await courseService.getCourses();
      if (!courseList || courseList.length === 0) {
        await demoService.resetDemoSeed();
        courseList = await courseService.getCourses();
      }
      setCourses(courseList || []);

      if (courseList && courseList.length > 0) {
        const preferredId = courseIdParam || currentCourseId || getStoredCourseId();
        const selected = courseList.find((c) => c.id === preferredId) || courseList[0];
        
        setCurrentCourse(selected);
        setStoredCourseId(selected.id);
        if (onSelectCourse) onSelectCourse(selected.id);

        if (selected.id !== courseIdParam) {
          setSearchParams({ courseId: selected.id }, { replace: true });
        }

        // Fetch Progress & Concepts
        const [progressData, conceptsData] = await Promise.all([
          progressService.getProgress(selected.id).catch(() => null),
          conceptService.getCourseConcepts(selected.id).catch(() => [])
        ]);

        setProgress(progressData);
        setConcepts(conceptsData || []);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (id) => {
    setSearchParams({ courseId: id });
    setStoredCourseId(id);
    if (onSelectCourse) onSelectCourse(id);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Sparkles className="w-8 h-8 text-[#3346C8] animate-spin" />
          <span className="text-sm font-bold">Loading your LearnMap dashboard...</span>
        </div>
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="card-neo p-8 bg-white max-w-md mx-auto">
          <BookOpen className="w-12 h-12 text-[#3346C8] mx-auto mb-3" />
          <h2 className="text-2xl font-black text-[#111111] mb-2">No Courses Found</h2>
          <p className="text-xs font-medium text-gray-600 mb-6">
            Get started by creating a course or launching the Data Structures & Algorithms demo.
          </p>
          <button onClick={onOpenCourseModal} className="btn-primary text-xs w-full py-3">
            Create Your First Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header & Course Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-gray-600">Active Course</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
            {currentCourse.name}
          </h1>
        </div>

        {/* Course Switcher */}
        <div className="flex items-center gap-2">
          {courses.length > 1 && (
            <select
              value={currentCourse.id}
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

          <button
            onClick={() => navigate(`/map?courseId=${currentCourse.id}`)}
            className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer shadow-neo-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Map</span>
          </button>
        </div>
      </div>

      {/* Prominent Next-Step Recommendation */}
      <RecommendationCard
        recommendation={progress?.next_recommendation}
        courseId={currentCourse.id}
      />

      {/* Status Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {/* Strong */}
        <div className="card-mint p-5">
          <span className="text-xs font-black uppercase text-[#111111]/80 block mb-1">🟢 Strong</span>
          <div className="text-3xl sm:text-4xl font-black text-[#111111]">
            {progress?.strong_count ?? 0}
          </div>
          <span className="text-[11px] font-bold text-[#111111]/70 mt-1 block">
            Consistent high accuracy
          </span>
        </div>

        {/* Learning */}
        <div className="card-yellow p-5">
          <span className="text-xs font-black uppercase text-[#111111]/80 block mb-1">🟡 Learning</span>
          <div className="text-3xl sm:text-4xl font-black text-[#111111]">
            {progress?.learning_count ?? 0}
          </div>
          <span className="text-[11px] font-bold text-[#111111]/70 mt-1 block">
            Practiced with medium score
          </span>
        </div>

        {/* Needs Attention */}
        <div className="card-pink p-5">
          <span className="text-xs font-black uppercase text-[#111111]/80 block mb-1">🔴 Needs Attention</span>
          <div className="text-3xl sm:text-4xl font-black text-[#111111]">
            {progress?.needs_attention_count ?? 0}
          </div>
          <span className="text-[11px] font-bold text-[#111111]/70 mt-1 block">
            Learning gaps detected
          </span>
        </div>

        {/* Not Started */}
        <div className="card-neo p-5 bg-white">
          <span className="text-xs font-black uppercase text-gray-500 block mb-1">⚪ Not Started</span>
          <div className="text-3xl sm:text-4xl font-black text-[#111111]">
            {progress?.not_started_count ?? 0}
          </div>
          <span className="text-[11px] font-bold text-gray-500 mt-1 block">
            Upcoming on concept path
          </span>
        </div>
      </div>

      {/* Main Content Layout: Active Weaknesses + Concept Journey */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Active Weaknesses Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-[#111111] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#FF6B6B]" />
              <span>Detected Learning Gaps</span>
            </h3>
            <span className="text-xs font-bold text-gray-500">
              {progress?.active_weaknesses?.length || 0} Active
            </span>
          </div>

          {progress?.active_weaknesses && progress.active_weaknesses.length > 0 ? (
            <div className="space-y-3">
              {progress.active_weaknesses.map((w) => (
                <div key={w.id} className="card-neo p-4 bg-white border-[2px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-sm text-[#111111]">
                      {w.concept_name}
                    </span>
                    <span className="badge-status bg-[#FF8A8A] text-[#111111] text-[10px]">
                      {w.severity} Severity
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-700 leading-relaxed mb-3">
                    {w.reason}
                  </p>
                  <button
                    onClick={() => navigate(`/practice/${w.concept_id}`)}
                    className="btn-primary text-xs w-full py-2 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Targeted Practice</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-neo p-6 bg-white text-center">
              <CheckCircle2 className="w-8 h-8 text-[#7DD6BF] mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-700">No active weaknesses detected!</p>
              <p className="text-[11px] text-gray-500 mt-1">Keep practicing to test and reinforce your concepts.</p>
            </div>
          )}
        </div>

        {/* Right Column: Concepts Quick List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-[#111111] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#3346C8]" />
              <span>Concepts in this Subject</span>
            </h3>
            <button
              onClick={() => navigate(`/map?courseId=${currentCourse.id}`)}
              className="text-xs font-black text-[#3346C8] hover:underline cursor-pointer"
            >
              View in React Flow →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {concepts.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/practice/${c.id}`)}
                className="card-neo p-4 bg-white hover:bg-gray-50 transition-all cursor-pointer border-[2px] flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-sm text-[#111111] group-hover:text-[#3346C8]">
                      {c.name}
                    </span>
                    <span className="text-xs font-black">
                      {c.status === 'STRONG' && '🟢'}
                      {c.status === 'LEARNING' && '🟡'}
                      {c.status === 'NEEDS_ATTENTION' && '🔴'}
                      {c.status === 'NOT_STARTED' && '⚪'}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-gray-600 line-clamp-2">
                    {c.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-500">
                  <span>{c.attempts_count || 0} attempts</span>
                  <span className="text-[#3346C8] group-hover:translate-x-1 transition-transform">Practice →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

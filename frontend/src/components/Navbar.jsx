import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, BookOpen, BarChart3, Plus, RefreshCw, UserCheck, Sparkles } from 'lucide-react';
import { demoService } from '../services/api';

export default function Navbar({ currentCourseId, onResetDemo, onOpenCourseModal }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isResetting, setIsResetting] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      const res = await demoService.resetDemoSeed();
      if (onResetDemo) onResetDemo(res.course_id);
      navigate(`/map?courseId=${res.course_id}`);
    } catch (err) {
      console.error("Error resetting demo:", err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b-[2.5px] border-[#111111] px-4 lg:px-8 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-[#3346C8] border-[2px] border-[#111111] flex items-center justify-center text-white shadow-neo-sm group-hover:rotate-6 transition-transform">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-[#111111]">
              Learn<span className="text-[#3346C8]">Map</span>
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-black uppercase bg-[#F8E54B] text-[#111111] rounded-full border border-[#111111]">
              MVP
            </span>
          </div>
        </Link>

        {/* Primary Nav Links */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            to={currentCourseId ? `/dashboard?courseId=${currentCourseId}` : "/dashboard"}
            className={`px-4 py-1.5 rounded-xl font-bold text-sm border-[2px] transition-all ${
              isActive('/dashboard')
                ? 'bg-[#C9B8F5] text-[#111111] border-[#111111] shadow-neo-sm'
                : 'border-transparent text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to={currentCourseId ? `/map?courseId=${currentCourseId}` : "/map"}
            className={`px-4 py-1.5 rounded-xl font-bold text-sm border-[2px] transition-all flex items-center gap-1.5 ${
              isActive('/map')
                ? 'bg-[#F8E54B] text-[#111111] border-[#111111] shadow-neo-sm'
                : 'border-transparent text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#3346C8]" />
            LearnMap
          </Link>
          <Link
            to={currentCourseId ? `/progress?courseId=${currentCourseId}` : "/progress"}
            className={`px-4 py-1.5 rounded-xl font-bold text-sm border-[2px] transition-all flex items-center gap-1.5 ${
              isActive('/progress')
                ? 'bg-[#7DD6BF] text-[#111111] border-[#111111] shadow-neo-sm'
                : 'border-transparent text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Progress
          </Link>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5">
          {/* Demo Reset Button */}
          <button
            onClick={handleResetDemo}
            disabled={isResetting}
            title="Reset to clean DSA Demo with Circular Queue unlearned"
            className="btn-lavender text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset Demo Map</span>
          </button>

          {/* New Course Button */}
          <button
            onClick={onOpenCourseModal}
            className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Course</span>
          </button>

          {/* User Profile Pill */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l-2 border-gray-200">
            <div className="w-8 h-8 rounded-full bg-[#7DD6BF] border-[2px] border-[#111111] flex items-center justify-center font-bold text-xs">
              AR
            </div>
            <span className="text-xs font-bold text-gray-800">Alex R.</span>
          </div>
        </div>

      </div>
    </header>
  );
}

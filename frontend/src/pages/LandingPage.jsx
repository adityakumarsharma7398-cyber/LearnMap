import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles, ArrowRight, Brain, CheckCircle2, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { demoService } from '../services/api';

export default function LandingPage({ onSelectCourse, onOpenCourseModal }) {
  const navigate = useNavigate();

  const handleLaunchDemo = async () => {
    try {
      const res = await demoService.resetDemoSeed();
      if (onSelectCourse) onSelectCourse(res.course_id);
      navigate(`/map?courseId=${res.course_id}`);
    } catch {
      navigate('/map');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9DDEB] flex flex-col justify-between selection:bg-[#3346C8] selection:text-white">
      
      {/* Top Navigation */}
      <nav className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#3346C8] border-[2.5px] border-[#111111] flex items-center justify-center text-white shadow-neo-sm">
            <Compass className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-[#111111]">
            Learn<span className="text-[#3346C8]">Map</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLaunchDemo}
            className="btn-white text-xs px-4 py-2 cursor-pointer hidden sm:flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#3346C8]" />
            <span>Interactive Demo</span>
          </button>
          
          <button
            onClick={onOpenCourseModal || (() => navigate('/map'))}
            className="btn-primary text-xs sm:text-sm px-5 py-2 cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 lg:py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F8E54B] border-[2px] border-[#111111] text-xs font-black shadow-neo-sm">
              <Zap className="w-3.5 h-3.5 text-[#111111]" />
              <span>Next-Gen Visual Knowledge & Diagnostic Engine</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-[#111111] tracking-tight leading-[1.08]">
              See What You Know. <br />
              <span className="text-[#3346C8] underline decoration-[#111111] decoration-wavy decoration-4">
                Discover What to Learn Next.
              </span>
            </h1>

            <p className="text-base sm:text-xl font-medium text-gray-800 max-w-xl leading-relaxed">
              Turn your syllabus and study materials into a living map of connected concepts that <strong>evolves with your learning</strong> and pinpoints your exact knowledge gaps.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleLaunchDemo}
                className="btn-primary text-sm sm:text-base px-7 py-3.5 flex items-center gap-2.5 cursor-pointer shadow-neo-lg hover:scale-105"
              >
                <span>Build My LearnMap</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={handleLaunchDemo}
                className="btn-yellow text-sm sm:text-base px-6 py-3.5 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Try DSA Demo (Circular Queue)</span>
              </button>
            </div>

            {/* Proof Points */}
            <div className="flex items-center gap-6 pt-4 text-xs font-black text-gray-700">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#3346C8]" />
                <span>Auto-extracted concept graphs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#3346C8]" />
                <span>Diagnostic mistake analysis</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Concept Graph Visual Card */}
          <div className="lg:col-span-5">
            <div className="card-neo p-6 bg-white border-[3px] shadow-neo-lg relative">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111] mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF6B6B] border border-[#111111]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#F8E54B] border border-[#111111]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#7DD6BF] border border-[#111111]"></div>
                </div>
                <span className="text-xs font-black uppercase text-gray-500">Live Concept Graph</span>
              </div>

              {/* Connected Nodes Mockup */}
              <div className="space-y-3 py-2">
                {/* Node 1 */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#7DD6BF] border-[2px] border-[#111111] shadow-neo-sm">
                  <div className="font-extrabold text-xs">Arrays</div>
                  <span className="badge-status bg-white text-[10px]">🟢 Strong (92%)</span>
                </div>

                <div className="text-center font-bold text-gray-400 text-xs">↓</div>

                {/* Node 2 */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#7DD6BF] border-[2px] border-[#111111] shadow-neo-sm">
                  <div className="font-extrabold text-xs">Linked Lists</div>
                  <span className="badge-status bg-white text-[10px]">🟢 Strong (88%)</span>
                </div>

                <div className="text-center font-bold text-gray-400 text-xs">↙ ↘</div>

                {/* Branch */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-[#7DD6BF] border-[2px] border-[#111111] shadow-neo-sm">
                    <div className="font-extrabold text-[11px]">Stacks</div>
                    <span className="text-[10px] font-black">🟢 Strong</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F8E54B] border-[2px] border-[#111111] shadow-neo-sm">
                    <div className="font-extrabold text-[11px]">Queues</div>
                    <span className="text-[10px] font-black">🟡 Learning</span>
                  </div>
                </div>

                <div className="text-center font-bold text-gray-400 text-xs">↓</div>

                {/* Highlighted Mistake Node */}
                <div className="p-3 rounded-xl bg-[#FF8A8A] border-[2.5px] border-[#111111] shadow-neo animate-pulse-glow">
                  <div className="flex items-center justify-between">
                    <div className="font-black text-xs text-[#111111]">Circular Queue</div>
                    <span className="badge-status bg-[#111111] text-white text-[10px]">🔴 Needs Attention</span>
                  </div>
                  <p className="text-[10px] font-bold text-gray-900 mt-1">
                    3 mistakes detected on modulo wrapping → Recommendation created!
                  </p>
                </div>
              </div>

              {/* WOW Highlight tag */}
              <div className="mt-4 pt-3 border-t-2 border-gray-100 flex items-center justify-between text-xs">
                <span className="font-black text-[#3346C8]">🔥 The Map Changes With You</span>
                <button
                  onClick={handleLaunchDemo}
                  className="font-extrabold text-[#111111] hover:underline cursor-pointer"
                >
                  Explore →
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Feature Cards Grid (01 - 04) */}
      <section className="max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
            The Continuous Learning Loop
          </h2>
          <p className="text-xs sm:text-sm font-bold text-gray-700 mt-1">
            How LearnMap navigates you from raw syllabus to conceptual mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 01 */}
          <div className="card-lavender p-6 text-left flex flex-col justify-between">
            <div>
              <span className="text-xs font-black text-[#3346C8] uppercase tracking-widest block mb-2">01 — Understand</span>
              <h3 className="text-xl font-black text-[#111111] mb-2">Connect Concepts</h3>
              <p className="text-xs font-medium text-gray-800 leading-relaxed">
                See the entire prerequisite network of your subject instead of isolated pages.
              </p>
            </div>
            <div className="mt-6 text-2xl">🧠</div>
          </div>

          {/* Card 02 */}
          <div className="card-yellow p-6 text-left flex flex-col justify-between">
            <div>
              <span className="text-xs font-black text-gray-800 uppercase tracking-widest block mb-2">02 — Practice</span>
              <h3 className="text-xl font-black text-[#111111] mb-2">Targeted MCQs</h3>
              <p className="text-xs font-medium text-gray-800 leading-relaxed">
                Test what you actually understand through concept-specific diagnostic questions.
              </p>
            </div>
            <div className="mt-6 text-2xl">📝</div>
          </div>

          {/* Card 03 */}
          <div className="card-pink p-6 text-left flex flex-col justify-between">
            <div>
              <span className="text-xs font-black text-[#111111] uppercase tracking-widest block mb-2">03 — Detect</span>
              <h3 className="text-xl font-black text-[#111111] mb-2">Pinpoint Gaps</h3>
              <p className="text-xs font-medium text-gray-800 leading-relaxed">
                Mistakes update the visual node colors and identify underlying prerequisite gaps.
              </p>
            </div>
            <div className="mt-6 text-2xl">🔍</div>
          </div>

          {/* Card 04 */}
          <div className="card-mint p-6 text-left flex flex-col justify-between">
            <div>
              <span className="text-xs font-black text-[#111111] uppercase tracking-widest block mb-2">04 — Improve</span>
              <h3 className="text-xl font-black text-[#111111] mb-2">Next Best Step</h3>
              <p className="text-xs font-medium text-gray-800 leading-relaxed">
                Get ONE clear explainable recommendation explaining exactly what and why to revise next.
              </p>
            </div>
            <div className="mt-6 text-2xl">🎯</div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-[2.5px] border-[#111111] bg-white py-6 px-6 text-center text-xs font-bold text-gray-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>LearnMap © 2026 — Dynamic AI Learning Map Hackathon MVP</span>
          <span>Upload → Map → Learn → Practice → Discover Weakness → Map Changes → Next Step</span>
        </div>
      </footer>

    </div>
  );
}

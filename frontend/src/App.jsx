import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import CourseModal from './components/CourseModal';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import LearnMapPage from './pages/LearnMapPage';
import PracticePage from './pages/PracticePage';
import ProgressPage from './pages/ProgressPage';
import { getStoredCourseId, setStoredCourseId } from './services/api';

function AppContent() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlCourseId = searchParams.get('courseId');

  const [currentCourseId, setCurrentCourseId] = useState(() => {
    return urlCourseId || getStoredCourseId() || null;
  });
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  // Sync state if URL search param courseId changes
  useEffect(() => {
    if (urlCourseId && urlCourseId !== currentCourseId) {
      setCurrentCourseId(urlCourseId);
      setStoredCourseId(urlCourseId);
    }
  }, [urlCourseId]);

  const handleSelectCourse = (courseId) => {
    if (courseId) {
      setCurrentCourseId(courseId);
      setStoredCourseId(courseId);
    }
  };

  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-[#F9DDEB] text-[#111111] flex flex-col">
      {!isLandingPage && (
        <Navbar
          currentCourseId={currentCourseId}
          onResetDemo={handleSelectCourse}
          onOpenCourseModal={() => setIsCourseModalOpen(true)}
        />
      )}

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                onSelectCourse={handleSelectCourse}
                onOpenCourseModal={() => setIsCourseModalOpen(true)}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                currentCourseId={currentCourseId}
                onSelectCourse={handleSelectCourse}
                onOpenCourseModal={() => setIsCourseModalOpen(true)}
              />
            }
          />
          <Route
            path="/map"
            element={
              <LearnMapPage
                currentCourseId={currentCourseId}
                onSelectCourse={handleSelectCourse}
                onOpenCourseModal={() => setIsCourseModalOpen(true)}
              />
            }
          />
          <Route path="/practice/:conceptId" element={<PracticePage />} />
          <Route
            path="/progress"
            element={
              <ProgressPage
                currentCourseId={currentCourseId}
                onSelectCourse={handleSelectCourse}
              />
            }
          />
        </Routes>
      </main>

      {/* Global New Course Modal */}
      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onCourseCreated={(courseId) => {
          handleSelectCourse(courseId);
          window.location.href = `/map?courseId=${courseId}`;
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

import React, { useState } from 'react';
import { X, Upload, BookPlus, Sparkles, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { courseService, materialService } from '../services/api';

export default function CourseModal({ isOpen, onClose, onCourseCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [syllabusText, setSyllabusText] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(''); // 'uploading' | 'extracting' | 'generating' | 'building'
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!name) {
        // Auto-suggest name from filename without extension
        const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setName(cleanName);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Course name is required');
      return;
    }

    if (!file && !syllabusText.trim()) {
      setError('Please upload a PDF notes file or enter syllabus topics.');
      return;
    }

    setIsLoading(true);
    setError('');
    setLoadingStep(file ? 'uploading' : 'generating');

    try {
      // Step 1: Create Course
      const course = await courseService.createCourse({
        name: name.trim(),
        description: description || `Curriculum for ${name}`,
        syllabus_text: syllabusText || undefined
      });

      // Step 2: If file attached, upload material and trigger extraction
      if (file && course.id) {
        setLoadingStep('extracting');
        const formData = new FormData();
        formData.append('title', file.name);
        formData.append('file', file);
        formData.append('type', 'PDF');
        
        setLoadingStep('generating');
        await materialService.uploadMaterial(course.id, formData);
      }

      setLoadingStep('building');
      
      // Short delay for UI smoothness
      setTimeout(() => {
        if (onCourseCreated) {
          onCourseCreated(course.id);
        }
        setIsLoading(false);
        setLoadingStep('');
        onClose();
      }, 400);

    } catch (err) {
      console.error('Error creating course:', err);
      setIsLoading(false);
      setLoadingStep('');
      setError(err.response?.data?.detail || 'Failed to extract concepts from PDF. Please check that the file has readable text.');
    }
  };

  const handleSampleFill = () => {
    setName('Machine Learning Foundations');
    setDescription('Core mathematical intuition, supervised models, neural architectures, and optimization algorithms.');
    setSyllabusText(`1. Linear Regression & Gradient Descent
2. Logistic Regression & Classification
3. Support Vector Machines
4. Decision Trees & Random Forests
5. Artificial Neural Networks
6. Backpropagation & Activation Functions
7. Convolutional Neural Networks (CNN)
8. Transformers & Attention Mechanisms`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border-[3px] border-[#111111] shadow-neo-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close */}
        {!isLoading && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl border-[2px] border-[#111111] bg-gray-100 hover:bg-gray-200 shadow-neo-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 mb-2">
          <span className="badge-status bg-[#F8E54B] text-[#111111]">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            AI Knowledge Graph Generator
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight mb-2">
          Create New Course
        </h2>
        
        <p className="text-xs sm:text-sm font-medium text-gray-600 mb-5">
          Upload lecture notes or paste syllabus. LearnMap will extract actual concepts and build your visual learning graph.
        </p>

        {error && (
          <div className="bg-[#FF8A8A] text-[#111111] border-[2px] border-[#111111] rounded-xl p-3.5 text-xs font-bold mb-4 shadow-neo-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Dynamic Loading Step Box */}
        {isLoading && (
          <div className="card-lavender p-5 mb-5 space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-[#3346C8] animate-spin shrink-0" />
              <div className="text-sm font-black text-[#111111]">
                {loadingStep === 'uploading' && 'Uploading document...'}
                {loadingStep === 'extracting' && 'Extracting text from PDF...'}
                {loadingStep === 'generating' && 'Extracting concepts and dependency graph...'}
                {loadingStep === 'building' && 'Building visual LearnMap...'}
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#111111]/20 text-xs font-bold text-gray-700">
              <div className={`flex items-center gap-2 ${loadingStep === 'uploading' ? 'text-[#3346C8]' : 'text-gray-500'}`}>
                <span>{loadingStep === 'uploading' ? '⏳' : '✓'}</span>
                <span>1. Upload PDF</span>
              </div>
              <div className={`flex items-center gap-2 ${loadingStep === 'extracting' ? 'text-[#3346C8]' : loadingStep === 'generating' || loadingStep === 'building' ? 'text-gray-900' : 'text-gray-400'}`}>
                <span>{loadingStep === 'extracting' ? '⏳' : (loadingStep === 'generating' || loadingStep === 'building' ? '✓' : '○')}</span>
                <span>2. Extract text</span>
              </div>
              <div className={`flex items-center gap-2 ${loadingStep === 'generating' ? 'text-[#3346C8]' : loadingStep === 'building' ? 'text-gray-900' : 'text-gray-400'}`}>
                <span>{loadingStep === 'generating' ? '⏳' : (loadingStep === 'building' ? '✓' : '○')}</span>
                <span>3. Generate concepts & prerequisites</span>
              </div>
              <div className={`flex items-center gap-2 ${loadingStep === 'building' ? 'text-[#3346C8]' : 'text-gray-400'}`}>
                <span>{loadingStep === 'building' ? '⏳' : '○'}</span>
                <span>4. Render LearnMap</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-[#111111] mb-1">
              Course Title *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Operating Systems & Concurrency"
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-xl border-[2px] border-[#111111] focus:ring-2 focus:ring-[#3346C8] font-medium text-sm disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#111111] mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Semester core curriculum"
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-xl border-[2px] border-[#111111] focus:ring-2 focus:ring-[#3346C8] font-medium text-sm disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#111111] mb-1">
              Upload PDF Lecture Notes / Book (Recommended)
            </label>
            <div className={`card-neo p-4 border-dashed border-2 border-gray-400 bg-gray-50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition-colors ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
              <input
                type="file"
                accept=".pdf,.txt,.md"
                onChange={handleFileChange}
                disabled={isLoading}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-500 mb-1" />
                <span className="text-xs font-bold text-[#3346C8]">
                  {file ? file.name : 'Click to select PDF or lecture notes'}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5">PDF, TXT, or MD up to 25MB</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-black uppercase text-[#111111]">
                Or Paste Syllabus / Topic Outline (Text)
              </label>
              {!isLoading && (
                <button
                  type="button"
                  onClick={handleSampleFill}
                  className="text-[11px] font-bold text-[#3346C8] hover:underline cursor-pointer"
                >
                  + Fill ML Sample
                </button>
              )}
            </div>
            <textarea
              rows={3}
              value={syllabusText}
              onChange={(e) => setSyllabusText(e.target.value)}
              placeholder="Paste course modules, chapter outlines, or bullet points here..."
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-xl border-[2px] border-[#111111] focus:ring-2 focus:ring-[#3346C8] font-medium text-xs font-mono disabled:bg-gray-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-white text-xs px-4 py-2.5 cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary text-xs px-6 py-2.5 flex items-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <BookPlus className="w-4 h-4" />
                  <span>Build My LearnMap →</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

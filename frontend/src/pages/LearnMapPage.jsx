import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Search,
  Filter,
  Maximize2,
  Sparkles,
  RefreshCw,
  Plus,
  BookOpen,
  HelpCircle,
  Flame
} from 'lucide-react';
import { conceptService, courseService, getStoredCourseId, setStoredCourseId, demoService } from '../services/api';
import ConceptNode from '../components/ConceptNode';
import ConceptModal from '../components/ConceptModal';

const nodeTypes = {
  customConcept: ConceptNode,
};

export default function LearnMapPage({ currentCourseId: propCourseId, onSelectCourse, onOpenCourseModal }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseIdParam = searchParams.get('courseId');

  const [courses, setCourses] = useState([]);
  const [currentCourseId, setCurrentCourseId] = useState(courseIdParam || propCourseId || getStoredCourseId() || '');
  const [courseName, setCourseName] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [stats, setStats] = useState({ total: 0, strong: 0, learning: 0, needs_attention: 0, not_started: 0 });
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCoursesAndMap();
  }, [courseIdParam, propCourseId]);

  const loadCoursesAndMap = async () => {
    setIsLoading(true);
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

        await fetchMap(targetId);
      }
    } catch (err) {
      console.error('Error loading map:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMap = async (courseId) => {
    try {
      const mapData = await conceptService.getLearnMap(courseId);
      setCourseName(mapData.course_name);
      setStats(mapData.stats || { total: 0, strong: 0, learning: 0, needs_attention: 0, not_started: 0 });

      // Transform edges to have black styled arrow markers
      const styledEdges = (mapData.edges || []).map((edge) => ({
        ...edge,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: '#111111',
        },
        style: {
          stroke: '#111111',
          strokeWidth: 2.5,
        },
      }));

      setNodes(mapData.nodes || []);
      setEdges(styledEdges);
    } catch (err) {
      console.error('Error fetching concept map data:', err);
    }
  };

  // Node Click handler -> fetch full concept details & open modal
  const onNodeClick = useCallback(async (_, node) => {
    try {
      const detail = await conceptService.getConceptDetail(node.id);
      setSelectedConcept(detail);
    } catch (err) {
      console.error('Error fetching concept detail:', err);
    }
  }, []);

  const handleCourseChange = (id) => {
    setSearchParams({ courseId: id });
    setCurrentCourseId(id);
    setStoredCourseId(id);
    if (onSelectCourse) onSelectCourse(id);
    fetchMap(id);
  };

  // Filter nodes by search query and status pill
  const filteredNodes = useMemo(() => {
    return nodes.map((node) => {
      const labelMatch = !searchQuery || node.data.label.toLowerCase().includes(searchQuery.toLowerCase());
      const statusMatch = filterStatus === 'ALL' || node.data.status === filterStatus;
      const isVisible = labelMatch && statusMatch;

      return {
        ...node,
        style: {
          ...node.style,
          opacity: isVisible ? 1 : 0.2,
          transition: 'opacity 0.2s ease',
        },
      };
    });
  }, [nodes, searchQuery, filterStatus]);

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] bg-[#F9DDEB] relative overflow-hidden">
      
      {/* Top Header Controls Bar */}
      <div className="bg-white border-b-[2.5px] border-[#111111] px-4 py-3 z-10 shadow-sm flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Course info & selector */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F8E54B] border-[2px] border-[#111111] flex items-center justify-center font-black text-xs shadow-neo-sm">
            <Sparkles className="w-4 h-4 text-[#3346C8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Live Concept Graph</span>
            </div>
            {courses.length > 1 ? (
              <select
                value={currentCourseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="font-black text-sm text-[#111111] bg-transparent border-b-2 border-[#111111] cursor-pointer pr-4 focus:outline-none"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <h2 className="font-black text-sm text-[#111111]">{courseName || 'Data Structures & Algorithms'}</h2>
            )}
          </div>
        </div>

        {/* Center: Search & Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts..."
              className="pl-8 pr-3 py-1.5 rounded-xl border-[2px] border-[#111111] text-xs font-bold bg-gray-50 focus:bg-white focus:outline-none w-36 sm:w-48"
            />
          </div>

          {/* Status Filters */}
          <div className="hidden lg:flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-[#111111]">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                filterStatus === 'ALL' ? 'bg-[#111111] text-white shadow-neo-sm' : 'text-gray-700 hover:text-black'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilterStatus('STRONG')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                filterStatus === 'STRONG' ? 'bg-[#7DD6BF] text-[#111111] border border-[#111111]' : 'text-gray-700 hover:text-black'
              }`}
            >
              🟢 Strong ({stats.strong})
            </button>
            <button
              onClick={() => setFilterStatus('LEARNING')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                filterStatus === 'LEARNING' ? 'bg-[#F8E54B] text-[#111111] border border-[#111111]' : 'text-gray-700 hover:text-black'
              }`}
            >
              🟡 Learning ({stats.learning})
            </button>
            <button
              onClick={() => setFilterStatus('NEEDS_ATTENTION')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                filterStatus === 'NEEDS_ATTENTION' ? 'bg-[#FF8A8A] text-[#111111] border border-[#111111]' : 'text-gray-700 hover:text-black'
              }`}
            >
              🔴 Attention ({stats.needs_attention})
            </button>
          </div>
        </div>

        {/* Right: Quick Refresh & Add */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => currentCourseId && fetchMap(currentCourseId)}
            className="p-2 rounded-xl border-[2px] border-[#111111] bg-white hover:bg-gray-50 shadow-neo-sm cursor-pointer"
            title="Refresh map nodes"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={onOpenCourseModal}
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Course</span>
          </button>
        </div>

      </div>

      {/* Main React Flow Graph Canvas */}
      <div className="flex-1 w-full h-full relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-20">
            <div className="flex flex-col items-center gap-2">
              <Sparkles className="w-8 h-8 text-[#3346C8] animate-spin" />
              <span className="text-xs font-bold text-gray-800">Building visual graph...</span>
            </div>
          </div>
        ) : null}

        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          minZoom={0.4}
          maxZoom={1.8}
        >
          <Background color="#111111" gap={24} size={1.2} style={{ opacity: 0.15 }} />
          <Controls
            className="!bg-white !border-[2.5px] !border-[#111111] !rounded-2xl !shadow-neo !p-1"
            showInteractive={false}
          />
        </ReactFlow>

        {/* Floating Instruction / Wow Tag */}
        <div className="absolute bottom-5 left-5 z-10 card-neo p-3 bg-white/90 backdrop-blur-xs max-w-xs border-[2px] hidden sm:block">
          <div className="flex items-center gap-2 font-black text-xs text-[#111111] mb-1">
            <Flame className="w-4 h-4 text-[#FF6B6B]" />
            <span>How to test the Live Demo:</span>
          </div>
          <p className="text-[11px] font-medium text-gray-700 leading-tight">
            Click <strong>Circular Queue (⚪)</strong> → Learn → Practice → Make 3 mistakes. Watch it turn <strong>🔴 Needs Attention</strong> and generate an instant recommendation!
          </p>
        </div>

      </div>

      {/* Concept Detail Modal */}
      {selectedConcept && (
        <ConceptModal
          concept={selectedConcept}
          onClose={() => setSelectedConcept(null)}
          onSelectConcept={async (conceptId) => {
            const detail = await conceptService.getConceptDetail(conceptId);
            setSelectedConcept(detail);
          }}
        />
      )}

    </div>
  );
}

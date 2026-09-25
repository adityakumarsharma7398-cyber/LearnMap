import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { CheckCircle2, AlertCircle, Clock, Sparkles, BookOpen } from 'lucide-react';

const statusConfig = {
  STRONG: {
    bg: 'bg-[#7DD6BF]',
    badgeBg: 'bg-white',
    badgeText: 'text-[#111111]',
    label: 'Strong',
    icon: CheckCircle2,
    emoji: '🟢',
    borderColor: 'border-[#111111]'
  },
  LEARNING: {
    bg: 'bg-[#F8E54B]',
    badgeBg: 'bg-white',
    badgeText: 'text-[#111111]',
    label: 'Learning',
    icon: Clock,
    emoji: '🟡',
    borderColor: 'border-[#111111]'
  },
  NEEDS_ATTENTION: {
    bg: 'bg-[#FF8A8A]',
    badgeBg: 'bg-[#111111]',
    badgeText: 'text-white',
    label: 'Needs Attention',
    icon: AlertCircle,
    emoji: '🔴',
    borderColor: 'border-[#111111]',
    extraClass: 'animate-pulse-glow ring-2 ring-red-500'
  },
  NOT_STARTED: {
    bg: 'bg-white',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-700',
    label: 'Not Started',
    icon: BookOpen,
    emoji: '⚪',
    borderColor: 'border-[#111111]'
  }
};

function ConceptNode({ data, selected }) {
  const status = data.status || 'NOT_STARTED';
  const config = statusConfig[status] || statusConfig.NOT_STARTED;
  const Icon = config.icon;

  return (
    <div
      className={`relative min-w-[200px] max-w-[240px] rounded-2xl border-[2.5px] ${config.borderColor} ${config.bg} p-3.5 shadow-neo transition-all duration-200 hover:-translate-y-1 hover:shadow-neo-lg cursor-pointer ${
        selected ? 'ring-4 ring-[#3346C8] scale-105' : ''
      } ${config.extraClass || ''}`}
    >
      {/* Top Handle for prerequisites incoming */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[#111111] !border-2 !border-white"
      />

      {/* Header with status badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-black tracking-wide uppercase px-2 py-0.5 rounded-full border-[1.5px] border-[#111111] flex items-center gap-1 bg-white">
          <span>{config.emoji}</span>
          <span className="truncate">{config.label}</span>
        </span>
        
        {data.attempts_count > 0 && (
          <span className="text-[11px] font-bold text-[#111111] bg-white/80 px-1.5 py-0.5 rounded-md border border-[#111111]">
            {data.attempts_count} att.
          </span>
        )}
      </div>

      {/* Concept Name */}
      <div className="font-extrabold text-sm text-[#111111] leading-tight mb-1.5">
        {data.label}
      </div>

      {/* Short description or accuracy */}
      {data.attempts_count > 0 ? (
        <div className="mt-2 pt-2 border-t-[1.5px] border-[#111111]/20">
          <div className="flex justify-between text-[11px] font-bold mb-1">
            <span>Accuracy</span>
            <span>{Math.round(data.accuracy || 0)}%</span>
          </div>
          <div className="w-full bg-white/70 h-2 rounded-full border border-[#111111] overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                status === 'STRONG' ? 'bg-[#3346C8]' : status === 'LEARNING' ? 'bg-[#111111]' : 'bg-[#FF6B6B]'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, data.accuracy || 0))}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="text-[11px] font-medium text-gray-700 line-clamp-2 mt-1">
          {data.description || 'Click to explore explanation and practice.'}
        </p>
      )}

      {/* Bottom Handle for outgoing dependent concepts */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[#111111] !border-2 !border-white"
      />
    </div>
  );
}

export default memo(ConceptNode);

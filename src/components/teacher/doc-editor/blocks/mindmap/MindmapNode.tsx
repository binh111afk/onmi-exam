import React, { useEffect, useRef } from 'react';
import {
  BookOpen,
  Brain,
  ChevronDown,
  ChevronRight,
  FileText,
  Lightbulb,
  Pin,
  Settings,
  Star,
  TriangleAlert,
} from 'lucide-react';
import type { MindmapNode as MindmapNodeData } from './MindmapTypes';
import { getNodeMetrics, MINDMAP_DEFAULT_ROOT_TITLE } from './MindmapUtils';

interface MindmapNodeProps {
  node: MindmapNodeData;
  isRoot: boolean;
  isSelected: boolean;
  isEditing: boolean;
  isReadOnly: boolean;
  onSelect: (nodeId: string) => void;
  onStartEdit: (nodeId: string) => void;
  onStopEdit: () => void;
  onUpdateTitle: (nodeId: string, title: string) => void;
  onToggleCollapse: (nodeId: string) => void;
  onOpenNote: (nodeId: string) => void;
  onPointerDown: (event: React.PointerEvent, nodeId: string) => void;
}

const LUCIDE_ICON_MAP = {
  book: BookOpen,
  brain: Brain,
  settings: Settings,
  pin: Pin,
  star: Star,
  warning: TriangleAlert,
  idea: Lightbulb,
};

const renderNodeIcon = (icon?: string) => {
  if (!icon) return null;
  if (icon.startsWith('lucide:')) {
    const key = icon.replace('lucide:', '') as keyof typeof LUCIDE_ICON_MAP;
    const Icon = LUCIDE_ICON_MAP[key];
    return Icon ? <Icon size={14} className="shrink-0 stroke-[2.5]" /> : null;
  }

  return <span className="shrink-0 text-sm leading-none">{icon}</span>;
};

const MindmapNodeComponent: React.FC<MindmapNodeProps> = ({
  node,
  isRoot,
  isSelected,
  isEditing,
  isReadOnly,
  onSelect,
  onStartEdit,
  onStopEdit,
  onUpdateTitle,
  onToggleCollapse,
  onOpenNote,
  onPointerDown,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const metrics = getNodeMetrics(node, isRoot);
  const x = node.position.x - metrics.width / 2;
  const y = node.position.y - metrics.height / 2;

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const title = node.title || (isRoot ? MINDMAP_DEFAULT_ROOT_TITLE : 'Nhánh mới');

  return (
    <g
      transform={`translate(${x} ${y})`}
      className="transition-transform duration-200 ease-out"
      onPointerDown={(event) => {
        onSelect(node.id);
        if (!isReadOnly) onPointerDown(event, node.id);
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        if (!isReadOnly) onStartEdit(node.id);
      }}
    >
      {isRoot && (
        <rect
          x="-3"
          y="-3"
          width={metrics.width + 6}
          height={metrics.height + 6}
          rx="24"
          fill="url(#mindmapRootGlow)"
          opacity="0.38"
        />
      )}
      <rect
        width={metrics.width}
        height={metrics.height}
        rx={isRoot ? 22 : 18}
        fill={isRoot ? 'url(#mindmapRootGradient)' : '#FFFFFF'}
        stroke={isSelected ? node.color : '#E2E8F0'}
        strokeWidth={isSelected ? 2.5 : 1}
        className="transition-all duration-200"
        filter={isRoot ? 'url(#mindmapRootShadow)' : isSelected ? 'url(#mindmapSelectedShadow)' : 'url(#mindmapNodeShadow)'}
      />
      {!isRoot && (
        <rect
          x="0"
          y="0"
          width="6"
          height={metrics.height}
          rx="3"
          fill={node.color}
          opacity="0.95"
        />
      )}

      <foreignObject x="12" y="8" width={metrics.width - 24} height={metrics.height - 16}>
        <div className="flex h-full items-center gap-2 overflow-hidden">
          <div className={`${isRoot ? 'text-white' : 'text-slate-600'} flex shrink-0 items-center`}>
            {renderNodeIcon(node.icon)}
          </div>
          {isEditing && !isReadOnly ? (
            <textarea
              ref={textareaRef}
              value={node.title}
              onPointerDown={(event) => event.stopPropagation()}
              onChange={(event) => onUpdateTitle(node.id, event.target.value)}
              onBlur={onStopEdit}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  onStopEdit();
                }
                if ((event.key === 'Enter' && !event.shiftKey) || event.key === 'Tab') {
                  event.preventDefault();
                  onStopEdit();
                }
              }}
              className={`h-full w-full resize-none border-0 bg-transparent p-0 text-center outline-none ${isRoot ? 'text-sm font-black text-white placeholder:text-white/70' : 'text-xs font-black text-slate-800 placeholder:text-slate-400'}`}
              placeholder={isRoot ? MINDMAP_DEFAULT_ROOT_TITLE : 'Nhánh mới'}
            />
          ) : (
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => onSelect(node.id)}
              onDoubleClick={() => !isReadOnly && onStartEdit(node.id)}
              className={`min-w-0 flex-1 whitespace-pre-line break-words text-center leading-snug transition ${isRoot ? 'text-sm font-black text-white' : 'text-xs font-black text-slate-800'} ${isReadOnly ? 'cursor-default' : 'cursor-text'}`}
            >
              {title}
            </button>
          )}
        </div>
      </foreignObject>

      {node.children.length > 0 && (
        <g
          transform={`translate(${metrics.width - 8} ${metrics.height / 2})`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onToggleCollapse(node.id)}
          className="cursor-pointer"
        >
          <circle r="10" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" filter="url(#mindmapNodeShadow)" />
          <foreignObject x="-7" y="-7" width="14" height="14">
            <div className="flex h-full w-full items-center justify-center text-slate-500">
              {node.collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            </div>
          </foreignObject>
        </g>
      )}

      {node.note && (
        <g
          transform={`translate(${metrics.width - 20} -3)`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onOpenNote(node.id)}
          className="cursor-pointer"
        >
          <circle r="9" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <foreignObject x="-6" y="-6" width="12" height="12">
            <div className="flex h-full w-full items-center justify-center text-primary">
              <FileText size={10} className="stroke-[2.7]" />
            </div>
          </foreignObject>
        </g>
      )}
    </g>
  );
};

export const MindmapNode = React.memo(MindmapNodeComponent);


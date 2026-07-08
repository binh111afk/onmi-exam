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
import { getNodeMetrics, hexToRgba } from './MindmapUtils';

interface MindmapNodeProps {
  node: MindmapNodeData;
  isRoot: boolean;
  level: number; // 0 = root, 1 = child, 2+ = leaf
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
  onNodeContextMenu: (event: React.MouseEvent, nodeId: string) => void;
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
    return Icon ? <Icon size={12} className="shrink-0 stroke-[2.5]" /> : null;
  }

  return <span className="shrink-0 text-xs leading-none">{icon}</span>;
};

const MindmapNodeComponent: React.FC<MindmapNodeProps> = ({
  node,
  isRoot,
  level,
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
  onNodeContextMenu,
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

  const hasTitle = node.title.trim().length > 0;
  const title = hasTitle ? node.title : (isRoot ? 'Nhập chủ đề...' : 'Nhập nhánh...');

  return (
    <g
      transform={`translate(${x} ${y})`}
      className="transition-transform duration-200 ease-out cursor-pointer"
      onPointerDown={(event) => {
        onSelect(node.id);
        if (!isReadOnly) onPointerDown(event, node.id);
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        if (!isReadOnly) onStartEdit(node.id);
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onSelect(node.id);
        if (!isReadOnly) onNodeContextMenu(event, node.id);
      }}
    >
      {/* Selection outline indicator */}
      {isSelected && (
        <rect
          x="-3"
          y="-3"
          width={metrics.width + 6}
          height={metrics.height + 6}
          rx="10"
          fill="none"
          stroke={node.color}
          strokeWidth="1.5"
        />
      )}

      {/* Main node container */}
      <rect
        width={metrics.width}
        height={metrics.height}
        rx="8"
        fill={hexToRgba(node.color, 0.08)}
        stroke={isSelected ? node.color : hexToRgba(node.color, 0.3)}
        strokeWidth={isSelected ? 1.5 : 1}
        className="transition-all duration-200"
      />

      {/* Node accent border left */}
      {!isRoot && (
        <rect
          x="0"
          y="0"
          width="4"
          height={metrics.height}
          rx="2"
          fill={node.color}
          opacity="0.95"
        />
      )}

      <foreignObject x="12" y="8" width={metrics.width - 24} height={metrics.height - 16}>
        <div className="flex h-full items-center gap-2 overflow-hidden select-none">
          <div className="text-slate-500 flex shrink-0 items-center">
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
              className={`h-full w-full resize-none border-0 bg-transparent p-0 text-center outline-none ${
                isRoot
                  ? 'text-sm font-bold text-slate-800 placeholder:text-slate-400'
                  : level === 1
                    ? 'text-xs font-semibold text-slate-700 placeholder:text-slate-400'
                    : 'text-[11px] font-medium text-slate-600 placeholder:text-slate-400'
              }`}
              placeholder={isRoot ? 'Nhập chủ đề...' : 'Nhập nhánh...'}
            />
          ) : (
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => onSelect(node.id)}
              onDoubleClick={() => !isReadOnly && onStartEdit(node.id)}
              className={`min-w-0 flex-1 whitespace-pre-line break-words text-center leading-snug transition cursor-pointer ${
                isRoot
                  ? 'text-sm font-bold'
                  : level === 1
                    ? 'text-xs font-semibold'
                    : 'text-[11px]'
              } ${
                hasTitle
                  ? isRoot
                    ? 'text-slate-800'
                    : 'text-slate-700'
                  : 'text-slate-400 font-normal italic'
              } ${isReadOnly ? 'cursor-default' : 'cursor-text'}`}
            >
              {title}
            </button>
          )}
        </div>
      </foreignObject>

      {/* Collapse/Expand toggle handle */}
      {node.children.length > 0 && (
        <g
          transform={`translate(${metrics.width - 8} ${metrics.height / 2})`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onToggleCollapse(node.id)}
          className="cursor-pointer"
        >
          <circle r="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <foreignObject x="-6" y="-6" width="12" height="12">
            <div className="flex h-full w-full items-center justify-center text-slate-500">
              {node.collapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
            </div>
          </foreignObject>
        </g>
      )}

      {/* Note indicator icon */}
      {node.note && (
        <g
          transform={`translate(${metrics.width - 18} -2)`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onOpenNote(node.id)}
          className="cursor-pointer"
        >
          <circle r="7" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.75" />
          <foreignObject x="-5" y="-5" width="10" height="10">
            <div className="flex h-full w-full items-center justify-center text-primary">
              <FileText size={8} className="stroke-[2.5]" />
            </div>
          </foreignObject>
        </g>
      )}
    </g>
  );
};

export const MindmapNode = React.memo(MindmapNodeComponent);


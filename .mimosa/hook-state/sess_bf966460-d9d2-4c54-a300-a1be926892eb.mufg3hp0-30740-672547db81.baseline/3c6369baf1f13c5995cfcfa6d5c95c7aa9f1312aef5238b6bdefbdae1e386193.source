import type { LucideIcon } from 'lucide-react';

export interface MindmapNode {
  id: string;
  parentId: string | null;
  title: string;
  color: string;
  collapsed: boolean;
  icon?: string;
  note?: string;
  children: string[];
  position: {
    x: number;
    y: number;
  };
}

export interface MindmapData {
  rootId: string;
  nodes: Record<string, MindmapNode>;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export type MindmapLayout = 'horizontal' | 'vertical' | 'radial' | 'fishbone';

export type MindmapMode = 'editor' | 'preview';

export interface MindmapBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface MindmapNodeMetrics {
  width: number;
  height: number;
}

export interface MindmapClipboard {
  rootId: string;
  nodes: Record<string, MindmapNode>;
}

export interface MindmapIconOption {
  id: string;
  label: string;
  type: 'emoji' | 'lucide';
  icon?: LucideIcon;
}


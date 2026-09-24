import { z } from 'zod';
import { createDefaultMindmapData } from './MindmapUtils';
import type { MindmapData } from './MindmapTypes';

export const MindmapNodeSchema = z.object({
  id: z.string().min(1),
  parentId: z.string().nullable(),
  title: z.string(),
  color: z.string(),
  collapsed: z.boolean(),
  icon: z.string().optional(),
  note: z.string().optional(),
  children: z.array(z.string()),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export const MindmapDataSchema = z.object({
  rootId: z.string().min(1),
  nodes: z.record(z.string(), MindmapNodeSchema),
  zoom: z.number(),
  offsetX: z.number(),
  offsetY: z.number(),
});

export const normalizeMindmapData = (input: unknown): MindmapData => {
  const parsed = MindmapDataSchema.safeParse(input);
  if (!parsed.success || !parsed.data.nodes[parsed.data.rootId]) {
    return createDefaultMindmapData();
  }

  return parsed.data;
};


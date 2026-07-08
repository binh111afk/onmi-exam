import type { DiagramContent, DiagramNode } from './DiagramTypes';

export const createNewDiagramContent = (): DiagramContent => {
  return {
    version: 1,
    nodes: [
      { id: crypto.randomUUID(), title: '', description: '', color: '#8b5cf6' },
      { id: crypto.randomUUID(), title: '', description: '', color: '#6366f1' },
      { id: crypto.randomUUID(), title: '', description: '', color: '#3b82f6' }
    ],
    settings: {
      layout: 'horizontal',
      arrowStyle: 'straight',
      themeColor: '#6366f1'
    }
  };
};

export const createDefaultNode = (id: string): DiagramNode => ({
  id,
  title: '',
  description: '',
  color: '#6366f1'
});

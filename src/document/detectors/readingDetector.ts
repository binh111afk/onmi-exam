import type { DocumentLayoutNode } from '../../types/document-layout';

export interface ReadingGroupCandidate {
  passageNodeIds: string[];
  questionNodeIds: string[];
  explanationNodeIds: string[];
  confidence: number;
}

export class ReadingDetector {
  detect(nodes: DocumentLayoutNode[]): ReadingGroupCandidate[] {
    const groups: ReadingGroupCandidate[] = [];
    let current: ReadingGroupCandidate | null = null;

    nodes.sort((first, second) => first.readingOrder - second.readingOrder).forEach((node) => {
      if (node.type === 'reading-candidate') {
        if (current) groups.push(current);
        current = { passageNodeIds: [node.id], questionNodeIds: [], explanationNodeIds: [], confidence: node.confidence };
        return;
      }
      if (!current) return;
      if (node.type === 'paragraph' || node.type === 'caption' || node.type === 'formula' || node.type === 'image') {
        current.passageNodeIds.push(node.id);
      } else if (node.type === 'question-candidate') {
        current.questionNodeIds.push(node.id);
      } else if (node.type === 'explanation-candidate') {
        current.explanationNodeIds.push(node.id);
      } else if (node.type === 'heading') {
        groups.push(current);
        current = null;
      }
    });

    if (current) groups.push(current);
    return groups.filter((group) => group.questionNodeIds.length > 0);
  }
}

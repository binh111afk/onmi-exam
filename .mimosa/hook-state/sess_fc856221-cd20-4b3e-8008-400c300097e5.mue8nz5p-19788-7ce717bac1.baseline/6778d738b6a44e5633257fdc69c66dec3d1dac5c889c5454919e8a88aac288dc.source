/**
 * DocumentReconstructor — Stage 0.5 of the Compiler Pipeline.
 *
 * Placed between LayoutAnalyzer/DocumentNormalizer and Tokenizer.
 * Performs Text & Layout Reconstruction (Whitespace Recovery, Line Merge,
 * Option Reconstruction, Formula/Superscript Recovery, Math Inline Merge, Reading Boundary Hinting).
 *
 * RULES:
 * - Pure data reconstruction function.
 * - Does NOT parse or create Question, Group, or OML objects.
 */
import type { DocumentLayout, DocumentLayoutNode } from '../../../types/document-layout.ts';
import type { RawDocument, RawDocumentNode } from '../../../types/raw-document.ts';
import {
  isLoneOptionLabel,
  isNoise,
  isOptionStart,
  isQuestionStart,
  isReadingTrigger,
  isSectionHeading,
  recoverInlineMath,
  recoverWhitespace,
  tryRecoverSuperscriptOrSubscript,
} from './reconstructionRules.ts';

export interface ReconstructionSummary {
  whitespaceMergedCount: number;
  paragraphMergedCount: number;
  formulaRecoveredCount: number;
  superscriptRecoveredCount: number;
  optionRecoveredCount: number;
  inlineMathMergedCount: number;
  readingHintsAddedCount: number;
  averageConfidence: number;
}

export interface ReconstructionResult {
  rawDocument: RawDocument;
  layout: DocumentLayout;
  summary: ReconstructionSummary;
}

export class DocumentReconstructor {
  reconstruct(rawDocument: RawDocument, layout: DocumentLayout): ReconstructionResult {
    let whitespaceMergedCount = 0;
    let paragraphMergedCount = 0;
    let formulaRecoveredCount = 0;
    let superscriptRecoveredCount = 0;
    let optionRecoveredCount = 0;
    let inlineMathMergedCount = 0;
    let readingHintsAddedCount = 0;
    const confidences: number[] = [];

    // Step 1: Text-level Whitespace & Inline Math Recovery on Raw Nodes
    const rawNodes: RawDocumentNode[] = rawDocument.nodes.map((node) => {
      if (node.kind !== 'text' || !node.text) return node;

      // 1A. Whitespace Recovery (T Ổ TOÁN -> TỔ TOÁN)
      const { text: textWS, mergedCount: wsCount } = recoverWhitespace(node.text);
      if (wsCount > 0) {
        whitespaceMergedCount += wsCount;
        confidences.push(0.99);
      }

      // 1B. Inline Math Merge (x + 1 -> x+1)
      const { text: textMath, inlineMathMergedCount: mathCount } = recoverInlineMath(textWS);
      if (mathCount > 0) {
        inlineMathMergedCount += mathCount;
        confidences.push(0.92);
      }

      return {
        ...node,
        text: textMath,
      };
    });

    // Step 2: Node-level Layout Reconstruction & Boundary Analysis
    const layoutNodes: DocumentLayoutNode[] = layout.nodes.map((node, idx) => {
      const rawText = rawNodes[node.rawNodeIndex ?? idx]?.kind === 'text'
        ? (rawNodes[node.rawNodeIndex ?? idx] as { text?: string }).text
        : node.text;

      let type = node.type;
      let text = rawText ?? node.text;

      // Check for Reading Boundary Hint
      if (text && isReadingTrigger(text)) {
        type = 'reading-candidate';
        readingHintsAddedCount += 1;
        confidences.push(0.95);
      }

      return {
        ...node,
        type,
        text,
      };
    });

    // Step 3: Sequential Structural Reconstruction (Option merge, Formula/Superscript merge, Paragraph merge)
    const reconstructedLayoutNodes: DocumentLayoutNode[] = [];
    const reconstructedRawNodes: RawDocumentNode[] = [];

    let idx = 0;
    while (idx < layoutNodes.length) {
      const currentLayout = layoutNodes[idx];
      let currentRaw = currentLayout.rawNodeIndex !== undefined ? rawNodes[currentLayout.rawNodeIndex] : undefined;

      let currentText = currentLayout.text ?? '';
      let currentType = currentLayout.type;

      // 3A. Lone Option Label Reconstruction ("A." + newline + "V=30a³" -> "A. V=30a³")
      if (
        isLoneOptionLabel(currentText) &&
        idx + 1 < layoutNodes.length
      ) {
        const nextLayout = layoutNodes[idx + 1];
        const nextText = nextLayout.text ?? '';

        if (
          nextText &&
          !isNoise(nextText) &&
          !isOptionStart(nextText) &&
          !isQuestionStart(nextText) &&
          !isSectionHeading(nextText) &&
          !isReadingTrigger(nextText)
        ) {
          currentText = `${currentText.trim()} ${nextText.trim()}`;
          currentType = 'option-candidate';
          optionRecoveredCount += 1;
          confidences.push(0.88);
          idx += 1; // Skip next node
        }
      }
      // 3B. Formula & Superscript/Subscript Reconstruction ("a" + newline + "3" -> "a³")
      else if (
        idx + 1 < layoutNodes.length &&
        currentText.length > 0 &&
        !isNoise(currentText)
      ) {
        const nextLayout = layoutNodes[idx + 1];
        const nextText = nextLayout.text ?? '';

        if (nextText.length > 0 && !isNoise(nextText)) {
          const formulaMatch = tryRecoverSuperscriptOrSubscript(currentText, nextText);
          if (formulaMatch !== null) {
            currentText = formulaMatch.mergedText;
            if (formulaMatch.type === 'superscript' || formulaMatch.type === 'subscript') {
              superscriptRecoveredCount += 1;
              confidences.push(0.93);
            } else {
              formulaRecoveredCount += 1;
              confidences.push(0.91);
            }
            idx += 1; // Skip next node
          } else if (
            !/[.:?!;…]\s*$/u.test(currentText.trim()) &&
            currentType !== 'heading' &&
            currentType !== 'table' &&
            currentType !== 'formula' &&
            currentType !== 'question-candidate' &&
            nextLayout.type !== 'heading' &&
            nextLayout.type !== 'table' &&
            nextLayout.type !== 'formula' &&
            nextLayout.type !== 'question-candidate' &&
            !isQuestionStart(nextText) &&
            !isOptionStart(nextText) &&
            !isSectionHeading(nextText) &&
            !isReadingTrigger(nextText) &&
            !isNoise(nextText)
          ) {
            currentText = `${currentText.trim()} ${nextText.trim()}`;
            paragraphMergedCount += 1;
            confidences.push(0.94);
            idx += 1; // Skip next node
          }
        }
      }

      // Commit reconstructed node
      const newLayoutNode: DocumentLayoutNode = {
        ...currentLayout,
        id: `layout-recon-${reconstructedLayoutNodes.length + 1}`,
        readingOrder: reconstructedLayoutNodes.length,
        type: currentType,
        text: currentText,
      };

      const newRawNode: RawDocumentNode = currentRaw
        ? currentRaw.kind === 'text'
          ? { ...currentRaw, text: currentText }
          : currentRaw
        : { kind: 'text', text: currentText, page: currentLayout.page, confidence: 1 };

      newLayoutNode.rawNodeIndex = reconstructedRawNodes.length;
      reconstructedRawNodes.push(newRawNode);
      reconstructedLayoutNodes.push(newLayoutNode);

      idx += 1;
    }

    const reconstructedRawDocument: RawDocument = {
      ...rawDocument,
      nodes: reconstructedRawNodes,
    };

    const pages = Array.from(new Set(reconstructedLayoutNodes.map((n) => n.page)))
      .sort((a, b) => a - b)
      .map((page) => ({
        page,
        nodes: reconstructedLayoutNodes.filter((n) => n.page === page),
      }));

    const reconstructedLayout: DocumentLayout = {
      ...layout,
      pages,
      nodes: reconstructedLayoutNodes,
    };

    const avgConf = confidences.length > 0
      ? Math.round((confidences.reduce((a, b) => a + b, 0) / confidences.length) * 100) / 100
      : 1.0;

    return {
      rawDocument: reconstructedRawDocument,
      layout: reconstructedLayout,
      summary: {
        whitespaceMergedCount,
        paragraphMergedCount,
        formulaRecoveredCount,
        superscriptRecoveredCount,
        optionRecoveredCount,
        inlineMathMergedCount,
        readingHintsAddedCount,
        averageConfidence: avgConf,
      },
    };
  }
}

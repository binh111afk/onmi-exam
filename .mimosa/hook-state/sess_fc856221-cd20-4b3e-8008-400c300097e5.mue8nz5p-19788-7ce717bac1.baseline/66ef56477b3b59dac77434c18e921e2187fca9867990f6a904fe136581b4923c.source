import { useCallback } from 'react';
import type { DocBlock } from '../../../../../../types/doc-editor';
import type { FlowStep, FlowContent, FlowSettings } from '../FlowTypes';
import { createDefaultStep, createNewFlowContent } from '../FlowUtils';

export function useFlow(
  block: DocBlock,
  idx: number,
  onUpdateBlock: (idx: number, updated: DocBlock, isDebounced?: boolean) => void
) {
  const flowContent: FlowContent = block.flowContent || createNewFlowContent();
  const steps = flowContent.steps;

  const updateFlowContent = useCallback((nextContent: FlowContent) => {
    onUpdateBlock(idx, {
      ...block,
      flowContent: nextContent,
    }, false);
  }, [block, idx, onUpdateBlock]);

  const updateSteps = useCallback((nextSteps: FlowStep[]) => {
    updateFlowContent({
      ...flowContent,
      steps: nextSteps,
    });
  }, [flowContent, updateFlowContent]);

  const updateSettings = useCallback((nextSettings: Partial<FlowSettings>) => {
    updateFlowContent({
      ...flowContent,
      settings: {
        ...flowContent.settings,
        ...nextSettings,
      },
    });
  }, [flowContent, updateFlowContent]);

  const addStep = useCallback(() => {
    updateSteps([...steps, createDefaultStep(crypto.randomUUID())]);
  }, [steps, updateSteps]);

  const deleteStep = useCallback((stepId: string) => {
    updateSteps(steps.filter(s => s.id !== stepId));
  }, [steps, updateSteps]);

  const duplicateStep = useCallback((stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;

    const duplicated: FlowStep = {
      ...steps[stepIndex],
      id: crypto.randomUUID(),
    };
    const next = [...steps];
    next.splice(stepIndex + 1, 0, duplicated);
    updateSteps(next);
  }, [steps, updateSteps]);

  const moveStep = useCallback((stepId: string, direction: 'up' | 'down') => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;
    const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const next = [...steps];
    [next[stepIndex], next[targetIndex]] = [next[targetIndex], next[stepIndex]];
    updateSteps(next);
  }, [steps, updateSteps]);

  const updateStep = useCallback((stepId: string, updated: FlowStep) => {
    updateSteps(steps.map(s => s.id === stepId ? updated : s));
  }, [steps, updateSteps]);

  return {
    steps,
    settings: flowContent.settings,
    addStep,
    deleteStep,
    duplicateStep,
    moveStep,
    updateStep,
    updateSettings,
  };
}

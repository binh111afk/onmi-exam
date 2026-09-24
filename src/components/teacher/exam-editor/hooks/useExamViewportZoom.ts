// Một nguồn duy nhất cho viewport state của preview (zoom / fit-width / fullscreen) —
// logic thật nằm ở teacher/hooks/usePreviewViewport.ts, dùng chung với Doc Editor.
export { usePreviewViewport as useExamViewportZoom } from '../../hooks/usePreviewViewport';

import React from 'react';
import type { DiagramContent, DiagramNode } from './DiagramTypes';
import { LatexText } from '../common/LatexText';

interface DiagramPreviewProps {
  content: DiagramContent;
}

export const DiagramPreview: React.FC<DiagramPreviewProps> = ({ content }) => {
  const nodes = content.nodes || [];
  const settings = content.settings || {};
  const { layout, arrowStyle, themeColor = '#6366f1' } = settings;

  if (nodes.length === 0) {
    return (
      <div className="text-center py-4 text-slate-400 text-[11px] font-bold select-none">
        Chưa có sơ đồ.
      </div>
    );
  }

  const markerId = `arrowhead-${layout}-${arrowStyle}`;
  const strokeDash = arrowStyle === 'dashed' ? '4,4' : undefined;

  const nodeRadiusClass = {
    rounded: 'rounded-xl',
    sharp: 'rounded-none',
    oval: 'rounded-[9999px] px-5 py-3'
  }[settings.nodeStyle || 'rounded'] || 'rounded-xl';

  const gapClass = {
    compact: 'gap-2',
    normal: 'gap-4',
    wide: 'gap-6'
  }[settings.nodeSpacing || 'normal'] || 'gap-4';

  const renderArrow = (direction: 'horizontal' | 'vertical') => {
    if (settings.showArrows === false) {
      return <div className={direction === 'horizontal' ? 'w-2 h-2' : 'w-2 h-2'} />;
    }

    const strokeWidth = 1.5;
    const arrowColor = themeColor;

    if (direction === 'horizontal') {
      return (
        <div className="flex items-center justify-center min-w-[20px] h-10 select-none">
          <svg className="w-5 h-3 overflow-visible" viewBox="0 0 24 12">
            <defs>
              <marker
                id={markerId}
                markerWidth="6"
                markerHeight="5"
                refX="5"
                refY="2.5"
                orient="auto"
              >
                <path d="M0,0 L6,2.5 L0,5 Z" fill={arrowColor} />
              </marker>
            </defs>
            {arrowStyle === 'curved' ? (
              <path
                d="M 0 6 C 6 0, 18 12, 24 6"
                fill="none"
                stroke={arrowColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDash}
                markerEnd={`url(#${markerId})`}
              />
            ) : (
              <line
                x1="0"
                y1="6"
                x2="22"
                y2="6"
                stroke={arrowColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDash}
                markerEnd={`url(#${markerId})`}
              />
            )}
          </svg>
        </div>
      );
    }

    if (direction === 'vertical') {
      return (
        <div className="flex items-center justify-center w-full h-5 select-none my-0.5">
          <svg className="w-3 h-5 overflow-visible" viewBox="0 0 12 24">
            <defs>
              <marker
                id={markerId}
                markerWidth="5"
                markerHeight="6"
                refX="2.5"
                refY="5"
                orient="auto"
              >
                <path d="M0,0 L2.5,5 L5,0 Z" fill={arrowColor} />
              </marker>
            </defs>
            {arrowStyle === 'curved' ? (
              <path
                d="M 6 0 C 0 6, 12 18, 6 24"
                fill="none"
                stroke={arrowColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDash}
                markerEnd={`url(#${markerId})`}
              />
            ) : (
              <line
                x1="6"
                y1="0"
                x2="6"
                y2="22"
                stroke={arrowColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDash}
                markerEnd={`url(#${markerId})`}
              />
            )}
          </svg>
        </div>
      );
    }

    return null;
  };

  const renderNodeCard = (node: DiagramNode, idx: number) => {
    const cardColor = node.color || themeColor;
    return (
      <div
        key={node.id || idx}
        className={`flex-1 bg-white border border-slate-200 p-3 shadow-2xs hover:shadow-xs transition duration-200 min-w-[140px] max-w-[200px] flex flex-col ${nodeRadiusClass}`}
        style={{ borderLeft: `3px solid ${cardColor}` }}
      >
        <h4 className="text-[11px] font-black text-slate-800 leading-tight">
          <LatexText value={node.title || `Nút ${idx + 1}`} />
        </h4>
        {settings.showDescriptions !== false && node.description && (
          <p className="text-[10px] font-medium text-slate-500 mt-1.5 whitespace-pre-wrap leading-normal">
            <LatexText value={node.description} />
          </p>
        )}
      </div>
    );
  };

  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center w-full max-w-[220px] mx-auto py-1 animate-fadeIn ${gapClass}`}>
        {nodes.map((node, idx) => (
          <React.Fragment key={node.id || idx}>
            {renderNodeCard(node, idx)}
            {idx < nodes.length - 1 && renderArrow('vertical')}
          </React.Fragment>
        ))}
      </div>
    );
  }

  if (layout === 'cycle') {
    return (
      <div className="flex flex-col items-center w-full py-3 bg-slate-50/10 rounded-xl border border-slate-100 p-3 animate-fadeIn">
        <div className={`flex flex-wrap justify-center items-center w-full ${gapClass}`}>
          {nodes.map((node, idx) => (
            <React.Fragment key={node.id || idx}>
              {renderNodeCard(node, idx)}
              {idx < nodes.length - 1 && renderArrow('horizontal')}
            </React.Fragment>
          ))}
        </div>
        {nodes.length > 1 && settings.showArrows !== false && (
          <div className="w-full flex justify-center mt-3">
            <svg className="w-full max-w-[320px] h-8 overflow-visible" viewBox="0 0 320 32">
              <defs>
                <marker
                  id={`${markerId}-left`}
                  markerWidth="6"
                  markerHeight="5"
                  refX="1"
                  refY="2.5"
                  orient="auto"
                >
                  <path d="M6,0 L0,2.5 L6,5 Z" fill={themeColor} />
                </marker>
              </defs>
              <path
                d="M 290 0 C 290 28, 30 28, 30 8"
                fill="none"
                stroke={themeColor}
                strokeWidth="1.5"
                strokeDasharray={strokeDash}
                markerEnd={`url(#${markerId}-left)`}
              />
            </svg>
          </div>
        )}
      </div>
    );
  }

  if (layout === 'tree') {
    const rootNode = nodes[0];
    const leafNodes = nodes.slice(1);

    return (
      <div className={`flex flex-col items-center w-full py-3 animate-fadeIn ${gapClass}`}>
        {rootNode && renderNodeCard(rootNode, 0)}

        {leafNodes.length > 0 && settings.showArrows !== false && (
          <div className="w-full flex flex-col items-center -my-1.5 select-none">
            <svg className="w-full max-w-[380px] h-6 overflow-visible" viewBox="0 0 100 18">
              <line x1="50" y1="0" x2="50" y2="9" stroke={themeColor} strokeWidth="1.5" strokeDasharray={strokeDash} />
              <line x1="20" y1="9" x2="80" y2="9" stroke={themeColor} strokeWidth="1.5" strokeDasharray={strokeDash} />
              <line x1="20" y1="9" x2="20" y2="18" stroke={themeColor} strokeWidth="1.5" strokeDasharray={strokeDash} />
              <line x1="50" y1="9" x2="50" y2="18" stroke={themeColor} strokeWidth="1.5" strokeDasharray={strokeDash} />
              <line x1="80" y1="9" x2="80" y2="18" stroke={themeColor} strokeWidth="1.5" strokeDasharray={strokeDash} />
            </svg>
          </div>
        )}

        {leafNodes.length > 0 && (
          <div className={`flex flex-wrap justify-center w-full ${gapClass}`}>
            {leafNodes.map((node, idx) => renderNodeCard(node, idx + 1))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap justify-center items-center w-full py-1 animate-fadeIn ${gapClass}`}>
      {nodes.map((node, idx) => (
        <React.Fragment key={node.id || idx}>
          {renderNodeCard(node, idx)}
          {idx < nodes.length - 1 && renderArrow('horizontal')}
        </React.Fragment>
      ))}
    </div>
  );
};

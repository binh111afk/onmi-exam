import React from 'react';
import type { OmlImageBlock, OmlImageGroupBlock } from '../../../../types/oml';
import { getImageSizeClass, getImageStyle, getImageGroupLayoutClass } from '../utils';

interface ImageBlockProps {
  block: OmlImageBlock;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ block }) => {
  return (
    <figure className="my-3 flex flex-col items-center gap-2">
      <img
        src={block.src}
        alt={block.alt ?? block.caption ?? ''}
        className={`rounded-t-2xl rounded-b-none border border-slate-100 object-cover shadow-sm ${getImageSizeClass(block.size)}`}
        style={getImageStyle(block, { maxWidth: 480 })}
      />
      {block.caption && (
        <figcaption className="text-[9px] text-slate-400 font-bold italic">{block.caption}</figcaption>
      )}
    </figure>
  );
};

interface ImageGroupBlockProps {
  block: OmlImageGroupBlock;
}

export const ImageGroupBlock: React.FC<ImageGroupBlockProps> = ({ block }) => {
  return (
    <div className="my-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className={getImageGroupLayoutClass(block.layout)}>
        {(block.items ?? []).map((item, itemIdx) => (
          <figure
            key={`${item.src ?? itemIdx}-${itemIdx}`}
            className="group flex flex-col overflow-hidden border border-slate-100 bg-white shadow-sm transition duration-200 hover:scale-[1.01] hover:shadow-md"
          >
            <div className="overflow-hidden bg-slate-100">
              <img
                src={item.src}
                alt={item.alt ?? item.caption ?? ''}
                className={`aspect-video rounded-t-2xl rounded-b-none object-cover transition duration-200 ${getImageSizeClass(item.size)}`}
              />
            </div>
            {item.caption && (
              <figcaption className="px-2 pt-1.5 pb-2 text-center text-[9px] font-bold italic text-slate-400">
                {item.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
};

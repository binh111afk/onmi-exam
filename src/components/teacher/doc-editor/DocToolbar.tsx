import React from 'react';
import { 
  RotateCcw, 
  Bold, 
  Italic, 
  Underline, 
  Type, 
  AlignLeft, 
  List, 
  ListOrdered, 
  Activity, 
  Image as ImageIcon, 
  Table, 
  Sparkles 
} from 'lucide-react';

interface DocToolbarProps {
  onAiSuggest: () => void;
}

export const DocToolbar: React.FC<DocToolbarProps> = ({ onAiSuggest }) => {
  return (
    <div className="h-11 border-b border-slate-100 px-4 flex items-center gap-1 overflow-x-auto shrink-0 select-none bg-slate-50/20">
      <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition"><RotateCcw size={13} /></button>
      <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition rotate-180"><RotateCcw size={13} /></button>
      
      <div className="h-4 w-px bg-slate-200 mx-1.5" />
      
      <button className="px-2 py-1 text-[10px] font-black text-slate-600 hover:bg-slate-100 rounded transition">H2 ▾</button>
      
      <div className="h-4 w-px bg-slate-200 mx-1.5" />

      <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition"><Bold size={13} /></button>
      <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition"><Italic size={13} /></button>
      <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition"><Underline size={13} /></button>
      <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition"><Type size={13} /></button>
      
      <div className="h-4 w-px bg-slate-200 mx-1.5" />

      <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition"><AlignLeft size={13} /></button>
      <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition"><List size={13} /></button>
      <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition"><ListOrdered size={13} /></button>
      
      <div className="h-4 w-px bg-slate-200 mx-1.5" />

      <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition"><Activity size={13} /></button>
      <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition"><ImageIcon size={13} /></button>
      <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition"><Table size={13} /></button>
      
      <div className="h-4 w-px bg-slate-200 mx-1.5" />

      <button 
        onClick={onAiSuggest}
        className="px-2.5 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[9px] font-black rounded-lg flex items-center gap-1.5 transition select-none cursor-pointer"
      >
        <Sparkles size={11} /> AI Gợi ý
      </button>
    </div>
  );
};

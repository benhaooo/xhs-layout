import React from 'react';
import { useEditorStore } from '../../store/editorStore';

interface ToolbarProps {
  cardId: string;
}

const Toolbar: React.FC<ToolbarProps> = ({ cardId }) => {
  const { getOrCreateEditor, toggleMark, toggleBlock, setTextAlign, getCurrentFormat } = useEditorStore();
  
  // 获取当前卡片的格式信息
  const currentFormat = getCurrentFormat(cardId);
  const { isBold, isItalic, isUnderline } = currentFormat;
  
  // 优化后的工具栏实现
  return (
    <div className="py-2 flex flex-wrap items-center justify-center gap-2">
      <div className="flex items-center space-x-1 border-r pr-2">
        <button
          className={`p-1 ${isBold ? 'bg-blue-100' : 'hover:bg-gray-100'} rounded w-8 h-8 flex items-center justify-center`}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleMark(cardId, 'bold');
          }}
          title="加粗"
        >
          <span className="font-bold">B</span>
        </button>
        <button
          className={`p-1 ${isItalic ? 'bg-blue-100' : 'hover:bg-gray-100'} rounded w-8 h-8 flex items-center justify-center`}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleMark(cardId, 'italic');
          }}
          title="斜体"
        >
          <span className="italic">I</span>
        </button>
        <button
          className={`p-1 ${isUnderline ? 'bg-blue-100' : 'hover:bg-gray-100'} rounded w-8 h-8 flex items-center justify-center`}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleMark(cardId, 'underline');
          }}
          title="下划线"
        >
          <span className="underline">U</span>
        </button>
      </div>
      
      <div className="flex items-center space-x-1 border-r pr-2">
        <button
          className="p-1 hover:bg-gray-100 rounded w-8 h-8 flex items-center justify-center"
          onMouseDown={(e) => {
            e.preventDefault();
            toggleBlock(cardId, 'heading');
          }}
          title="标题"
        >
          <span className="font-semibold">H</span>
        </button>
        <button
          className="p-1 hover:bg-gray-100 rounded w-8 h-8 flex items-center justify-center"
          onMouseDown={(e) => {
            e.preventDefault();
            toggleBlock(cardId, 'bulleted-list');
          }}
          title="无序列表"
        >
          <span>•</span>
        </button>
        <button
          className="p-1 hover:bg-gray-100 rounded w-8 h-8 flex items-center justify-center"
          onMouseDown={(e) => {
            e.preventDefault();
            toggleBlock(cardId, 'ordered-list');
          }}
          title="有序列表"
        >
          <span>1.</span>
        </button>
      </div>
      
      <div className="flex items-center space-x-1">
        <button
          className="p-1 hover:bg-gray-100 rounded w-8 h-8 flex items-center justify-center"
          onMouseDown={(e) => {
            e.preventDefault();
            setTextAlign(cardId, 'left');
          }}
          title="左对齐"
        >
          <span>←</span>
        </button>
        <button
          className="p-1 hover:bg-gray-100 rounded w-8 h-8 flex items-center justify-center"
          onMouseDown={(e) => {
            e.preventDefault();
            setTextAlign(cardId, 'center');
          }}
          title="居中"
        >
          <span>↔</span>
        </button>
        <button
          className="p-1 hover:bg-gray-100 rounded w-8 h-8 flex items-center justify-center"
          onMouseDown={(e) => {
            e.preventDefault();
            setTextAlign(cardId, 'right');
          }}
          title="右对齐"
        >
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar; 
import { useState, useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';

// 自定义钩子，用于处理编辑器选择事件和状态更新
export const useEditorSelection = (cardId: string) => {
  const { getSelectedText, getCurrentFormat } = useEditorStore();
  const [selectedText, setSelectedText] = useState('');
  const [format, setFormat] = useState(getCurrentFormat(cardId));

  // 当cardId变化时，更新选中文本和格式
  useEffect(() => {
    if (!cardId) return;

    // 初始化选中文本和格式
    setSelectedText(getSelectedText(cardId));
    setFormat(getCurrentFormat(cardId));

    // 监听选择变化事件
    const handleSelectionChange = () => {
      // 使用setTimeout避免React渲染过程中的状态更新
      setTimeout(() => {
        setSelectedText(getSelectedText(cardId));
        setFormat(getCurrentFormat(cardId));
      }, 0);
    };

    // 添加事件监听
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);
    document.addEventListener('mouseup', handleSelectionChange);

    // 清理函数
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('keyup', handleSelectionChange);
      document.removeEventListener('mouseup', handleSelectionChange);
    };
  }, [cardId, getSelectedText, getCurrentFormat]);

  return {
    selectedText,
    format,
  };
}; 
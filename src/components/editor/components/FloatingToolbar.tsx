import React, { useEffect, useRef, useState } from 'react';
import { useSlate, ReactEditor } from 'slate-react';
import { Editor, Range } from 'slate';
import { useEditorStore } from '../../../store/editorStore';
import { CSSProperties, RefObject } from 'react';

// 图标导入
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaHeading,
  FaCode,
} from 'react-icons/fa';
import { 
  MdFormatColorText, 
  MdFormatColorFill,
  MdFormatListBulleted,
  MdFormatListNumbered 
} from 'react-icons/md';

interface FloatingToolbarProps {
  cardId: string;
  editorRef?: RefObject<HTMLDivElement>;
  isFocused: boolean;
  selectionComplete?: boolean;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ 
  cardId, 
  editorRef, 
  isFocused,
  selectionComplete = false 
}) => {
  const editor = useSlate();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [bgColorOpen, setBgColorOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // 从store获取工具函数
  const { 
    toggleMark, 
    toggleBlock, 
    setTextAlign, 
    setColor, 
    getCurrentFormat,
    getSelectedText
  } = useEditorStore();

  // 根据当前格式获取按钮活动状态
  const format = getCurrentFormat(cardId);

  // 颜色选项
  const colorOptions = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  ];

  // 检查选择状态，并更新工具栏可见性和位置
  useEffect(() => {
    const updateToolbarVisibility = () => {
      try {
        // 如果编辑器没有焦点或没有选区，隐藏工具栏
        if (!isFocused || !editor.selection) {
          setVisible(false);
          return;
        }
        
        const { selection } = editor;
        
        // 只有当选择范围不是折叠状态（即有选中文本）且选择已完成时，才显示工具栏
        if (selection && !Range.isCollapsed(selection) && selectionComplete) {
          const selectedText = getSelectedText(cardId);
          if (selectedText.trim() !== '') {
            // 获取选区的DOM范围和位置
            const domRange = ReactEditor.toDOMRange(editor, selection);
            const rect = domRange.getBoundingClientRect();
            
            // 如果有editorRef，计算相对于编辑器的位置
            if (editorRef && editorRef.current) {
              const editorRect = editorRef.current.getBoundingClientRect();
              const top = rect.top - editorRect.top - 60;
              const left = rect.left + rect.width / 2 - editorRect.left;
              
              setPosition({ top, left });
            } else {
              // 如果没有editorRef，使用相对于视口的位置
              setPosition({
                top: rect.top - 60,
                left: rect.left + rect.width / 2
              });
            }
            
            setVisible(true);
          } else {
            setVisible(false);
          }
        } else {
          setVisible(false);
        }
      } catch (error) {
        console.error('Error updating toolbar visibility:', error);
        setVisible(false);
      }
    };
    
    // 检查当前选择状态
    updateToolbarVisibility();
    
  }, [editor.selection, isFocused, editor, cardId, getSelectedText, editorRef, selectionComplete]);

  
  // 添加点击外部关闭颜色选择器和工具栏的功能（仅处理颜色选择器）
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 只处理颜色选择器的关闭
      if (textColorOpen || bgColorOpen) {
        // 检查点击是否在工具栏内
        const isClickInToolbar = toolbarRef.current && toolbarRef.current.contains(event.target as Node);
        
        // 如果点击在工具栏外部
        if (!isClickInToolbar) {
          setTextColorOpen(false);
          setBgColorOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [textColorOpen, bgColorOpen]);

  // 处理文本样式按钮点击
  const handleFormatClick = (format: string) => {
    toggleMark(cardId, format);
  };

  // 处理块级样式按钮点击
  const handleBlockClick = (blockType: string) => {
    toggleBlock(cardId, blockType);
  };

  // 处理对齐方式按钮点击
  const handleAlignClick = (align: 'left' | 'center' | 'right' | 'justify') => {
    setTextAlign(cardId, align);
  };

  // 处理颜色选择
  const handleColorClick = (color: string, isBackground = false) => {
    if (isBackground) {
      Editor.addMark(editor, 'backgroundColor', color);
    } else {
      setColor(cardId, color);
    }
    // 关闭颜色选择器
    setTextColorOpen(false);
    setBgColorOpen(false);
  };

  // 工具栏样式
  const toolbarStyle: CSSProperties = {
    position: 'absolute',
    top: `${position.top}px`,
    left: `${position.left}px`,
    zIndex: 1000,
    display: visible ? 'flex' : 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    boxShadow: '0 3px 15px rgba(0, 0, 0, 0.12)',
    borderRadius: '6px',
    padding: '8px 10px',
    flexWrap: 'wrap',
    maxWidth: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: visible ? 1 : 0,
    transform: 'translateX(-50%)', // 移除缩放动画效果，只保留水平居中
    border: '1px solid rgba(0, 0, 0, 0.06)',
    backdropFilter: 'blur(4px)',
    pointerEvents: visible ? 'auto' : 'none' // 当不可见时不响应鼠标事件
  };

  // 按钮样式
  const buttonStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    margin: '0 4px',
    borderRadius: '4px',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    fontSize: '16px',
    width: '28px',
    height: '28px',
    position: 'relative',
    outline: 'none'
  };

  // 活动按钮样式
  const activeButtonStyle: CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#f0f0f0',
    color: '#1890ff',
    boxShadow: 'inset 0 0 0 1px rgba(24, 144, 255, 0.2)'
  };

  // 分隔符样式
  const dividerStyle: CSSProperties = {
    width: '1px',
    height: '20px',
    backgroundColor: '#e8e8e8',
    margin: '0 8px',
  };

  // 颜色选择器样式
  const colorPickerStyle: CSSProperties = {
    position: 'absolute',
    top: '40px',
    left: '0',
    backgroundColor: '#fff',
    boxShadow: '0 3px 15px rgba(0, 0, 0, 0.15)',
    borderRadius: '6px',
    padding: '8px',
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 1fr)',
    gap: '4px',
    width: '240px',
    zIndex: 1001,
    animation: 'toolbar-appear 0.15s ease',
    border: '1px solid rgba(0, 0, 0, 0.08)'
  };

  // 颜色选项样式
  const colorOptionStyle = (color: string): CSSProperties => ({
    width: '20px',
    height: '20px',
    backgroundColor: color,
    border: '1px solid #e0e0e0',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'transform 0.1s ease, box-shadow 0.1s ease'
  });
  
  const ColorPickerPopup = ({ colors, onSelect, isBackground = false }: { colors: string[], onSelect: (color: string, isBackground: boolean) => void, isBackground?: boolean }) => {
    return (
      <div style={{...colorPickerStyle, left: isBackground ? '-120px' : '0'}}>
        {colors.map((color) => (
          <div
            key={color}
            style={colorOptionStyle(color)}
            onClick={() => onSelect(color, isBackground)}
            title={color}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        ))}
      </div>
    );
  };

  // 当可见性变化时，确保颜色选择器关闭
  useEffect(() => {
    if (!visible) {
      setTextColorOpen(false);
      setBgColorOpen(false);
    }
  }, [visible]);

  return (
    <div 
      ref={toolbarRef} 
      style={toolbarStyle}
      className="floating-toolbar"
      onMouseDown={(e) => e.preventDefault()} // 防止失去焦点
    >
      {/* 标题按钮 */}
      <button
        type="button"
        style={format.blockType === 'heading' ? activeButtonStyle : buttonStyle}
        onClick={() => handleBlockClick('heading')}
        title="标题"
      >
        <FaHeading />
      </button>

      <div style={dividerStyle} />

      {/* 文本样式按钮 */}
      <button
        type="button"
        style={format.isBold ? activeButtonStyle : buttonStyle}
        onClick={() => handleFormatClick('bold')}
        title="加粗"
      >
        <FaBold />
      </button>
      <button
        type="button"
        style={format.isItalic ? activeButtonStyle : buttonStyle}
        onClick={() => handleFormatClick('italic')}
        title="斜体"
      >
        <FaItalic />
      </button>
      <button
        type="button"
        style={format.isUnderline ? activeButtonStyle : buttonStyle}
        onClick={() => handleFormatClick('underline')}
        title="下划线"
      >
        <FaUnderline />
      </button>
      <button
        type="button"
        style={format.strikethrough ? activeButtonStyle : buttonStyle}
        onClick={() => handleFormatClick('strikethrough')}
        title="删除线"
      >
        <FaStrikethrough />
      </button>
      <button
        type="button"
        style={format.blockType === 'code_block' ? activeButtonStyle : buttonStyle}
        onClick={() => handleBlockClick('code_block')}
        title="代码块"
      >
        <FaCode />
      </button>

      <div style={dividerStyle} />

      {/* 对齐方式按钮 */}
      <button
        type="button"
        style={format.align === 'left' || format.align === null ? activeButtonStyle : buttonStyle}
        onClick={() => handleAlignClick('left')}
        title="左对齐"
      >
        <FaAlignLeft />
      </button>
      <button
        type="button"
        style={format.align === 'center' ? activeButtonStyle : buttonStyle}
        onClick={() => handleAlignClick('center')}
        title="居中"
      >
        <FaAlignCenter />
      </button>
      <button
        type="button"
        style={format.align === 'right' ? activeButtonStyle : buttonStyle}
        onClick={() => handleAlignClick('right')}
        title="右对齐"
      >
        <FaAlignRight />
      </button>
      <button
        type="button"
        style={format.align === 'justify' ? activeButtonStyle : buttonStyle}
        onClick={() => handleAlignClick('justify')}
        title="两端对齐"
      >
        <FaAlignJustify />
      </button>

      <div style={dividerStyle} />

      {/* 列表按钮 */}
      <button
        type="button"
        style={format.blockType === 'bulleted-list' ? activeButtonStyle : buttonStyle}
        onClick={() => handleBlockClick('bulleted-list')}
        title="无序列表"
      >
        <MdFormatListBulleted />
      </button>
      <button
        type="button"
        style={format.blockType === 'ordered-list' ? activeButtonStyle : buttonStyle}
        onClick={() => handleBlockClick('ordered-list')}
        title="有序列表"
      >
        <MdFormatListNumbered />
      </button>

      <div style={dividerStyle} />

      {/* 颜色按钮 */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => {
            setTextColorOpen(!textColorOpen);
            setBgColorOpen(false);
          }}
          title="文字颜色"
        >
          <MdFormatColorText color={format.color || '#000'} />
        </button>
        {textColorOpen && (
          <ColorPickerPopup colors={colorOptions} onSelect={handleColorClick} />
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => {
            setBgColorOpen(!bgColorOpen);
            setTextColorOpen(false);
          }}
          title="背景颜色"
        >
          <MdFormatColorFill />
        </button>
        {bgColorOpen && (
          <ColorPickerPopup colors={colorOptions} onSelect={handleColorClick} isBackground />
        )}
      </div>
    </div>
  );
};

export default FloatingToolbar; 
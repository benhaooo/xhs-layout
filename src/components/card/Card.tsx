import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CardProps } from '../../types';
import { Descendant } from 'slate';
import CardHeader from './CardHeader';
import CardMain from './CardMain';
import CardFooter from './CardFooter';

const Card: React.FC<CardProps> = ({
  card,
  isFocused,
  focusCard,
  updateCardContent,
  deleteCard,
  duplicateCard,
  updateCardWidth,
  setActiveCard,
}) => {
  // 用于卡片宽度调整的状态
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [resizeDirection, setResizeDirection] = useState<'left' | 'right'>('right');
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 添加视图模式状态
  const [viewMode, setViewMode] = useState<'render' | 'slate'>('render');

  // 设置焦点和活动卡片
  const handleCardClick = useCallback(() => {
    if (!isFocused) {
      focusCard(card.id);
    }
    // 无论是否已经聚焦，都设置为活动卡片
    setActiveCard(card.id);
  }, [isFocused, focusCard, setActiveCard, card.id]);
  
  // 删除卡片
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    deleteCard(card.id);
  }, [deleteCard, card.id]);
  
  // 复制卡片
  const handleDuplicate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    duplicateCard(card.id);
  }, [duplicateCard, card.id]);

  // 开始调整大小
  const startResize = useCallback((e: React.MouseEvent<HTMLDivElement>, direction: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(card?.width || 600);
    setResizeDirection(direction);
  }, [card]);

  // 调整大小过程
  const handleResize = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - startX;
    // 根据拖动方向计算宽度变化
    const widthDelta = resizeDirection === 'right' ? deltaX * 2 : -deltaX * 2;
    const newWidth = Math.max(300, Math.min(1200, startWidth + widthDelta));
    
    if (cardRef.current) {
      cardRef.current.style.width = `${newWidth}px`;
    }
  }, [isResizing, startX, startWidth, resizeDirection]);

  // 结束调整大小
  const endResize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      setIsResizing(false);
      const deltaX = e.clientX - startX;
      // 根据拖动方向计算最终宽度
      const widthDelta = resizeDirection === 'right' ? deltaX * 2 : -deltaX * 2;
      const newWidth = Math.max(300, Math.min(1200, startWidth + widthDelta));
      updateCardWidth(card.id, newWidth);
    }
  }, [isResizing, startX, startWidth, card.id, updateCardWidth, resizeDirection]);

  // 添加和移除事件监听器
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', endResize);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', endResize);
    };
  }, [isResizing, handleResize, endResize]);

  // 当卡片被点击时自动设置焦点
  useEffect(() => {
    if (isFocused) {
      // 当聚焦时设置为活动卡片
      setActiveCard(card.id);
    }
  }, [isFocused, card.id, setActiveCard]);

  // 处理视图模式切换
  const handleToggleViewMode = (mode: 'render' | 'slate') => {
    setViewMode(mode);
  };

  // 切换视图模式
  const toggleViewMode = useCallback(() => {
    const newMode = viewMode === 'render' ? 'slate' : 'render';
    setViewMode(newMode);
  }, [viewMode]);

  // 构建背景样式
  const getBackgroundStyle = (): React.CSSProperties => {
    const { type, value, effects } = card.background;
    let style: React.CSSProperties = {};

    switch (type) {
      case 'color':
        style.backgroundColor = value;
        break;
      case 'gradient':
        style.backgroundImage = value;
        break;
      case 'image':
        style.backgroundImage = `url(${value})`;
        style.backgroundSize = 'cover';
        style.backgroundPosition = 'center';
        
        // 应用效果
        if (effects) {
          if (effects.opacity !== undefined) {
            style.opacity = effects.opacity;
          }
          if (effects.blur !== undefined) {
            style.filter = `blur(${effects.blur}px)`;
          }
          if (effects.brightness !== undefined) {
            style.filter = `${style.filter || ''} brightness(${effects.brightness}%)`;
          }
          if (effects.scale !== undefined) {
            style.transform = `scale(${effects.scale})`;
          }
          if (effects.positionX !== undefined && effects.positionY !== undefined) {
            style.backgroundPosition = `${effects.positionX}% ${effects.positionY}%`;
          }
        }
        break;
    }

    return style;
  };

  // 获取文本样式
  const getTextStyle = (): React.CSSProperties => {
    return {
      fontFamily: card.styles.defaultFont,
      fontSize: card.styles.defaultSize,
      color: card.styles.defaultColor,
      lineHeight: card.styles.lineHeight,
    };
  };

  return (
    <div className="flex flex-col items-center mb-8">
      {/* 卡片控制按钮 - 移到卡片外部上方 */}
      <div className="flex gap-2 mb-2 z-20">
        <button 
          className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
          onClick={handleDuplicate}
          title="复制卡片"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button 
          className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
          onClick={handleDelete}
          title="删除卡片"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        {/* 添加视图模式切换按钮 */}
        <button
          className="px-3 py-1 bg-white rounded shadow-sm hover:bg-gray-100 text-sm flex items-center"
          onClick={toggleViewMode}
          title="切换视图模式"
        >
          {viewMode === 'render' ? '显示原始格式' : '显示渲染视图'}
        </button>
      </div>
      
      {/* 卡片容器 - 外层（背景层） */}
      <div 
        ref={cardRef}
        className={`relative rounded-lg shadow-md overflow-hidden ${isFocused ? 'ring-2 ring-blue-500' : ''}`}
        onClick={handleCardClick}
        style={{ width: `${card.width}px` }}
      >
        {/* 背景层 */}
        <div 
          className="absolute inset-0 z-0"
          style={getBackgroundStyle()}
        />
        
        {/* 内层（卡片本体） */}
        <div 
          className="relative z-10 flex flex-col"
          style={{
            ...getTextStyle(),
            minHeight: '400px',
          }}
        >
          {/* Header 组件 */}
          <CardHeader card={card} />
          
          {/* Main 组件（编辑区域） */}
          <CardMain 
            card={card}
            cardId={card.id}
            updateCardContent={updateCardContent}
            viewMode={viewMode}
            onToggleViewMode={handleToggleViewMode}
          />
          
          {/* Footer 组件 */}
          <CardFooter card={card} />
        </div>
        
        {/* 右侧调整大小的句柄 */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-4 cursor-ew-resize z-30"
          onMouseDown={(e) => startResize(e, 'right')}
          title="调整卡片宽度"
        >
          <div className="h-full w-1 bg-gray-300 mx-auto opacity-0 hover:opacity-100"></div>
        </div>
        
        {/* 左侧调整大小的句柄 */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-4 cursor-ew-resize z-30"
          onMouseDown={(e) => startResize(e, 'left')}
          title="调整卡片宽度"
        >
          <div className="h-full w-1 bg-gray-300 mx-auto opacity-0 hover:opacity-100"></div>
        </div>
      </div>
    </div>
  );
};

export default Card; 
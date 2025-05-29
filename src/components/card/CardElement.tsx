import React from 'react';
import { CardElementProps, Card } from '../../types';

const CardElement: React.FC<CardElementProps> = ({ card, isSelected, onSelect }) => {
  // 处理背景样式
  const getBackgroundStyle = (card: Card) => {
    const { background } = card;
    const { type, value, effects } = background;
    
    let backgroundStyle: React.CSSProperties = {};
    
    switch (type) {
      case 'color':
        backgroundStyle.backgroundColor = value;
        break;
      case 'gradient':
        backgroundStyle.backgroundImage = value;
        break;
      case 'image':
        backgroundStyle.backgroundImage = `url(${value})`;
        backgroundStyle.backgroundSize = 'cover';
        backgroundStyle.backgroundPosition = 'center';
        
        // 应用效果
        if (effects) {
          if (effects.opacity !== undefined) {
            backgroundStyle.opacity = effects.opacity;
          }
          if (effects.blur !== undefined) {
            backgroundStyle.filter = `blur(${effects.blur}px)`;
          }
          if (effects.brightness !== undefined) {
            backgroundStyle.filter = `${backgroundStyle.filter || ''} brightness(${effects.brightness}%)`;
          }
          if (effects.scale !== undefined) {
            backgroundStyle.transform = `scale(${effects.scale})`;
          }
          if (effects.positionX !== undefined && effects.positionY !== undefined) {
            backgroundStyle.backgroundPosition = `${effects.positionX}% ${effects.positionY}%`;
          }
        }
        break;
    }
    
    return backgroundStyle;
  };
  
  // 获取卡片文本样式
  const getCardTextStyle = (card: Card): React.CSSProperties => {
    const { styles } = card;
    
    return {
      fontFamily: styles.defaultFont,
      fontSize: styles.defaultSize,
      color: styles.defaultColor,
      lineHeight: styles.lineHeight,
      padding: styles.padding,
    };
  };
  
  const backgroundStyle = getBackgroundStyle(card);
  const textStyle = getCardTextStyle(card);
  
  return (
    <div 
      className={`relative w-[900px] h-[1200px] overflow-hidden ${isSelected ? 'ring-4 ring-blue-500' : 'ring-1 ring-gray-200'}`}
      onClick={() => onSelect(card.id)}
    >
      {/* 背景层 */}
      <div 
        className="absolute inset-0 z-0"
        style={backgroundStyle}
      />
      
      {/* 内容层 */}
      <div 
        className="absolute inset-0 z-10 overflow-auto"
        style={textStyle}
      >
        {/* 这里将是Slate编辑器渲染的地方 */}
        <div className="w-full h-full">
          {/* 内容将由编辑器渲染 */}
        </div>
      </div>
    </div>
  );
};

export default CardElement; 
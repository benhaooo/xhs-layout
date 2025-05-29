import React from 'react';
import { CardHeaderProps } from '../../types';

const CardHeader: React.FC<CardHeaderProps> = ({ card }) => {
  // 从卡片属性中获取标题或其他头部信息
  return (
    <div className="card-header p-4 border-b border-gray-200">
      {/* 这里可以根据卡片属性渲染标题、图标或其他头部元素 */}
      <h2 className="text-xl font-semibold">
        卡片 #{card.order}
      </h2>
      <div className="text-sm text-gray-500">
        创建时间: {new Date(card.metadata.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default CardHeader; 
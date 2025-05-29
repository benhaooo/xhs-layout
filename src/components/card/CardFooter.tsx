import React from 'react';
import { CardFooterProps } from '../../types';

const CardFooter: React.FC<CardFooterProps> = ({ card }) => {
  return (
    <div className="card-footer p-4 border-t border-gray-200 text-sm text-gray-500">
      {/* 这里可以根据卡片属性渲染页脚信息、操作按钮等 */}
      <div className="flex justify-between items-center">
        <span>最后更新: {new Date(card.metadata.updatedAt).toLocaleDateString()}</span>
        <span>ID: {card.id.slice(0, 8)}...</span>
      </div>
    </div>
  );
};

export default CardFooter; 
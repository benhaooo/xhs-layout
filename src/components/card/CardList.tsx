import React from 'react';
import { useCardStore } from '../../store/cardStore';
import CardEditor from '../editor/CardEditor';

const CardList: React.FC = () => {
  const { getSortedCards, addCard } = useCardStore();
  
  // 获取按顺序排序的卡片
  const sortedCards = getSortedCards();
  
  return (
    <div className="flex flex-col gap-8 items-center w-full py-8 overflow-auto">
      {/* 卡片列表 */}
        {sortedCards.map((card) => (
        <div key={card.id} className="w-full flex justify-center">
          <CardEditor cardId={card.id} />
        </div>
      ))}
      
      {/* 添加卡片按钮 */}
      <div className="w-full flex justify-center mt-4">
        <button
          className="w-[600px] py-3 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-colors"
          onClick={addCard}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-500">添加新卡片</span>
        </button>
      </div>
    </div>
  );
};

export default CardList; 
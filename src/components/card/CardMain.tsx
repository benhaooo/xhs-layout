import React from 'react';
import { CardMainProps } from '../../types';
import SlateEditor from '../editor/SlateEditor';
import { Descendant } from 'slate';

const CardMain: React.FC<CardMainProps> = ({ 
  card, 
  cardId, 
  updateCardContent, 
  viewMode = 'render',
  onToggleViewMode
}) => {

  const handleContentChange = (content: Descendant[]) => {
    updateCardContent(cardId, content);
  };

  return (
    <div className="card-main flex-grow p-4">
      <SlateEditor 
        initialValue={card.content}
        onChange={handleContentChange}
        cardId={cardId}
        onToggleViewMode={onToggleViewMode}
        viewMode={viewMode}
      />
    </div>
  );
};

export default CardMain; 
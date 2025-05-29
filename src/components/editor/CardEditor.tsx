import React from 'react';
import { useCardStore } from '../../store/cardStore';
import { useEditorStore } from '../../store/editorStore';
import Card from '../card/Card';

interface CardEditorProps {
  cardId: string;
}

const CardEditor: React.FC<CardEditorProps> = ({ cardId }) => {
  const { cards, focusedCardId, focusCard, updateCardContent, deleteCard, duplicateCard, updateCardWidth } = useCardStore();
  const { setActiveCard } = useEditorStore();
  
  const card = cards.find(c => c.id === cardId);
  const isFocused = focusedCardId === cardId;
  
  if (!card) {
    return null;
  }

  return (
    <Card
      card={card}
      isFocused={isFocused}
      focusCard={focusCard}
      updateCardContent={updateCardContent}
      deleteCard={deleteCard}
      duplicateCard={duplicateCard}
      updateCardWidth={updateCardWidth}
      setActiveCard={setActiveCard}
    />
  );
};

export default CardEditor; 
import { create } from 'zustand';
import { Card } from '../types';
import { Descendant } from 'slate';
import { v4 as uuidv4 } from 'uuid';

interface CardState {
  cards: Card[];
  focusedCardId: string | null; // 当前聚焦的卡片，主要用于编辑操作
  
  // 操作方法
  addCard: () => void;
  deleteCard: (id: string) => void;
  updateCard: (id: string, updates: Partial<Omit<Card, 'id' | 'metadata'>>) => void;
  updateCardContent: (id: string, content: Descendant[]) => void;
  updateCardBackground: (id: string, background: Card['background']) => void;
  updateCardStyles: (id: string, styles: Partial<Card['styles']>) => void;
  updateCardWidth: (id: string, width: number) => void;
  focusCard: (id: string) => void;
  duplicateCard: (id: string) => void;
  getSortedCards: () => Card[]; // 获取按顺序排序的卡片
}

// 默认内容遵循 Slate 要求的格式
const defaultContent: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '开始编辑你的小红书卡片...' }],
  },
];

const getDefaultCard = (): Card => {
  const newId = uuidv4();
  
  return {
    id: newId,
    order: Date.now(),
    background: {
      type: 'color',
      value: '#ffffff',
      effects: {
        opacity: 1,
        blur: 0,
        brightness: 100,
      }
    },
    content: defaultContent, // 使用正确格式的默认内容
    styles: {
      padding: '40px',
      defaultFont: 'Inter, sans-serif',
      defaultSize: '16px',
      defaultColor: '#000000',
      lineHeight: 1.5,
    },
    width: 600,
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
};

export const useCardStore = create<CardState>((set, get) => {
  // 创建第一张卡片
  const firstCard = getDefaultCard();
  
  return {
    cards: [firstCard],
    focusedCardId: firstCard.id, // 默认聚焦第一张卡片
    
    addCard: () => {
      const newCard = getDefaultCard();
      
      // 获取当前所有卡片
      const { cards } = get();
      
      // 新卡片顺序为当前最大顺序+1
      const maxOrder = cards.reduce((max, card) => Math.max(max, card.order), 0);
      newCard.order = maxOrder + 1;
      
      set((state) => ({
        cards: [...state.cards, newCard],
        focusedCardId: newCard.id,
      }));
    },
    
    deleteCard: (id) => {
      const { cards, focusedCardId } = get();
      
      if (cards.length <= 1) {
        return; // 至少保留一张卡片
      }
      
      const newCards = cards.filter((card) => card.id !== id);
      
      // 如果删除的是当前聚焦的卡片，则聚焦删除位置之前的卡片
      let newFocusedId = focusedCardId;
      if (focusedCardId === id) {
        const sortedCards = [...cards].sort((a, b) => a.order - b.order);
        const deletedIndex = sortedCards.findIndex(card => card.id === id);
        const targetIndex = Math.max(0, deletedIndex - 1);
        newFocusedId = sortedCards[targetIndex]?.id || newCards[0].id;
      }
      
      set({
        cards: newCards,
        focusedCardId: newFocusedId,
      });
    },
    
    updateCard: (id, updates) => {
      set((state) => ({
        cards: state.cards.map((card) =>
          card.id === id
            ? {
                ...card,
                ...updates,
                metadata: {
                  ...card.metadata,
                  updatedAt: new Date(),
                },
              }
            : card
        ),
      }));
    },
    
    updateCardContent: (id, content) => {
      // 确保 content 是有效的 Slate 格式
      if (!Array.isArray(content) || content.length === 0) {
        content = defaultContent;
      }
      
      set((state) => ({
        cards: state.cards.map((card) =>
          card.id === id
            ? {
                ...card,
                content,
                metadata: {
                  ...card.metadata,
                  updatedAt: new Date(),
                },
              }
            : card
        ),
      }));
    },
    
    updateCardBackground: (id, background) => {
      set((state) => ({
        cards: state.cards.map((card) =>
          card.id === id
            ? {
                ...card,
                background,
                metadata: {
                  ...card.metadata,
                  updatedAt: new Date(),
                },
              }
            : card
        ),
      }));
    },
    
    updateCardStyles: (id, styles) => {
      set((state) => ({
        cards: state.cards.map((card) =>
          card.id === id
            ? {
                ...card,
                styles: {
                  ...card.styles,
                  ...styles,
                },
                metadata: {
                  ...card.metadata,
                  updatedAt: new Date(),
                },
              }
            : card
        ),
      }));
    },
    
    updateCardWidth: (id, width) => {
      set((state) => ({
        cards: state.cards.map((card) =>
          card.id === id
            ? {
                ...card,
                width,
                metadata: {
                  ...card.metadata,
                  updatedAt: new Date(),
                },
              }
            : card
        ),
      }));
    },
    
    focusCard: (id) => {
      set({ focusedCardId: id });
    },
    
    duplicateCard: (id) => {
      const { cards } = get();
      const cardToDuplicate = cards.find((card) => card.id === id);
      
      if (cardToDuplicate) {
        // 获取当前所有卡片
        const { cards } = get();
        
        // 复制卡片顺序为当前最大顺序+1
        const maxOrder = cards.reduce((max, card) => Math.max(max, card.order), 0);
        
        const newCard: Card = {
          ...JSON.parse(JSON.stringify(cardToDuplicate)),
          id: uuidv4(),
          order: maxOrder + 1,
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        };
        
        set((state) => ({
          cards: [...state.cards, newCard],
          focusedCardId: newCard.id,
        }));
      }
    },
    
    getSortedCards: () => {
      const { cards } = get();
      return [...cards].sort((a, b) => a.order - b.order);
    },
  };
}); 
import { BaseEditor, Descendant } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

export type CardBackground = {
  type: 'color' | 'gradient' | 'image';
  value: string;
  effects?: {
    opacity?: number;
    blur?: number;
    brightness?: number;
    scale?: number;
    positionX?: number;
    positionY?: number;
  };
};

export type CardStyles = {
  padding: string;
  defaultFont: string;
  defaultSize: string;
  defaultColor: string;
  lineHeight: number;
};

export interface Card {
  id: string;
  order: number;
  background: CardBackground;
  content: Descendant[];
  styles: CardStyles;
  width: number;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface CardElementProps {
  card: Card;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export interface CardHeaderProps {
  card: Card;
}

export interface CardFooterProps {
  card: Card;
}

export interface CardMainProps {
  card: Card;
  cardId: string;
  updateCardContent: (cardId: string, content: Descendant[]) => void;
  viewMode?: 'render' | 'slate';
  onToggleViewMode?: (mode: 'render' | 'slate') => void;
}

export interface CardProps {
  card: Card;
  isFocused: boolean;
  focusCard: (id: string) => void;
  updateCardContent: (cardId: string, content: Descendant[]) => void;
  deleteCard: (id: string) => void;
  duplicateCard: (id: string) => void;
  updateCardWidth: (id: string, width: number) => void;
  setActiveCard: (id: string) => void;
}

export interface ParagraphElement {
  type: 'paragraph';
  align?: 'left' | 'center' | 'right' | 'justify';
  children: CustomText[];
}

export interface HeadingElement {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  align?: 'left' | 'center' | 'right' | 'justify';
  children: CustomText[];
}

export interface ListItemElement {
  type: 'list-item';
  align?: 'left' | 'center' | 'right' | 'justify';
  children: CustomText[];
}

export interface OrderedListElement {
  type: 'ordered-list';
  align?: 'left' | 'center' | 'right' | 'justify';
  children: ListItemElement[];
}

export interface UnorderedListElement {
  type: 'bulleted-list';
  align?: 'left' | 'center' | 'right' | 'justify';
  children: ListItemElement[];
}

export interface DividerElement {
  type: 'divider';
  align?: 'left' | 'center' | 'right' | 'justify';
  children: CustomText[];
}

export interface PageBreakElement {
  type: 'page-break';
  align?: 'left' | 'center' | 'right' | 'justify';
  children: CustomText[];
}

export interface CodeBlockElement {
  type: 'code_block';
  language?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  children: CustomText[];
}

export interface BoxElement {
  type: 'box';
  theme?: string;
  radius?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  children: CustomText[];
  isInline?: true;
}

export type CustomElement =
  | ParagraphElement
  | HeadingElement
  | ListItemElement
  | OrderedListElement
  | UnorderedListElement
  | DividerElement
  | PageBreakElement
  | CodeBlockElement
  | BoxElement;

export type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontFamily?: string;
  lineHeight?: string;
};

export type ToolbarProps = {
  editor: CustomEditor | null;
};

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
} 
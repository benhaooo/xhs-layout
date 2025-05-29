import { create } from 'zustand';
import { createEditor, Descendant, Editor, Element, Transforms, Node } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { CustomEditor, CustomElement } from '../types';
import withMarkdownPaste from '../components/editor/plugins/withMarkdownPaste';
import withMarkdownShortcuts from '../components/editor/plugins/withMarkdownShortcuts';

// 默认内容
const defaultContent: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '开始编辑你的小红书卡片...' }],
  },
];

interface FormatInfo {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  strikethrough: boolean;
  color: string | null;
  backgroundColor: string | null;
  fontSize: string | null;
  fontFamily: string | null;
  lineHeight: string | null;
  align: 'left' | 'center' | 'right' | 'justify' | null;
  blockType: string;
  [key: string]: any; // 添加索引签名
}

interface EditorInstance {
  editor: CustomEditor;
  currentFormat: FormatInfo;
}

interface EditorState {
  // 存储所有编辑器实例的映射，键为卡片ID
  editorInstances: Record<string, EditorInstance>;
  
  // 当前活动的卡片ID
  activeCardId: string | null;
  
  // 获取或创建编辑器实例（不更新状态）
  getOrCreateEditor: (cardId: string) => CustomEditor;
  
  // 获取当前活动编辑器
  getActiveEditor: () => CustomEditor | null;
  
  // 获取特定卡片的编辑器
  getEditorById: (cardId: string) => CustomEditor | null;
  
  // 设置活动卡片
  setActiveCard: (cardId: string) => void;
  
  // 选中文本的相关操作
  toggleMark: (cardId: string, format: string) => void;
  toggleBlock: (cardId: string, blockType: string) => void;
  setTextAlign: (cardId: string, align: 'left' | 'center' | 'right' | 'justify') => void;
  setColor: (cardId: string, color: string) => void;
  setFontSize: (cardId: string, size: string) => void;
  setFontFamily: (cardId: string, font: string) => void;
  setLineHeight: (cardId: string, lineHeight: string) => void;
  
  // 编辑器状态更新
  updateFormat: (cardId: string) => void;
  
  // 获取当前格式
  getCurrentFormat: (cardId: string) => FormatInfo;
  
  // 获取选中的文本
  getSelectedText: (cardId: string) => string;
}

// 创建一个新的编辑器实例
const createEditorInstance = (): EditorInstance => {
  return {
    editor: withMarkdownShortcuts(withMarkdownPaste(withHistory(withReact(createEditor())))),
    currentFormat: {
      isBold: false,
      isItalic: false,
      isUnderline: false,
      strikethrough: false,
      color: null,
      backgroundColor: null,
      fontSize: null,
      fontFamily: null,
      lineHeight: null,
      align: null,
      blockType: 'paragraph',
    }
  };
};

// 判断节点是否是指定类型的元素
const isBlockActive = (editor: CustomEditor, format: string) => {
  const [match] = Editor.nodes(editor, {
    match: n => !Editor.isEditor(n) && Element.isElement(n) && (n as CustomElement).type === format,
  });
  
  return !!match;
};

export const useEditorStore = create<EditorState>((set, get) => {
  return {
    editorInstances: {},
    activeCardId: null,
    
    getOrCreateEditor: (cardId: string) => {
      const { editorInstances } = get();
      
      // 如果编辑器实例已存在，则返回它
      if (editorInstances[cardId]) {
        return editorInstances[cardId].editor;
      }
      
      // 否则创建一个新的编辑器实例（但不立即更新状态）
      const newInstance = createEditorInstance();
      
      // 只更新editorInstances，不更新activeCardId
      set((state) => ({
        editorInstances: {
          ...state.editorInstances,
          [cardId]: newInstance,
        },
      }));
      
      return newInstance.editor;
    },
    
    getActiveEditor: () => {
      const { activeCardId, editorInstances } = get();
      return activeCardId ? editorInstances[activeCardId]?.editor || null : null;
    },
    
    getEditorById: (cardId: string) => {
      return get().editorInstances[cardId]?.editor || null;
    },
    
    setActiveCard: (cardId: string) => {
      // 确保编辑器实例存在
      const { editorInstances } = get();
      if (!editorInstances[cardId]) {
        const newInstance = createEditorInstance();
        set((state) => ({
          editorInstances: {
            ...state.editorInstances,
            [cardId]: newInstance,
          },
          activeCardId: cardId,
        }));
      } else {
        set({ activeCardId: cardId });
      }
    },
    
    toggleMark: (cardId: string, format: string) => {
      const editor = get().getOrCreateEditor(cardId);
      const currentFormat = get().getCurrentFormat(cardId);
      
      // 获取对应格式的属性名
      const formatKey = format === 'bold' ? 'isBold' : 
                        format === 'italic' ? 'isItalic' : 
                        format === 'underline' ? 'isUnderline' :
                        format === 'strikethrough' ? 'strikethrough' : null;
      
      // 判断当前是否已应用该格式
      const isActive = formatKey ? currentFormat[formatKey] : false;
      
      // 切换格式
      Editor.addMark(editor, format, !isActive);
      
      // 更新当前格式状态
      if (formatKey) {
        set((state) => ({
          editorInstances: {
            ...state.editorInstances,
            [cardId]: {
              ...state.editorInstances[cardId],
              currentFormat: {
                ...state.editorInstances[cardId].currentFormat,
                [formatKey]: !isActive,
              }
            }
          }
        }));
      }
    },
    
    toggleBlock: (cardId: string, blockType: string) => {
      const editor = get().getOrCreateEditor(cardId);
      
      // 获取当前选择
      const { selection } = editor;
      if (!selection) return;
      
      // 确定当前块的类型是否为指定类型
      const isActive = isBlockActive(editor, blockType);
      
      // 转换块类型
      Transforms.setNodes(
        editor,
        {
          type: isActive ? 'paragraph' : blockType,
          ...(blockType === 'heading' ? { level: 2 } : {}), // 默认为 h2
        } as Partial<CustomElement>,
        { match: n => !Editor.isEditor(n) && Element.isElement(n) && !Editor.isInline(editor, n) }
      );
      
      // 特殊处理列表
      if (blockType === 'bulleted-list' || blockType === 'ordered-list') {
        if (!isActive) {
          // 如果当前不是列表，将当前块转换为列表项
          Transforms.wrapNodes(
            editor,
            { type: 'list-item', children: [] } as CustomElement,
            { match: n => !Editor.isEditor(n) && Element.isElement(n) && (n as CustomElement).type !== 'list-item' }
          );
          
          // 再将列表项包装在列表中
          Transforms.wrapNodes(
            editor,
            { type: blockType, children: [] } as CustomElement,
            { match: n => !Editor.isEditor(n) && Element.isElement(n) && (n as CustomElement).type === 'list-item' }
          );
        } else {
          // 如果已经是列表，转换回段落
          Transforms.unwrapNodes(editor, {
            match: n => !Editor.isEditor(n) && Element.isElement(n) && 
                       ((n as CustomElement).type === 'list-item' || (n as CustomElement).type === blockType),
            split: true,
          });
        }
      }
      
      // 更新UI状态
      set((state) => ({
        editorInstances: {
          ...state.editorInstances,
          [cardId]: {
            ...state.editorInstances[cardId],
            currentFormat: {
              ...state.editorInstances[cardId].currentFormat,
              blockType: isActive ? 'paragraph' : blockType,
            }
          }
        }
      }));
    },
    
    setTextAlign: (cardId: string, align: 'left' | 'center' | 'right' | 'justify') => {
      const editor = get().getOrCreateEditor(cardId);
      
      // 获取当前选择
      const { selection } = editor;
      if (!selection) return;
      
      // 应用对齐方式到当前块
      Transforms.setNodes(
        editor,
        { align } as Partial<CustomElement>,
        { match: n => !Editor.isEditor(n) && Element.isElement(n) && !Editor.isInline(editor, n) }
      );
      
      // 更新UI状态
      set((state) => ({
        editorInstances: {
          ...state.editorInstances,
          [cardId]: {
            ...state.editorInstances[cardId],
            currentFormat: {
              ...state.editorInstances[cardId].currentFormat,
              align,
            }
          }
        }
      }));
    },
    
    setColor: (cardId: string, color: string) => {
      const editor = get().getOrCreateEditor(cardId);
      
      // 设置文本颜色
      Editor.addMark(editor, 'color', color);
      
      set((state) => ({
        editorInstances: {
          ...state.editorInstances,
          [cardId]: {
            ...state.editorInstances[cardId],
            currentFormat: {
              ...state.editorInstances[cardId].currentFormat,
              color,
            }
          }
        }
      }));
    },
    
    setFontSize: (cardId: string, size: string) => {
      const editor = get().getOrCreateEditor(cardId);
      
      // 确保字号是有效值
      let validSize = size;
      // 如果只是数字，添加单位
      if (!isNaN(parseFloat(size)) && !size.includes('px') && !size.includes('em') && !size.includes('%')) {
        validSize = `${size}px`;
      }
      
      // 设置字体大小
      Editor.addMark(editor, 'fontSize', validSize);
      
      set((state) => ({
        editorInstances: {
          ...state.editorInstances,
          [cardId]: {
            ...state.editorInstances[cardId],
            currentFormat: {
              ...state.editorInstances[cardId].currentFormat,
              fontSize: validSize,
            }
          }
        }
      }));
    },
    
    setFontFamily: (cardId: string, font: string) => {
      const editor = get().getOrCreateEditor(cardId);
      
      // 设置字体
      Editor.addMark(editor, 'fontFamily', font);
      
      set((state) => ({
        editorInstances: {
          ...state.editorInstances,
          [cardId]: {
            ...state.editorInstances[cardId],
            currentFormat: {
              ...state.editorInstances[cardId].currentFormat,
              fontFamily: font,
            }
          }
        }
      }));
    },
    
    setLineHeight: (cardId: string, lineHeight: string) => {
      const editor = get().getOrCreateEditor(cardId);
      
      // 确保lineHeight是有效值
      let validLineHeight = lineHeight;
      // 如果只是数字，添加单位
      if (!isNaN(parseFloat(lineHeight)) && !lineHeight.includes('px') && !lineHeight.includes('em')) {
        validLineHeight = lineHeight; // 行高通常不需要单位，是纯数字
      }
      
      // 设置行高
      Editor.addMark(editor, 'lineHeight', validLineHeight);
      
      set((state) => ({
        editorInstances: {
          ...state.editorInstances,
          [cardId]: {
            ...state.editorInstances[cardId],
            currentFormat: {
              ...state.editorInstances[cardId].currentFormat,
              lineHeight: validLineHeight,
            }
          }
        }
      }));
    },
    
    updateFormat: (cardId: string) => {
      const editor = get().getOrCreateEditor(cardId);
      
      try {
        // 获取当前选择的标记
        const marks = Editor.marks(editor);
        console.log("🚀 ~ marks:", marks)
        const isBold = marks ? !!marks.bold : false;
        const isItalic = marks ? !!marks.italic : false;
        const isUnderline = marks ? !!marks.underline : false;
        const strikethrough = marks ? !!marks.strikethrough : false;
        const color = marks && marks.color ? String(marks.color) : null;
        const backgroundColor = marks && marks.backgroundColor ? String(marks.backgroundColor) : null;
        const fontSize = marks && marks.fontSize ? String(marks.fontSize) : null;
        const fontFamily = marks && marks.fontFamily ? String(marks.fontFamily) : null;
        const lineHeight = marks && marks.lineHeight ? String(marks.lineHeight) : null;
        
        // 获取当前块类型
        let blockType = 'paragraph';
        let align = null;
        
        try {
          const [blockNode] = Editor.nodes(editor, {
            match: n => !Editor.isEditor(n) && Element.isElement(n),
            mode: 'lowest',
          });
          
          if (blockNode) {
            blockType = (blockNode[0] as CustomElement).type;
            align = (blockNode[0] as CustomElement).align || null;
          }
        } catch (error) {
          console.error('获取块类型时出错:', error);
        }
        
        // 更新当前格式状态
        set((state) => ({
          editorInstances: {
            ...state.editorInstances,
            [cardId]: {
              ...state.editorInstances[cardId],
              currentFormat: {
                isBold,
                isItalic,
                isUnderline,
                strikethrough,
                color,
                backgroundColor,
                fontSize,
                fontFamily,
                lineHeight,
                blockType,
                align,
              }
            }
          }
        }));
      } catch (error) {
        // 出错时不更新格式
        console.error('获取编辑器格式时出错:', error);
      }
    },
    
    getCurrentFormat: (cardId: string) => {
      const { editorInstances } = get();
      if (!editorInstances[cardId]) {
        return {
          isBold: false,
          isItalic: false,
          isUnderline: false,
          strikethrough: false,
          color: null,
          backgroundColor: null,
          fontSize: null,
          fontFamily: null,
          lineHeight: null,
          align: null,
          blockType: 'paragraph',
        };
      }
      return editorInstances[cardId].currentFormat;
    },
    
    getSelectedText: (cardId: string) => {
      const { editorInstances } = get();
      
      // 如果编辑器实例不存在，返回空字符串
      if (!editorInstances[cardId]) {
        return '';
      }
      
      const editor = editorInstances[cardId].editor;
      
      try {
        const { selection } = editor;
        if (!selection) return '';
        
        // 获取选中的文本
        const selectedText = Editor.string(editor, selection);
        return selectedText;
      } catch (error) {
        console.error('获取选中文本时出错:', error);
        return '';
      }
    },
  };
}); 
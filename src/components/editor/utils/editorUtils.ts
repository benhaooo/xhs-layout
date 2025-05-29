import { Editor, Transforms, Element as SlateElement } from 'slate';
import { CustomEditor, CustomText, CustomElement } from '../../../types';

// 切换块级格式
export const toggleBlock = (editor: CustomEditor, format: string) => {
  const isActive = isBlockActive(editor, format);
  const isList = format === 'bulleted-list' || format === 'ordered-list';

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      (n.type === 'bulleted-list' || n.type === 'ordered-list'),
    split: true,
  });

  const newProperties: Partial<SlateElement> = {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format as any,
  };

  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] } as CustomElement;
    Transforms.wrapNodes(editor, block);
  }
};

// 切换行内格式
export const toggleMark = (editor: CustomEditor, format: keyof Omit<CustomText, 'text'>) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

// 检查块级格式是否激活
export const isBlockActive = (editor: CustomEditor, format: string) => {
  const [match] = Editor.nodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      n.type === format,
  });

  return !!match;
};

// 检查行内格式是否激活
export const isMarkActive = (editor: CustomEditor, format: keyof Omit<CustomText, 'text'>) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

// 设置文本颜色
export const setColor = (editor: CustomEditor, color: string) => {
  Editor.addMark(editor, 'color', color);
};

// 设置背景颜色
export const setBackgroundColor = (editor: CustomEditor, color: string) => {
  Editor.addMark(editor, 'backgroundColor', color);
};

// 设置字体大小
export const setFontSize = (editor: CustomEditor, fontSize: string) => {
  Editor.addMark(editor, 'fontSize', fontSize);
};

// 设置字体
export const setFontFamily = (editor: CustomEditor, fontFamily: string) => {
  Editor.addMark(editor, 'fontFamily', fontFamily);
};

// 设置文本对齐方式
export const setTextAlign = (editor: CustomEditor, align: 'left' | 'center' | 'right' | 'justify') => {
  const isActive = isBlockActive(editor, 'align');

  Transforms.setNodes(
    editor,
    { align },
    {
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n.type !== 'bulleted-list' &&
        n.type !== 'ordered-list',
    }
  );
}; 
import { Editor, Element, Range, Transforms, Node, Path, Point } from 'slate';
import { CustomEditor, CustomElement } from '../../../types';

// 处理Box语法的正则表达式
const BOX_START_REGEX = /^:::box(\{.*?\})?\s*$/;
const BOX_END_REGEX = /^:::$/;

// 解析属性字符串，例如 {theme="light",radius="10px"}
const parseAttributes = (attributeString: string | null): Record<string, string> => {
  if (!attributeString) return {};
  
  const attributes: Record<string, string> = {};
  // 移除花括号
  const cleanedStr = attributeString.replace(/^\{|\}$/g, '');
  
  // 匹配属性名和值
  const attributeMatches = cleanedStr.match(/(\w+)="([^"]+)"/g);
  
  if (attributeMatches) {
    attributeMatches.forEach(attr => {
      const [name, value] = attr.split('=');
      if (name && value) {
        attributes[name] = value.replace(/"/g, '');
      }
    });
  }
  
  return attributes;
};

// Markdown快捷方式支持
const withMarkdownShortcuts = (editor: CustomEditor) => {
  const { insertText, deleteBackward, deleteForward } = editor;

  editor.insertText = (text) => {
    const { selection } = editor;

    // 只在有选区且为折叠状态时处理（光标位置）
    if (selection && Range.isCollapsed(selection)) {
      // 获取当前行的文本
      const { anchor } = selection;
      const block = Editor.above(editor, {
        match: n => !Editor.isEditor(n) && Element.isElement(n) && !Editor.isInline(editor, n),
      });
      const path = block ? block[1] : [];
      const start = Editor.start(editor, path);
      const lineRange = { anchor, focus: start };
      const lineText = Editor.string(editor, lineRange);
      const beforeText = lineText + text;

      // 处理box开始标记
      if (text === '\n' && BOX_START_REGEX.test(beforeText)) {
        // 提取属性
        const match = beforeText.match(BOX_START_REGEX);
        const attributeString = match && match[1] ? match[1] : null;
        const attributes = parseAttributes(attributeString);
        
        // 删除当前行
        Transforms.delete(editor, {
          at: {
            anchor: { path: anchor.path, offset: 0 },
            focus: anchor,
          },
        });
        
        // 创建box元素作为段落的子元素
        const paragraphElement: CustomElement = {
          type: 'paragraph',
          children: [
            {
              type: 'box',
              theme: attributes.theme || undefined,
              radius: attributes.radius || undefined,
              children: [{ text: '' }],
            } as any
          ],
        };
        
        // 插入包含box的段落元素
        Transforms.insertNodes(editor, paragraphElement);
        return;
      }
      
      // 处理box结束标记
      if (text === '\n' && BOX_END_REGEX.test(beforeText)) {
        // 检查是否在box元素内
        const [boxNode] = Editor.nodes(editor, {
          match: n => !Editor.isEditor(n) && Element.isElement(n) && (n as CustomElement).type === 'box',
          mode: 'lowest',
        });
        
        if (boxNode) {
          // 删除当前行
          Transforms.delete(editor, {
            at: {
              anchor: { path: anchor.path, offset: 0 },
              focus: anchor,
            },
          });
          
          // 移动到box元素之后
          const [, boxPath] = boxNode;
          const nextPath = Editor.after(editor, boxPath);
          
          if (nextPath) {
            Transforms.select(editor, nextPath);
          } else {
            // 如果没有下一个位置，创建一个新段落
            Transforms.insertNodes(
              editor,
              { type: 'paragraph', children: [{ text: '' }] } as CustomElement,
              { at: Editor.end(editor, []) }
            );
            Transforms.select(editor, Editor.end(editor, []));
          }
          return;
        }
      }

      // 标题快捷方式
      if (text === ' ' && beforeText.match(/^#\s$/)) {
        Transforms.delete(editor, {
          at: { 
            anchor: { path: anchor.path, offset: 0 },
            focus: anchor,
          },
        });
        
        Transforms.setNodes(
          editor,
          { type: 'heading', level: 1 } as Partial<CustomElement>,
          { match: n => !Editor.isEditor(n) && Element.isElement(n) }
        );
        return;
      }
      
      // 二级标题
      if (text === ' ' && beforeText.match(/^##\s$/)) {
        Transforms.delete(editor, {
          at: { 
            anchor: { path: anchor.path, offset: 0 },
            focus: anchor,
          },
        });
        
        Transforms.setNodes(
          editor,
          { type: 'heading', level: 2 } as Partial<CustomElement>,
          { match: n => !Editor.isEditor(n) && Element.isElement(n) }
        );
        return;
      }
      
      // 三级标题
      if (text === ' ' && beforeText.match(/^###\s$/)) {
        Transforms.delete(editor, {
          at: { 
            anchor: { path: anchor.path, offset: 0 },
            focus: anchor,
          },
        });
        
        Transforms.setNodes(
          editor,
          { type: 'heading', level: 3 } as Partial<CustomElement>,
          { match: n => !Editor.isEditor(n) && Element.isElement(n) }
        );
        return;
      }
      
      // 无序列表
      if (text === ' ' && beforeText.match(/^-\s$/)) {
        Transforms.delete(editor, {
          at: { 
            anchor: { path: anchor.path, offset: 0 },
            focus: anchor,
          },
        });
        
        Transforms.setNodes(
          editor,
          { type: 'list-item' } as Partial<CustomElement>,
          { match: n => !Editor.isEditor(n) && Element.isElement(n) }
        );
        
        Transforms.wrapNodes(
          editor,
          { type: 'bulleted-list', children: [] } as CustomElement,
          { match: n => !Editor.isEditor(n) && Element.isElement(n) && (n as CustomElement).type === 'list-item' }
        );
        return;
      }
      
      // 有序列表
      if (text === ' ' && beforeText.match(/^1\.\s$/)) {
        Transforms.delete(editor, {
          at: { 
            anchor: { path: anchor.path, offset: 0 },
            focus: anchor,
          },
        });
        
        Transforms.setNodes(
          editor,
          { type: 'list-item' } as Partial<CustomElement>,
          { match: n => !Editor.isEditor(n) && Element.isElement(n) }
        );
        
        Transforms.wrapNodes(
          editor,
          { type: 'ordered-list', children: [] } as CustomElement,
          { match: n => !Editor.isEditor(n) && Element.isElement(n) && (n as CustomElement).type === 'list-item' }
        );
        return;
      }
      
      // 分割线
      if (text === '-' && beforeText.match(/^--$/)) {
        Transforms.delete(editor, {
          at: { 
            anchor: { path: anchor.path, offset: 0 },
            focus: anchor,
          },
        });
        
        Transforms.insertNodes(
          editor,
          { type: 'divider', children: [{ text: '' }] } as CustomElement
        );
        
        // 在分隔线后添加一个段落
        Transforms.insertNodes(
          editor,
          { type: 'paragraph', children: [{ text: '' }] } as CustomElement
        );
        
        // 将光标移至新段落
        Transforms.select(editor, Editor.end(editor, []));
        return;
      }
      
      // 代码块
      if (text === '`' && beforeText.match(/^``$/)) {
        Transforms.delete(editor, {
          at: { 
            anchor: { path: anchor.path, offset: 0 },
            focus: anchor,
          },
        });
        
        Transforms.insertNodes(
          editor,
          { type: 'code_block', children: [{ text: '' }] } as CustomElement
        );
        return;
      }
    }

    // 默认插入文本行为
    insertText(text);
  };

  // 重写deleteBackward方法，用于处理box元素的删除
  editor.deleteBackward = (unit) => {
    const { selection } = editor;
    
    if (selection && Range.isCollapsed(selection)) {
      // 获取当前节点和路径
      const [currentNode, currentPath] = Editor.node(editor, selection);
      
      // 检查是否在box元素内
      const [boxMatch] = Editor.nodes(editor, {
        match: n => !Editor.isEditor(n) && Element.isElement(n) && (n as CustomElement).type === 'box',
        mode: 'lowest',
      });
      
      if (boxMatch) {
        const [boxNode, boxPath] = boxMatch;
        
        // 检查box是否为空
        const isEmpty = Node.string(boxNode).length === 0;
        
        if (isEmpty) {
          // 如果box为空，删除整个box
          const parentPath = Path.parent(boxPath);
          Transforms.removeNodes(editor, { at: boxPath });
          
          // 如果父节点只有这一个子节点，确保父节点有一个空文本节点
          const parent = Node.get(editor, parentPath);
          if (Element.isElement(parent) && parent.children.length === 0) {
            Transforms.insertNodes(
              editor,
              { text: '' },
              { at: [...parentPath, 0] }
            );
          }
          
          // 将光标移动到父节点
          Transforms.select(editor, Editor.start(editor, parentPath));
          return;
        }
        
        // 检查是否在box内容的开始位置
        const isAtStart = Editor.isStart(editor, selection.anchor, boxPath);
        
        if (isAtStart) {
          // 将box转换为普通段落
          Transforms.unwrapNodes(editor, {
            at: boxPath,
            match: n => !Editor.isEditor(n) && Element.isElement(n) && (n as CustomElement).type === 'box',
          });
          return;
        }
      } else {
        // 检查光标是否在box元素之后
        const { anchor } = selection;
        const prevPoint = Editor.before(editor, anchor);
        
        if (prevPoint) {
          const [prevNode, prevPath] = Editor.node(editor, prevPoint);
          
          // 检查前一个节点是否是box元素
          const [prevBoxMatch] = Editor.nodes(editor, {
            at: prevPath,
            match: n => !Editor.isEditor(n) && Element.isElement(n) && (n as CustomElement).type === 'box',
            mode: 'lowest',
          });
          
          if (prevBoxMatch) {
            // 如果前一个节点是box，删除它
            const [, boxPath] = prevBoxMatch;
            Transforms.removeNodes(editor, { at: boxPath });
            return;
          }
        }
      }
    }
    
    // 默认删除行为
    deleteBackward(unit);
  };

  // 重写deleteForward方法，处理从box前面删除box的情况
  editor.deleteForward = (unit) => {
    const { selection } = editor;
    
    if (selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const nextPoint = Editor.after(editor, anchor);
      
      if (nextPoint) {
        const [nextNode, nextPath] = Editor.node(editor, nextPoint);
        
        // 检查下一个节点是否是box元素
        const [nextBoxMatch] = Editor.nodes(editor, {
          at: nextPath,
          match: n => !Editor.isEditor(n) && Element.isElement(n) && (n as CustomElement).type === 'box',
          mode: 'lowest',
        });
        
        if (nextBoxMatch) {
          // 如果下一个节点是box，删除它
          const [, boxPath] = nextBoxMatch;
          Transforms.removeNodes(editor, { at: boxPath });
          return;
        }
      }
    }
    
    // 默认删除行为
    deleteForward(unit);
  };

  return editor;
};

export default withMarkdownShortcuts;

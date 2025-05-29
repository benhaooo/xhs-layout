import React, { useCallback, useState, useEffect, useRef, createContext, forwardRef, useImperativeHandle } from 'react';
import { Descendant, Element, Transforms, Range, Path, Node, Editor, Point, Text } from 'slate';
import { Slate, RenderElementProps, RenderLeafProps, Editable } from 'slate-react';
import { useEditorStore } from '../../store/editorStore';
import { CustomEditor, CustomElement } from '../../types';
import './editor.css'; // 导入编辑器样式

// 创建一个 Context 来传递输入法编辑状态
export const ComposingContext = createContext(false);

// 导入组件
import Leaf from './components/Leaf';
import FloatingToolbar from './components/FloatingToolbar'; // 导入浮动工具栏组件

// 导入元素组件
import {
  DefaultElement,
  ParagraphElement,
  HeadingElement,
  ListItemElement,
  BulletedListElement,
  OrderedListElement,
  DividerElement,
  PageBreakElement,
  CodeBlockElement,
  BoxElement
} from './elements';

// SlateEditor 属性接口
interface SlateEditorProps {
  initialValue: Descendant[];
  onChange: (value: Descendant[]) => void;
  cardId: string;
  readOnly?: boolean;
  onToggleViewMode?: (viewMode: 'render' | 'slate') => void; // 添加切换视图模式的回调
  viewMode?: 'render' | 'slate'; // 添加视图模式属性，允许从外部控制
}

// 定义暴露给父组件的方法
export interface SlateEditorHandle {
  toggleViewMode: () => void;
}

/**
 * SlateEditor 组件
 * 富文本编辑器的主要组件，整合了所有编辑功能
 */
const SlateEditor = forwardRef<SlateEditorHandle, SlateEditorProps>(({
  initialValue,
  onChange,
  cardId,
  readOnly = false,
  onToggleViewMode,
  viewMode: externalViewMode
}, ref) => {
  // 确保 initialValue 始终是有效的数组
  const safeInitialValue = Array.isArray(initialValue) && initialValue.length > 0
    ? initialValue
    : [{ type: 'paragraph', children: [{ text: '' }] }] as Descendant[];

  const [value, setValue] = useState<Descendant[]>(safeInitialValue);
  // 添加视图模式状态，默认为渲染模式，如果提供了外部视图模式则使用外部的
  const [internalViewMode, setInternalViewMode] = useState<'render' | 'slate'>('render');
  // 使用外部传入的viewMode或内部状态
  const viewMode = externalViewMode !== undefined ? externalViewMode : internalViewMode;
  const [isFocused, setIsFocused] = useState(false);
  // 添加选择完成状态
  const [selectionComplete, setSelectionComplete] = useState(false);
  // 添加输入法编辑状态跟踪
  const [isComposing, setIsComposing] = useState(false);

  // 获取editorStore相关函数
  const { getOrCreateEditor, toggleMark, updateFormat, setActiveCard, getCurrentFormat } = useEditorStore();

  // 使用ref存储编辑器实例，避免在渲染时创建
  const editorRef = useRef<HTMLDivElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<CustomEditor | null>(null);

  // 当外部viewMode变化时，同步更新内部状态
  useEffect(() => {
    if (externalViewMode !== undefined) {
      setInternalViewMode(externalViewMode);
    }
  }, [externalViewMode]);

  // 当组件挂载时获取编辑器实例和设置活动卡片
  useEffect(() => {
    // 获取或创建编辑器实例
    if (!editorInstanceRef.current) {
      editorInstanceRef.current = getOrCreateEditor(cardId);

      // 配置编辑器识别内联元素
      const editor = editorInstanceRef.current;
      const { isInline, isVoid } = editor;

      editor.isInline = element => {
        return element.type === 'box' ? true : isInline(element);
      };

      // 不将box元素标记为void，这样可以在其中编辑内容
      editor.isVoid = element => {
        return isVoid(element);
      };
    }

    // 设置活动卡片
    setActiveCard(cardId);
  }, [cardId, getOrCreateEditor, setActiveCard]);



  // 当内容变化时更新格式信息
  useEffect(() => {
    if (editorInstanceRef.current) {
      updateFormat(cardId);
    }
  }, [value, updateFormat, cardId]);

  // 处理键盘事件
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!readOnly && editorInstanceRef.current) {
      const editor = editorInstanceRef.current;

      // 常见的格式化快捷键
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'b': {
            event.preventDefault();
            toggleMark(cardId, 'bold');
            break;
          }
          case 'i': {
            event.preventDefault();
            toggleMark(cardId, 'italic');
            break;
          }
          case 'u': {
            event.preventDefault();
            toggleMark(cardId, 'underline');
            break;
          }
          // Ctrl+Enter 保持当前块类型换行
          case 'Enter': {
            event.preventDefault();
            // 插入软换行
            editor.insertText('\n');
            break;
          }
          default:
            break;
        }
      } else {
        // 处理回车键
        if (event.key === 'Enter' && !event.shiftKey) {
          // 检查当前是否在标题块内
          const [headingMatch] = editor.nodes({
            match: n => !Editor.isEditor(n) && Element.isElement(n) && (
              (n as CustomElement).type === 'heading' ||
              (n as CustomElement).type === 'code_block'
            ),
          });

          // 检查当前是否在列表项内
          const [listMatch] = editor.nodes({
            match: n => !Editor.isEditor(n) && Element.isElement(n) && (n as CustomElement).type === 'list-item',
          });

          if (headingMatch) {
            event.preventDefault();

            // 获取当前选择
            const { selection } = editor;
            if (!selection) return;

            // 如果是选区末尾，插入新段落
            if (Range.isCollapsed(selection) &&
              editor.isEnd(selection.anchor, editor.node(selection.anchor.path)[1])) {
              // 在当前块后插入一个新的段落
              Transforms.insertNodes(
                editor,
                { type: 'paragraph', children: [{ text: '' }] } as CustomElement,
                { at: Path.next(selection.anchor.path.slice(0, -1)) }
              );

              // 移动光标到新段落
              Transforms.select(editor, {
                path: Path.next(selection.anchor.path.slice(0, -1)).concat(0),
                offset: 0
              });
            } else {
              // 在选区位置分割节点
              Transforms.splitNodes(editor, { always: true });

              // 将分割后的新节点转换为段落
              Transforms.setNodes(
                editor,
                { type: 'paragraph' } as Partial<CustomElement>,
                { at: editor.selection as Range }
              );
            }

            return;
          } else if (listMatch) {
            // 列表项中的回车键保持默认行为
            // 不再对空列表项进行特殊处理
            return; // 返回，让默认行为处理回车键
          }
        }

        // 处理退格键
        if (event.key === 'Backspace') {
          // 获取当前选择
          const { selection } = editor;
          if (!selection || !Range.isCollapsed(selection)) return;

          // 检查光标是否在块的开始位置
          const isAtStart = Editor.isStart(editor, selection.anchor, selection.anchor.path);

          if (isAtStart) {
            // 检查当前是否在标题块内
            const [headingMatch] = editor.nodes({
              match: n => !Editor.isEditor(n) && Element.isElement(n) &&
                (n as CustomElement).type === 'heading',
            });

            // 检查当前是否在列表项内
            const [listItemMatch] = editor.nodes({
              match: n => !Editor.isEditor(n) && Element.isElement(n) &&
                ((n as CustomElement).type === 'list-item'),
            });

            // 检查当前是否在代码块内
            const [codeBlockMatch] = editor.nodes({
              match: n => !Editor.isEditor(n) && Element.isElement(n) &&
                (n as CustomElement).type === 'code_block',
            });

            if (headingMatch) {
              event.preventDefault();
              // 将标题转换为普通段落
              Transforms.setNodes(
                editor,
                { type: 'paragraph' } as Partial<CustomElement>
              );
              return;
            } else if (codeBlockMatch) {
              event.preventDefault();
              // 将代码块转换为普通段落
              Transforms.setNodes(
                editor,
                { type: 'paragraph' } as Partial<CustomElement>
              );
              return;
            } else if (listItemMatch) {
              event.preventDefault();

              // 获取列表项的路径
              const [, listItemPath] = listItemMatch;

              // 检查是否在嵌套列表中
              const parentNodeEntry = Editor.parent(editor, listItemPath);
              const parentNode = parentNodeEntry[0] as CustomElement;

              if (parentNode.type === 'bulleted-list' || parentNode.type === 'ordered-list') {
                // 获取当前列表项在父列表中的索引
                const listItemIndex = listItemPath[listItemPath.length - 1];

                // 如果是列表中的第一项且列表只有一项，则转换整个列表
                if (listItemIndex === 0 && parentNode.children.length === 1) {
                  // 将列表项转换为段落并取消嵌套
                  Transforms.unwrapNodes(editor, {
                    at: listItemPath,
                    match: n => !Editor.isEditor(n) && Element.isElement(n) &&
                      (n as CustomElement).type === 'list-item',
                  });

                  Transforms.setNodes(
                    editor,
                    { type: 'paragraph' } as Partial<CustomElement>,
                    { at: editor.selection as Range }
                  );
                } else if (listItemIndex > 0) {
                  // 如果不是第一个列表项，则将当前列表项内容合并到前一个列表项中

                  // 1. 获取当前列表项内容
                  const currentItemNode = editor.node(listItemPath)[0] as CustomElement;
                  const currentItemContent = currentItemNode.children;

                  // 2. 获取前一个列表项的路径
                  const prevItemPath = [...listItemPath.slice(0, -1), listItemIndex - 1];
                  const prevItemNode = editor.node(prevItemPath)[0] as CustomElement;

                  // 3. 获取前一个列表项末尾位置
                  const prevItemEndPoint = Editor.end(editor, prevItemPath);

                  // 4. 删除当前列表项
                  Transforms.removeNodes(editor, { at: listItemPath });

                  // 5. 将光标移动到前一个列表项末尾
                  Transforms.select(editor, prevItemEndPoint);

                  // 6. 如果当前列表项有内容，则将内容附加到前一个列表项
                  if (currentItemContent.length > 0 && Node.string(currentItemContent[0]) !== '') {
                    // 遍历当前列表项的所有子节点并插入到前一个列表项末尾
                    currentItemContent.forEach((child: any) => {
                      Transforms.insertNodes(editor, child, { at: editor.selection as Range });
                      // 移动光标到插入点之后
                      Transforms.move(editor);
                    });
                  }
                } else {
                  // 如果是第一个列表项但不是唯一一个，需要特殊处理
                  // 将当前列表项转换为段落，并将其放在列表之前

                  // 1. 获取列表的路径
                  const listPath = Path.parent(listItemPath);

                  // 2. 保存当前列表项的内容
                  const currentItemContent = Node.string(editor.node(listItemPath)[0]);

                  // 3. 创建一个新的段落节点
                  const newParagraph = {
                    type: 'paragraph',
                    children: [{ text: currentItemContent }]
                  } as CustomElement;

                  // 4. 在列表前插入新段落
                  Transforms.insertNodes(
                    editor,
                    newParagraph,
                    { at: listPath }
                  );

                  // 5. 删除当前列表项
                  Transforms.removeNodes(
                    editor,
                    { at: listItemPath }
                  );

                  // 6. 将光标移动到新段落
                  Transforms.select(editor, Editor.end(editor, listPath));
                }
              }

              return;
            }
          }
        }
      }
    }
  }, [toggleMark, readOnly, cardId]);

  // 切换视图模式
  const toggleViewMode = useCallback(() => {
    const newMode = viewMode === 'render' ? 'slate' : 'render';
    setInternalViewMode(newMode);
    if (onToggleViewMode) {
      onToggleViewMode(newMode);
    }
  }, [viewMode, onToggleViewMode]);

  // 暴露toggleViewMode方法给父组件
  useImperativeHandle(ref, () => ({
    toggleViewMode
  }));

  // 自定义元素渲染
  const renderElement = useCallback((props: RenderElementProps) => {
    switch (props.element.type) {
      case 'heading':
        return <HeadingElement {...props} />;
      case 'paragraph':
        return <ParagraphElement {...props} />;
      case 'list-item':
        return <ListItemElement {...props} />;
      case 'bulleted-list':
        return <BulletedListElement {...props} />;
      case 'ordered-list':
        return <OrderedListElement {...props} />;
      case 'divider':
        return <DividerElement {...props} />;
      case 'page-break':
        return <PageBreakElement {...props} />;
      case 'code_block':
        return <CodeBlockElement {...props} />;
      case 'box':
        return <BoxElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  // 自定义文本渲染
  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />;
  }, []);

  // 处理选择完成事件
  const handleSelectionChange = useCallback((props: any) => {
    console.log("🚀 ~ handleSelectionChange ~ props:", props)

    if (!readOnly && editorInstanceRef.current) {
      const editor = editorInstanceRef.current;
      
      // 检查是否有选择，以及选择是否不是折叠状态（即有选中文本）
      if (editor.selection && !Range.isCollapsed(editor.selection)) {
        // 设置选择完成状态为true
        setSelectionComplete(true);
      } else {
        // 如果没有选择或选择是折叠状态，设置为false
        setSelectionComplete(false);
      }
    }
  }, [readOnly]);

  // 如果编辑器实例还没准备好，显示加载中
  if (!editorInstanceRef.current) {
    return <div>加载编辑器中...</div>;
  }

  return (
    <div className='relative'>
      <div
        className="flex flex-col"
        ref={editorRef}
      >
        <Slate
          editor={editorInstanceRef.current}
          initialValue={value}
          onChange={(newValue) => {
            setValue(newValue);
            onChange(newValue);
            
            // 在内容变化时，检查选择状态
            if (editorInstanceRef.current) {
              const editor = editorInstanceRef.current;
              // 如果选择状态变为null或变为折叠状态，重置selectionComplete
              if (!editor.selection || Range.isCollapsed(editor.selection)) {
                setSelectionComplete(false);
              }
            }
          }}
        >
          <ComposingContext.Provider value={isComposing}>
            {/* 编辑区域 */}
            <div className="py-4 relative">
              {/* 浮动工具栏 */}
              {!readOnly && <FloatingToolbar 
                cardId={cardId} 
                editorRef={editableRef} 
                isFocused={isFocused}
                selectionComplete={selectionComplete} 
              />}

              {viewMode === 'render' ? (
                <Editable
                  ref={editableRef}
                  className="outline-none prose max-w-none slate-editor-content"
                  renderElement={renderElement}
                  renderLeaf={renderLeaf}
                  onKeyDown={handleKeyDown}
                  readOnly={readOnly}
                  placeholder="开始输入内容..."
                  spellCheck={false}
                  onSelect={handleSelectionChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={() => setIsComposing(false)}
                />
              ) : (
                <div className="border rounded p-4 bg-gray-50 font-mono text-sm whitespace-pre-wrap">
                  {JSON.stringify(value, null, 2)}
                </div>
              )}
            </div>
          </ComposingContext.Provider>
        </Slate>
      </div>
    </div>
  );
});

export default SlateEditor; 
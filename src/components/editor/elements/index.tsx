import React, { useContext } from 'react';
import { RenderElementProps } from 'slate-react';
import { CustomElement } from '../../../types';
import { Text } from 'slate';
import { useSelected } from 'slate-react';
import { ComposingContext } from '../SlateEditor';

// 默认元素
export const DefaultElement = (props: RenderElementProps) => {
  return <p {...props.attributes}>{props.children}</p>;
};

// 段落元素
export const ParagraphElement = (props: RenderElementProps) => {
  const element = props.element as CustomElement;
  const style: React.CSSProperties = {};
  const selected = useSelected();
  const isComposing = useContext(ComposingContext);

  if (element.align) {
    style.textAlign = element.align;
  }

  // 检查元素是否为空（如果只有一个子节点且文本为空）
  const isEmpty = element.children.length === 1 && 
                  Text.isText(element.children[0]) && 
                  element.children[0].text === '';

  // 只有在获得焦点且内容为空且不在输入法编辑状态时才显示 placeholder
  const showPlaceholder = isEmpty && selected && !isComposing;

  return (
    <p 
      style={style} 
      {...props.attributes}
      className={showPlaceholder ? "empty-paragraph" : ""}
      data-placeholder={showPlaceholder ? "在此输入内容..." : undefined}
    >
      {props.children}
    </p>
  );
};

// 标题元素
export const HeadingElement = (props: RenderElementProps) => {
  const element = props.element as CustomElement & { level: number, align?: string };
  const style: React.CSSProperties = {};

  if (element.align) {
    style.textAlign = element.align;
  }

  switch (element.level) {
    case 1:
      return <h1 style={{ ...style, fontSize: '2em', fontWeight: 'bold', marginTop: '0.67em', marginBottom: '0.67em' }} {...props.attributes}>{props.children}</h1>;
    case 2:
      return <h2 style={{ ...style, fontSize: '1.5em', fontWeight: 'bold', marginTop: '0.83em', marginBottom: '0.83em' }} {...props.attributes}>{props.children}</h2>;
    case 3:
      return <h3 style={{ ...style, fontSize: '1.17em', fontWeight: 'bold', marginTop: '1em', marginBottom: '1em' }} {...props.attributes}>{props.children}</h3>;
    case 4:
      return <h4 style={{ ...style, fontWeight: 'bold', marginTop: '1.33em', marginBottom: '1.33em' }} {...props.attributes}>{props.children}</h4>;
    case 5:
      return <h5 style={{ ...style, fontSize: '0.83em', fontWeight: 'bold', marginTop: '1.67em', marginBottom: '1.67em' }} {...props.attributes}>{props.children}</h5>;
    case 6:
      return <h6 style={{ ...style, fontSize: '0.67em', fontWeight: 'bold', marginTop: '2.33em', marginBottom: '2.33em' }} {...props.attributes}>{props.children}</h6>;
    default:
      return <h1 style={style} {...props.attributes}>{props.children}</h1>;
  }
};

// 列表项元素
export const ListItemElement = (props: RenderElementProps) => {
  return <li {...props.attributes}>{props.children}</li>;
};

// 无序列表元素
export const BulletedListElement = (props: RenderElementProps) => {
  return <ul style={{ listStyleType: 'disc', paddingLeft: '1em' }} {...props.attributes}>{props.children}</ul>;
};

// 有序列表元素
export const OrderedListElement = (props: RenderElementProps) => {
  return <ol style={{ listStyleType: 'decimal', paddingLeft: '1em' }} {...props.attributes}>{props.children}</ol>;
};

// 分隔线元素
export const DividerElement = (props: RenderElementProps) => {
  return (
    <div {...props.attributes}>
      <div contentEditable={false}>
        <hr style={{ borderTop: '1px solid #ddd', margin: '1em 0' }} />
      </div>
      {props.children}
    </div>
  );
};

// 分页符元素
export const PageBreakElement = (props: RenderElementProps) => {
  return (
    <div {...props.attributes}>
      <div contentEditable={false} className="border-t-2 border-dashed border-blue-400 my-6" />
      {props.children}
    </div>
  );
};

// 代码块元素
export const CodeBlockElement = (props: RenderElementProps) => {
  const element = props.element as CustomElement & { language?: string };
  return (
    <div {...props.attributes} className="my-4">
      <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
        <code className={element.language ? `language-${element.language}` : ''}>
          {props.children}
        </code>
      </pre>
    </div>
  );
};

// 盒子元素
export const BoxElement = (props: RenderElementProps) => {
  const element = props.element as CustomElement & { theme?: string, radius?: string };
  
  // 定义样式
  const style: React.CSSProperties = {
    padding: '0.5rem 1rem',
    margin: '0 0.25rem',
    borderRadius: element.radius || '4px',
    border: '1px solid #e2e8f0',
    display: 'inline-block',
    position: 'relative',
    minWidth: '2em', // 确保即使为空也有最小宽度
    minHeight: '1.5em', // 确保即使为空也有最小高度
  };
  
  // 根据主题设置不同的样式
  if (element.theme === 'light') {
    style.backgroundColor = '#f8fafc';
    style.color = '#1e293b';
  } else if (element.theme === 'dark') {
    style.backgroundColor = '#1e293b';
    style.color = '#f8fafc';
  } else {
    // 默认主题
    style.backgroundColor = '#ffffff';
  }
  
  // 设置对齐方式
  if (element.align) {
    style.textAlign = element.align;
  }
  
  return (
    <span 
      {...props.attributes} 
      style={style}
      data-box-type={element.theme || 'default'}
      data-box-radius={element.radius || '4px'}
    >
      {props.children}
    </span>
  );
}; 
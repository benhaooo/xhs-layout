import React from 'react';
import { RenderLeafProps } from 'slate-react';

// 文本样式组件
const Leaf = (props: RenderLeafProps) => {
  const { attributes, children, leaf } = props;
  const leafStyle: React.CSSProperties = {};

  if (leaf.color) {
    leafStyle.color = leaf.color;
  }

  if (leaf.backgroundColor) {
    leafStyle.backgroundColor = leaf.backgroundColor;
  }

  if (leaf.fontSize) {
    leafStyle.fontSize = leaf.fontSize;
  }

  if (leaf.fontFamily) {
    leafStyle.fontFamily = leaf.fontFamily;
  }

  if (leaf.lineHeight) {
    leafStyle.lineHeight = leaf.lineHeight;
  }

  let styledChildren = <>{children}</>;

  if (leaf.bold) {
    styledChildren = <strong>{styledChildren}</strong>;
  }

  if (leaf.italic) {
    styledChildren = <em>{styledChildren}</em>;
  }

  if (leaf.underline) {
    styledChildren = <u>{styledChildren}</u>;
  }

  if (leaf.strikethrough) {
    styledChildren = <s>{styledChildren}</s>;
  }

  if (leaf.code) {
    styledChildren = <code className="bg-gray-100 px-1 rounded text-sm">{styledChildren}</code>;
  }

  return <span style={leafStyle} {...attributes}>{styledChildren}</span>;
};

export default Leaf; 
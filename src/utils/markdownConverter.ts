import { unified } from 'unified';
import markdown from 'remark-parse';
import stringify from 'remark-stringify';
import { remarkToSlate, slateToRemark } from 'remark-slate-transformer';
import { Descendant } from 'slate';

// 解析box属性
const parseBoxAttributes = (content: string): { theme?: string; radius?: string } => {
  const attributes: { theme?: string; radius?: string } = {};
  
  // 查找主题属性
  const themeMatch = content.match(/theme="([^"]+)"/);
  if (themeMatch && themeMatch[1]) {
    attributes.theme = themeMatch[1];
  }
  
  // 查找圆角属性
  const radiusMatch = content.match(/radius="([^"]+)"/);
  if (radiusMatch && radiusMatch[1]) {
    attributes.radius = radiusMatch[1];
  }
  
  return attributes;
};

/**
 * 将 Markdown 文本转换为 Slate 文档树
 * @param markdownText Markdown 文本
 * @returns Slate 文档树
 */
export const markdownToSlate = (markdownText: string): Descendant[] => {
  // 预处理Markdown，处理自定义的box语法
  let processedMarkdown = markdownText;
  const boxRegex = /:::box(\{.*?\})?\n([\s\S]*?)\n:::/g;
  
  // 收集所有box内容，并替换为占位符
  const boxes: { content: string; attributes: { theme?: string; radius?: string } }[] = [];
  processedMarkdown = processedMarkdown.replace(boxRegex, (match, attributesStr, content) => {
    const attributes = attributesStr ? parseBoxAttributes(attributesStr) : {};
    boxes.push({ content, attributes });
    return `BOX_PLACEHOLDER_${boxes.length - 1}`;
  });

  // 使用 unified 处理流程
  const processor = unified().use(markdown).use(remarkToSlate, {
    // 可以在这里添加自定义覆盖，根据需要调整节点类型
    overrides: {
      // 例如，自定义标题的处理
      heading: (node, next) => ({
        type: 'heading',
        level: node.depth,
        children: next(node.children),
      }),
      // 自定义代码块的处理
      code: (node, next) => ({
        type: 'code_block',
        language: node.lang || 'text',
        children: [{ text: node.value || '' }],
      }),
    },
  });

  // 处理 Markdown 文本
  const result = processor.processSync(processedMarkdown);
  let slateNodes = result.result as Descendant[];
  
  // 替换占位符为box元素
  slateNodes = slateNodes.reduce((acc: Descendant[], node) => {
    if (
      'type' in node && 
      node.type === 'paragraph' && 
      'children' in node && 
      node.children.length === 1 && 
      'text' in node.children[0] && 
      typeof node.children[0].text === 'string' && 
      node.children[0].text.startsWith('BOX_PLACEHOLDER_')
    ) {
      const placeholderText = node.children[0].text;
      const boxIndex = parseInt(placeholderText.replace('BOX_PLACEHOLDER_', ''), 10);
      
      if (!isNaN(boxIndex) && boxes[boxIndex]) {
        const { content, attributes } = boxes[boxIndex];
        
        // 递归处理box内容
        const boxContent = markdownToSlate(content);
        
        // 提取文本内容
        const textContent: { text: string }[] = [];
        boxContent.forEach(node => {
          if ('children' in node && Array.isArray(node.children)) {
            node.children.forEach(child => {
              if ('text' in child) {
                textContent.push({ text: child.text });
              }
            });
          }
        });
        
        // 创建box元素作为段落的子元素
        const paragraphElement = {
          type: 'paragraph',
          children: [
            {
              type: 'box',
              theme: attributes.theme,
              radius: attributes.radius,
              isInline: true,
              children: textContent.length > 0 ? textContent : [{ text: '' }]
            }
          ]
        };
        
        acc.push(paragraphElement as Descendant);
      } else {
        acc.push(node);
      }
    } else {
      acc.push(node);
    }
    
    return acc;
  }, []);
  
  return slateNodes;
};

/**
 * 将 Slate 文档树转换为 Markdown 文本
 * @param slateValue Slate 文档树
 * @returns Markdown 文本
 */
export const slateToMarkdown = (slateValue: Descendant[]): string => {
  // 预处理Slate节点，将box元素转换为特殊的标记
  const processedValue = slateValue.reduce((acc: Descendant[], node) => {
    if ('type' in node && node.type === 'paragraph' && 'children' in node) {
      // 检查段落中是否包含box元素
      const hasBoxElement = node.children.some(child => 
        typeof child === 'object' && child !== null && 'type' in child && child.type === 'box'
      );
      
      if (hasBoxElement) {
        // 处理段落中的box元素
        for (const child of node.children) {
          if (typeof child === 'object' && child !== null && 'type' in child && child.type === 'box') {
            // 构建box的属性字符串
            let attributesStr = '';
            if ('theme' in child && child.theme) {
              attributesStr += `theme="${child.theme}"`;
            }
            if ('radius' in child && child.radius) {
              if (attributesStr) attributesStr += ',';
              attributesStr += `radius="${child.radius}"`;
            }
            
            // 添加box开始标记
            acc.push({
              type: 'paragraph',
              children: [{ text: `:::box${attributesStr ? `{${attributesStr}}` : ''}` }],
            } as Descendant);
            
            // 添加box内容
            if ('children' in child) {
              // 将box内容转换为段落
              acc.push({
                type: 'paragraph',
                children: child.children as any[]
              } as Descendant);
            }
            
            // 添加box结束标记
            acc.push({
              type: 'paragraph',
              children: [{ text: ':::' }],
            } as Descendant);
          }
        }
      } else {
        acc.push(node);
      }
    } else if ('type' in node && node.type === 'box') {
      // 处理顶级box元素（兼容旧数据）
      // 构建box的属性字符串
      let attributesStr = '';
      if ('theme' in node && node.theme) {
        attributesStr += `theme="${node.theme}"`;
      }
      if ('radius' in node && node.radius) {
        if (attributesStr) attributesStr += ',';
        attributesStr += `radius="${node.radius}"`;
      }
      
      // 添加box开始标记
      acc.push({
        type: 'paragraph',
        children: [{ text: `:::box${attributesStr ? `{${attributesStr}}` : ''}` }],
      } as Descendant);
      
      // 添加box内容
      if ('children' in node) {
        acc.push(...(node.children as Descendant[]));
      }
      
      // 添加box结束标记
      acc.push({
        type: 'paragraph',
        children: [{ text: ':::' }],
      } as Descendant);
    } else {
      acc.push(node);
    }
    
    return acc;
  }, []);

  // 使用 unified 处理流程
  const processor = unified().use(stringify, {
    bullet: '-', // 使用 - 作为无序列表标记
    emphasis: '_', // 使用 _ 作为斜体标记
    strong: '**', // 使用 ** 作为粗体标记
    fence: '```', // 使用 ``` 作为代码块标记
  });

  // 转换 Slate 文档树为 remark AST
  const ast = processor.runSync(
    slateToRemark(processedValue, {
      // 可以在这里添加自定义覆盖，根据需要调整节点类型
      overrides: {
        // 例如，自定义处理 heading 节点
        heading: (node, next) => ({
          type: 'heading',
          depth: node.level,
          children: next(node.children),
        }),
        // 自定义处理代码块节点
        code_block: (node, next) => ({
          type: 'code',
          lang: node.language,
          value: node.children[0]?.text || '',
        }),
      },
    })
  );

  // 将 AST 转换为 Markdown 文本
  return processor.stringify(ast);
}; 
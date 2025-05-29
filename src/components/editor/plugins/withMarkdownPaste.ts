import { CustomEditor } from '../../../types';
// 导入Markdown转换工具
import { markdownToSlate } from '../../../utils/markdownConverter';

const withMarkdownPaste = (editor: CustomEditor) => {
  const { insertData } = editor;
  
  editor.insertData = (data) => {
    const text = data.getData('text/plain');
    
    if (text && text.trim()) {
      try {
        // 直接使用markdownToSlate将Markdown文本转换为Slate节点
        const nodes = markdownToSlate(text);
        
        // 如果转换成功，插入转换后的节点
        if (nodes && nodes.length > 0) {
          // 插入所有转换后的节点
          for (const node of nodes) {
            editor.insertNode(node);
          }
          return; // 处理完成，不执行默认行为
        }
      } catch (error) {
        console.error('Markdown转换失败:', error);
      }
    }
    
    // 默认粘贴行为
    insertData(data);
  };
  
  return editor;
};

export default withMarkdownPaste;
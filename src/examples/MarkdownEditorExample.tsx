import React, { useState, useCallback, useRef } from 'react';
import SlateEditor from '../components/editor/SlateEditor';
import { Descendant } from 'slate';

const MarkdownEditorExample: React.FC = () => {
  // 初始编辑器内容
  const [editorValue, setEditorValue] = useState<Descendant[]>([
    {
      type: 'paragraph',
      children: [{ text: '开始编辑内容...' }],
    },
  ]);

  // 导入 Markdown 的函数引用
  const importMarkdownRef = useRef<(markdown: string) => void>();

  // 注册导入函数
  const registerImportMarkdown = useCallback((importFn: (markdown: string) => void) => {
    importMarkdownRef.current = importFn;
  }, []);

  // 导出 Markdown 处理函数
  const handleExportMarkdown = useCallback((markdown: string) => {
    // 这里可以做任何你想做的事情，如下载文件、显示在文本框中等
    alert('导出的 Markdown:\n\n' + markdown);
    console.log('导出的 Markdown:', markdown);
  }, []);

  // 导入 Markdown 按钮点击处理
  const handleImportClick = useCallback(() => {
    // 这里简化为一个输入框，实际应用中可能是文件上传等
    const markdown = prompt('请输入 Markdown 内容:');
    if (markdown && importMarkdownRef.current) {
      importMarkdownRef.current(markdown);
    }
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Markdown 编辑器示例</h1>
      
      <div className="mb-4">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded mr-2 hover:bg-green-600"
          onClick={handleImportClick}
        >
          导入 Markdown
        </button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <SlateEditor
          initialValue={editorValue}
          onChange={setEditorValue}
          onExportMarkdown={handleExportMarkdown}
          importMarkdown={registerImportMarkdown}
        />
      </div>
    </div>
  );
};

export default MarkdownEditorExample; 
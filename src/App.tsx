import React, { useState } from 'react';
import CardList from './components/card/CardList';
import StylePanel from './components/stylePanel/StylePanel';
import ExportPanel from './components/toolbar/ExportPanel';
import Toolbar from './components/toolbar/Toolbar';
import { useEditorStore } from './store/editorStore';
import { useCardStore } from './store/cardStore';

const App: React.FC = () => {
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(true);
  const { focusedCardId } = useCardStore();
  const { activeCardId } = useEditorStore();
  
  // 获取当前活动的卡片ID（用于工具栏）
  const currentCardId = activeCardId || focusedCardId;
  
  return (
    <div className="flex flex-col h-screen">
      {/* 顶部导航条 */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">小红书卡片排版编辑器</h1>
          
          <div className="flex items-center space-x-2">
            <button 
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => setShowStylePanel(!showStylePanel)}
            >
              {showStylePanel ? '隐藏样式面板' : '显示样式面板'}
            </button>
            
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => setShowExportPanel(true)}
            >
              导出
            </button>
          </div>
        </div>
      </header>
      
      {/* 全局统一工具栏 */}
      {currentCardId && (
        <div className="bg-gray-50 border-b border-gray-200 shadow-sm sticky top-0 z-20">
          <div className="container mx-auto">
            <Toolbar cardId={currentCardId} />
          </div>
        </div>
      )}
      
      {/* 主内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 中间卡片编辑区域 */}
        <div className="flex-1 overflow-auto">
          <CardList />
        </div>
        
        {/* 右侧样式面板 */}
        {showStylePanel && (
          <div className="w-80">
            <StylePanel />
          </div>
        )}
      </div>
      
      {/* 导出面板 */}
      {showExportPanel && (
        <ExportPanel onClose={() => setShowExportPanel(false)} />
      )}
    </div>
  );
};

export default App; 
import React, { useState } from 'react';
import BackgroundPanel from './BackgroundPanel';
import { useCardStore } from '../../store/cardStore';
import { useEditorStore } from '../../store/editorStore';
import { Card } from '../../types';
import { useEditorSelection } from '../../hooks/useEditorSelection';

const StylePanel: React.FC = () => {
  const { cards, focusedCardId, updateCardBackground, updateCardStyles } = useCardStore();
  const { setColor, setFontSize, setFontFamily, setLineHeight } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'background' | 'text' | 'spacing' | 'selection'>('selection');
  
  // 获取当前聚焦的卡片
  const focusedCard = cards.find((card) => card.id === focusedCardId);
  
  if (!focusedCard || !focusedCardId) {
    return <div className="p-4">请先选择一个卡片</div>;
  }
  
  // 使用自定义钩子获取选中文本和格式
  const { selectedText, format: currentFormat } = useEditorSelection(focusedCardId);
  
  // 处理背景更新
  const handleBackgroundChange = (background: Card['background']) => {
    updateCardBackground(focusedCardId, background);
  };
  
  // 处理文本样式更新
  const handleTextStyleChange = (styles: Partial<Card['styles']>) => {
    updateCardStyles(focusedCardId, styles);
  };
  
  // 处理间距更新
  const handleSpacingChange = (padding: string) => {
    updateCardStyles(focusedCardId, { padding });
  };
  
  // 处理选中文本颜色变化
  const handleSelectionColorChange = (color: string) => {
    setColor(focusedCardId, color);
  };
  
  // 处理选中文本字号变化
  const handleSelectionSizeChange = (size: string) => {
    setFontSize(focusedCardId, size);
  };
  
  // 处理选中文本字体变化
  const handleSelectionFontChange = (font: string) => {
    setFontFamily(focusedCardId, font);
  };
  
  // 处理选中文本行高变化
  const handleSelectionLineHeightChange = (lineHeight: string) => {
    setLineHeight(focusedCardId, lineHeight);
  };
  
  return (
    <div className="h-full w-full bg-gray-50 border-l overflow-auto">
      {/* 选项卡 */}
      <div className="flex border-b bg-white sticky top-0 z-10">
        <button
          className={`flex-1 py-3 px-2 text-sm font-medium ${
            activeTab === 'selection' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('selection')}
        >
          选中文本
        </button>
        <button
          className={`flex-1 py-3 px-2 text-sm font-medium ${
            activeTab === 'background' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('background')}
        >
          背景
        </button>
        <button
          className={`flex-1 py-3 px-2 text-sm font-medium ${
            activeTab === 'text' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('text')}
        >
          文本
        </button>
        <button
          className={`flex-1 py-3 px-2 text-sm font-medium ${
            activeTab === 'spacing' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('spacing')}
        >
          间距
        </button>
      </div>
      
      {/* 选中文本设置 */}
      {activeTab === 'selection' && (
        <div className="p-4">
          <h3 className="text-lg font-medium mb-4">选中文本格式</h3>
          
          {/* 显示是否有选中内容的提示 */}
          {(!selectedText || selectedText.trim() === '') ? (
            <div className="text-gray-500 mb-4">请选择一段文本以设置其格式</div>
          ) : (
            <div className="mb-4">
              <div className="text-green-500 mb-2">当前已选中文本</div>
              <div className="p-2 bg-gray-100 rounded border text-sm overflow-hidden overflow-ellipsis max-h-16">
                {selectedText}
              </div>
            </div>
          )}
          
          {/* 文本颜色 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              文本颜色
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentFormat.color || '#000000'}
                onChange={(e) => handleSelectionColorChange(e.target.value)}
                className="w-8 h-8 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={currentFormat.color || '#000000'}
                onChange={(e) => handleSelectionColorChange(e.target.value)}
                className="border rounded px-2 py-1 flex-1"
                placeholder="#000000"
              />
            </div>
          </div>
          
          {/* 字体设置 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              字体
            </label>
            <select
              value={currentFormat.fontFamily || ''}
              onChange={(e) => handleSelectionFontChange(e.target.value)}
              className="w-full border rounded px-2 py-1"
            >
              <option value="">默认字体</option>
              <option value="'Noto Sans SC', sans-serif">Noto Sans SC</option>
              <option value="'Noto Serif SC', serif">Noto Serif SC</option>
              <option value="'ZCOOL KuaiLe', cursive">ZCOOL KuaiLe</option>
              <option value="monospace">等宽字体</option>
            </select>
          </div>
          
          {/* 字号设置 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              字号
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="12"
                max="48"
                step="1"
                value={currentFormat.fontSize ? parseInt(currentFormat.fontSize) : 16}
                onChange={(e) => handleSelectionSizeChange(`${e.target.value}px`)}
                className="flex-1"
              />
              <input
                type="text"
                value={currentFormat.fontSize || ''}
                onChange={(e) => handleSelectionSizeChange(e.target.value)}
                className="w-16 border rounded px-2 py-1"
                placeholder="16px"
              />
            </div>
          </div>
          
          {/* 行高设置 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              行高
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={currentFormat.lineHeight ? parseFloat(currentFormat.lineHeight) : 1.5}
                onChange={(e) => handleSelectionLineHeightChange(e.target.value)}
                className="flex-1"
              />
              <input
                type="text"
                value={currentFormat.lineHeight || ''}
                onChange={(e) => handleSelectionLineHeightChange(e.target.value)}
                className="w-16 border rounded px-2 py-1"
                placeholder="1.5"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* 背景设置 */}
      {activeTab === 'background' && (
        <BackgroundPanel
          background={focusedCard.background}
          onChange={handleBackgroundChange}
        />
      )}
      
      {/* 文本设置 */}
      {activeTab === 'text' && (
        <div className="p-4">
          <h3 className="text-lg font-medium mb-4">文本样式设置</h3>
          
          {/* 字体设置 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              默认字体
            </label>
            <select
              value={focusedCard.styles.defaultFont}
              onChange={(e) => handleTextStyleChange({ defaultFont: e.target.value })}
              className="w-full border rounded px-2 py-1"
            >
              <option value="Inter, sans-serif">默认</option>
              <option value="'Noto Sans SC', sans-serif">Noto Sans SC</option>
              <option value="'Noto Serif SC', serif">Noto Serif SC</option>
              <option value="'ZCOOL KuaiLe', cursive">ZCOOL KuaiLe</option>
              <option value="monospace">等宽字体</option>
            </select>
          </div>
          
          {/* 字号设置 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              默认字号
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="12"
                max="48"
                step="1"
                value={parseInt(focusedCard.styles.defaultSize)}
                onChange={(e) => handleTextStyleChange({ defaultSize: `${e.target.value}px` })}
                className="flex-1"
              />
              <input
                type="text"
                value={focusedCard.styles.defaultSize}
                onChange={(e) => handleTextStyleChange({ defaultSize: e.target.value })}
                className="w-16 border rounded px-2 py-1"
                placeholder="16px"
              />
            </div>
          </div>
          
          {/* 默认颜色 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              默认文字颜色
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={focusedCard.styles.defaultColor}
                onChange={(e) => handleTextStyleChange({ defaultColor: e.target.value })}
                className="w-8 h-8 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={focusedCard.styles.defaultColor}
                onChange={(e) => handleTextStyleChange({ defaultColor: e.target.value })}
                className="border rounded px-2 py-1 flex-1"
                placeholder="#000000"
              />
            </div>
          </div>
          
          {/* 行高设置 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              默认行高
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={focusedCard.styles.lineHeight}
                onChange={(e) => handleTextStyleChange({ lineHeight: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <input
                type="text"
                value={focusedCard.styles.lineHeight}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    handleTextStyleChange({ lineHeight: value });
                  }
                }}
                className="w-16 border rounded px-2 py-1"
                placeholder="1.5"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* 间距设置 */}
      {activeTab === 'spacing' && (
        <div className="p-4">
          <h3 className="text-lg font-medium mb-4">间距设置</h3>
          
          {/* 内边距设置 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              内边距: {focusedCard.styles.padding}
            </label>
            <div className="flex gap-2">
              <button
                className={`flex-1 py-2 px-3 border rounded-md ${
                  focusedCard.styles.padding === '20px' ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => handleSpacingChange('20px')}
              >
                小
              </button>
              <button
                className={`flex-1 py-2 px-3 border rounded-md ${
                  focusedCard.styles.padding === '40px' ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => handleSpacingChange('40px')}
              >
                中
              </button>
              <button
                className={`flex-1 py-2 px-3 border rounded-md ${
                  focusedCard.styles.padding === '60px' ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => handleSpacingChange('60px')}
              >
                大
              </button>
            </div>
          </div>
          
          {/* 自定义内边距 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              自定义内边距
            </label>
            <input
              type="text"
              value={focusedCard.styles.padding}
              onChange={(e) => handleSpacingChange(e.target.value)}
              className="w-full border rounded px-2 py-1"
              placeholder="例如: 20px 或 20px 30px"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StylePanel; 
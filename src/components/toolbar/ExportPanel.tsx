import React, { useState } from 'react';
import { useCardStore } from '../../store/cardStore';
import html2canvas from 'html2canvas';
import { toPng, toJpeg } from 'html-to-image';

interface ExportPanelProps {
  onClose: () => void;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ onClose }) => {
  const { cards } = useCardStore();
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg'>('png');
  const [exportScale, setExportScale] = useState<1 | 2 | 3>(2);
  const [exportProgress, setExportProgress] = useState(0);
  
  // 导出当前卡片
  const exportCurrentCard = async () => {
    const selectedCardId = useCardStore.getState().selectedCardId;
    if (!selectedCardId) return;
    
    try {
      setExporting(true);
      setExportProgress(0);
      
      // 查找卡片元素
      const cardElement = document.querySelector(`#card-${selectedCardId}`);
      if (!cardElement) {
        throw new Error('找不到卡片元素');
      }
      
      let dataUrl;
      const options = {
        quality: 0.95,
        pixelRatio: exportScale
      };
      
      // 使用 html-to-image 导出，备选 html2canvas
      if (exportFormat === 'png') {
        dataUrl = await toPng(cardElement as HTMLElement, options);
      } else {
        dataUrl = await toJpeg(cardElement as HTMLElement, options);
      }
      
      setExportProgress(100);
      
      // 下载图片
      const link = document.createElement('a');
      link.download = `小红书卡片_${new Date().toISOString().slice(0, 10)}.${exportFormat}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        setExporting(false);
        setExportProgress(0);
      }, 1000);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
      setExporting(false);
      setExportProgress(0);
    }
  };
  
  // 批量导出所有卡片
  const exportAllCards = async () => {
    if (cards.length === 0) return;
    
    try {
      setExporting(true);
      const totalCards = cards.length;
      
      for (let i = 0; i < totalCards; i++) {
        setExportProgress(Math.floor((i / totalCards) * 100));
        
        const cardId = cards[i].id;
        const cardElement = document.querySelector(`#card-${cardId}`);
        
        if (cardElement) {
          // 确保当前卡片被选中并渲染
          useCardStore.getState().selectCard(cardId);
          
          // 等待一小段时间让卡片渲染完成
          await new Promise(resolve => setTimeout(resolve, 200));
          
          let dataUrl;
          const options = {
            quality: 0.95,
            pixelRatio: exportScale
          };
          
          if (exportFormat === 'png') {
            dataUrl = await toPng(cardElement as HTMLElement, options);
          } else {
            dataUrl = await toJpeg(cardElement as HTMLElement, options);
          }
          
          // 下载图片
          const link = document.createElement('a');
          link.download = `小红书卡片_${i + 1}_${new Date().toISOString().slice(0, 10)}.${exportFormat}`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // 等待一段时间，避免浏览器阻止多次下载
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      setExportProgress(100);
      setTimeout(() => {
        setExporting(false);
        setExportProgress(0);
      }, 1000);
    } catch (error) {
      console.error('批量导出失败:', error);
      alert('批量导出失败，请重试');
      setExporting(false);
    }
  };
  
  // 导出项目为JSON
  const exportProjectAsJSON = () => {
    try {
      const projectData = {
        cards: cards,
        version: '1.0.0',
        exportDate: new Date().toISOString(),
      };
      
      const jsonString = JSON.stringify(projectData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `小红书卡片项目_${new Date().toISOString().slice(0, 10)}.json`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出项目失败:', error);
      alert('导出项目失败，请重试');
    }
  };
  
  // 导入项目JSON
  const importProjectFromJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        
        if (jsonData && Array.isArray(jsonData.cards)) {
          // 导入卡片数据
          useCardStore.setState({ cards: jsonData.cards });
          // 选中第一张卡片
          if (jsonData.cards.length > 0) {
            useCardStore.getState().selectCard(jsonData.cards[0].id);
          }
          
          alert('项目导入成功');
        } else {
          throw new Error('无效的项目文件');
        }
      } catch (error) {
        console.error('导入项目失败:', error);
        alert('导入失败: 无效的项目文件');
      }
    };
    reader.readAsText(file);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">导出选项</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 图片格式选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            导出格式
          </label>
          <div className="flex gap-2">
            <button
              className={`flex-1 py-2 px-3 border rounded-md ${
                exportFormat === 'png' ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => setExportFormat('png')}
            >
              PNG
            </button>
            <button
              className={`flex-1 py-2 px-3 border rounded-md ${
                exportFormat === 'jpg' ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => setExportFormat('jpg')}
            >
              JPG
            </button>
          </div>
        </div>
        
        {/* 导出质量 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            导出质量
          </label>
          <div className="flex gap-2">
            <button
              className={`flex-1 py-2 px-3 border rounded-md ${
                exportScale === 1 ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => setExportScale(1)}
            >
              1x
            </button>
            <button
              className={`flex-1 py-2 px-3 border rounded-md ${
                exportScale === 2 ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => setExportScale(2)}
            >
              2x
            </button>
            <button
              className={`flex-1 py-2 px-3 border rounded-md ${
                exportScale === 3 ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => setExportScale(3)}
            >
              3x
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">更高质量需要更多处理时间</p>
        </div>
        
        {/* 导出按钮 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={exportCurrentCard}
            disabled={exporting}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md disabled:opacity-50"
          >
            导出当前卡片
          </button>
          <button
            onClick={exportAllCards}
            disabled={exporting}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md disabled:opacity-50"
          >
            批量导出全部
          </button>
        </div>
        
        {/* 导出进度 */}
        {exporting && (
          <div className="mb-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <p className="text-xs text-center mt-1">导出中... {exportProgress}%</p>
          </div>
        )}
        
        {/* 项目文件导入导出 */}
        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium mb-2">项目文件操作</h4>
          <div className="flex gap-2">
            <button
              onClick={exportProjectAsJSON}
              className="flex-1 border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded-md"
            >
              导出项目
            </button>
            <label className="flex-1">
              <input
                type="file"
                accept=".json"
                onChange={importProjectFromJSON}
                className="hidden"
              />
              <div className="border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded-md text-center cursor-pointer">
                导入项目
              </div>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">导出为JSON文件，可用于备份或恢复</p>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;
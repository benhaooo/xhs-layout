import React, { useState, useEffect } from 'react';
import { CardBackground } from '../../types';

interface BackgroundPanelProps {
  background: CardBackground;
  onChange: (background: CardBackground) => void;
}

const BackgroundPanel: React.FC<BackgroundPanelProps> = ({ background, onChange }) => {
  const [activeTab, setActiveTab] = useState<'color' | 'gradient' | 'image'>(background.type);
  const [colorValue, setColorValue] = useState(background.type === 'color' ? background.value : '#ffffff');
  const [gradientValue, setGradientValue] = useState(background.type === 'gradient' ? background.value : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)');
  const [imageUrl, setImageUrl] = useState(background.type === 'image' ? background.value : '');
  
  const [opacity, setOpacity] = useState(background.effects?.opacity ?? 1);
  const [blur, setBlur] = useState(background.effects?.blur ?? 0);
  const [brightness, setBrightness] = useState(background.effects?.brightness ?? 100);
  const [scale, setScale] = useState(background.effects?.scale ?? 1);
  const [positionX, setPositionX] = useState(background.effects?.positionX ?? 50);
  const [positionY, setPositionY] = useState(background.effects?.positionY ?? 50);

  // 预设渐变色
  const gradientPresets = [
    'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    'linear-gradient(to right, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%)',
    'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(to top, #fad0c4 0%, #ffd1ff 100%)',
    'linear-gradient(to right, #ff6e7f 0%, #bfe9ff 100%)',
    'linear-gradient(60deg, #abecd6 0%, #fbed96 100%)',
    'linear-gradient(to top, #d299c2 0%, #fef9d7 100%)',
    'linear-gradient(to top, #fdcbf1 0%, #fdcbf1 1%, #e6dee9 100%)'
  ];

  // 更新背景效果
  useEffect(() => {
    updateBackground();
  }, [activeTab, colorValue, gradientValue, imageUrl, opacity, blur, brightness, scale, positionX, positionY]);

  const updateBackground = () => {
    let newBackground: CardBackground = {
      type: activeTab,
      value: '',
      effects: {
        opacity,
        blur,
        brightness,
        scale,
        positionX,
        positionY
      }
    };

    switch (activeTab) {
      case 'color':
        newBackground.value = colorValue;
        break;
      case 'gradient':
        newBackground.value = gradientValue;
        break;
      case 'image':
        newBackground.value = imageUrl;
        break;
    }

    onChange(newBackground);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">背景设置</h3>
      
      {/* 背景类型选择 */}
      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 ${activeTab === 'color' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('color')}
        >
          纯色
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'gradient' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('gradient')}
        >
          渐变
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'image' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('image')}
        >
          图片
        </button>
      </div>
      
      {/* 纯色背景设置 */}
      {activeTab === 'color' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            选择颜色
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colorValue}
              onChange={(e) => setColorValue(e.target.value)}
              className="w-10 h-10 rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={colorValue}
              onChange={(e) => setColorValue(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
              placeholder="#FFFFFF"
            />
          </div>
        </div>
      )}
      
      {/* 渐变背景设置 */}
      {activeTab === 'gradient' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            选择渐变
          </label>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {gradientPresets.map((preset, index) => (
              <div
                key={index}
                className={`h-12 rounded-md cursor-pointer hover:ring-2 ${gradientValue === preset ? 'ring-2 ring-blue-500' : ''}`}
                style={{ background: preset }}
                onClick={() => setGradientValue(preset)}
              />
            ))}
          </div>
          <input
            type="text"
            value={gradientValue}
            onChange={(e) => setGradientValue(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm"
            placeholder="linear-gradient(...)"
          />
        </div>
      )}
      
      {/* 图片背景设置 */}
      {activeTab === 'image' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            上传图片
          </label>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="border rounded px-2 py-1 text-sm"
            />
            {imageUrl && (
              <div className="relative mt-2 rounded-md overflow-hidden" style={{ height: '100px' }}>
                <img src={imageUrl} alt="背景预览" className="w-full h-full object-cover" />
              </div>
            )}
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="图片URL或base64"
            />
          </div>
        </div>
      )}
      
      {/* 效果设置 */}
      <div className="mt-6">
        <h4 className="font-medium mb-2">效果设置</h4>
        
        <div className="grid gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">不透明度: {opacity.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          {activeTab === 'image' && (
            <>
              <div>
                <label className="block text-sm text-gray-700 mb-1">模糊度: {blur}px</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={blur}
                  onChange={(e) => setBlur(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1">亮度: {brightness}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="1"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1">缩放: {scale.toFixed(2)}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.01"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1">水平位置: {positionX}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={positionX}
                  onChange={(e) => setPositionX(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1">垂直位置: {positionY}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={positionY}
                  onChange={(e) => setPositionY(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackgroundPanel; 
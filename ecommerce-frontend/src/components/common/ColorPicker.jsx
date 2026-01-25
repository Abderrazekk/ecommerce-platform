import { useState, useRef, useEffect } from 'react';
import { Palette } from 'lucide-react';

const ColorPicker = ({ color = '#FFFFFF', onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(color);
  const pickerRef = useRef(null);

  const presetColors = [
    '#FFFFFF', '#000000', '#F3F4F6', '#9CA3AF', '#6B7280',
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
    '#EC4899', '#F97316', '#84CC16', '#06B6D4', '#8B5CF6'
  ];

  useEffect(() => {
    setSelectedColor(color);
  }, [color]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColorSelect = (newColor) => {
    setSelectedColor(newColor);
    onChange(newColor);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
      setSelectedColor(value);
      onChange(value);
    }
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full flex items-center justify-center"
        aria-label="Select color"
      >
        <div className="relative">
          <Palette className="h-6 w-6 text-gray-600" />
          <div 
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full border border-gray-300"
            style={{ backgroundColor: selectedColor }}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-64 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => handleColorSelect(presetColor)}
                  className={`w-8 h-8 rounded-full border-2 ${selectedColor === presetColor ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-300'}`}
                  style={{ backgroundColor: presetColor }}
                  aria-label={`Select color ${presetColor}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => handleColorSelect(e.target.value)}
                className="w-10 h-10 cursor-pointer"
              />
              <input
                type="text"
                value={selectedColor}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="#FFFFFF"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="h-10 rounded-lg" style={{ backgroundColor: selectedColor }}>
              <div className={`h-full flex items-center justify-center ${parseInt(selectedColor.replace('#', ''), 16) > 0x888888 ? 'text-black' : 'text-white'}`}>
                Preview
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
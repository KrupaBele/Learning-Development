import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { PresentationTheme } from '../types';
import { Sun, Moon, Palette, X } from 'lucide-react';

interface ThemeSelectorProps {
  theme: PresentationTheme;
  onUpdateTheme: (theme: Partial<PresentationTheme>) => void;
  onClose: () => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  theme,
  onUpdateTheme,
  onClose
}) => {
  const fontOptions = [
    { value: 'sans-serif', label: 'Sans Serif' },
    { value: 'serif', label: 'Serif' },
    { value: 'monospace', label: 'Monospace' },
    { value: 'cursive', label: 'Cursive' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <Palette className="mr-2 text-indigo-600" size={20} />
            Presentation Theme
          </h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center space-x-4">
              <HexColorPicker 
                color={theme.primaryColor} 
                onChange={(color) => onUpdateTheme({ primaryColor: color })} 
              />
              <div 
                className="w-12 h-12 rounded border border-gray-300" 
                style={{ backgroundColor: theme.primaryColor }}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <div className="flex items-center space-x-4">
              <HexColorPicker 
                color={theme.secondaryColor} 
                onChange={(color) => onUpdateTheme({ secondaryColor: color })} 
              />
              <div 
                className="w-12 h-12 rounded border border-gray-300" 
                style={{ backgroundColor: theme.secondaryColor }}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Family
            </label>
            <select
              value={theme.fontFamily}
              onChange={(e) => onUpdateTheme({ fontFamily: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {fontOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Mode
            </label>
            <div className="flex items-center space-x-4">
              <button
                className={`flex items-center px-4 py-2 rounded-md ${!theme.darkMode ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => onUpdateTheme({ darkMode: false })}
              >
                <Sun size={16} className="mr-2" />
                Light
              </button>
              <button
                className={`flex items-center px-4 py-2 rounded-md ${theme.darkMode ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => onUpdateTheme({ darkMode: true })}
              >
                <Moon size={16} className="mr-2" />
                Dark
              </button>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              onClick={onClose}
            >
              Apply Theme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
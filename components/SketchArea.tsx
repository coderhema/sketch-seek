import React, { forwardRef, useState } from 'react';
import SketchPad from './SketchPad';
import { ClearIcon, IdentifyIcon } from './icons';
import AITypedExplanation from './AITypedExplanation';
import type { SketchPadRef } from '../types';

interface SketchAreaProps {
  onDrawingStart: () => void;
  onIdentify: () => void;
  onClear: () => void;
  isLoading: boolean;
  hasStartedDrawing: boolean;
}

const colors = [
  { value: '#334155', label: 'Black' },
  { value: '#ef4444',label: 'Red' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#22c55e', label: 'Green' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#ffffff', label: 'White Eraser' },
];

const SketchArea = forwardRef<SketchPadRef, SketchAreaProps>((
  { onDrawingStart, onIdentify, onClear, isLoading, hasStartedDrawing },
  ref
) => {
  const [brushColor, setBrushColor] = useState('#334155');
  const [brushSize, setBrushSize] = useState(5);

  return (
    <div className="flex flex-col gap-4">
      <AITypedExplanation sectionName="Sketch Pad" />
      <div className="aspect-square bg-neutral-50 rounded-3xl shadow-sm border border-neutral-200 p-2">
        <SketchPad
          ref={ref}
          onDrawingStart={onDrawingStart}
          brushColor={brushColor}
          brushSize={brushSize}
        />
      </div>
      
      <div className="bg-neutral-50 rounded-2xl shadow-sm border border-neutral-200 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3">
          <label className="font-semibold text-sm text-neutral-600 hidden sm:block">Color:</label>
          <div className="flex gap-2">
            {colors.map(color => (
              <button
                key={color.value}
                onClick={() => setBrushColor(color.value)}
                className={`w-8 h-8 rounded-full border-2 transition-transform duration-150 ${
                  brushColor === color.value
                    ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110'
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: color.value, borderColor: color.value === '#ffffff' ? '#e5e7eb' : 'transparent' }}
                aria-label={`Set brush color to ${color.label}`}
                aria-pressed={brushColor === color.value}
                title={`Set brush color to ${color.label}`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <label htmlFor="brushSize" className="font-semibold text-sm text-neutral-600">Size:</label>
           <input
            id="brushSize"
            type="range"
            min="1"
            max="30"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-full sm:w-32 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            aria-label="Brush size"
            title={`Brush size: ${brushSize}`}
           />
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={onIdentify}
          disabled={isLoading || !hasStartedDrawing}
          className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold rounded-full shadow-sm bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
          title="Identify the landmark in your drawing"
        >
          <IdentifyIcon />
          {isLoading ? 'Identifying...' : 'Identify'}
        </button>
        <button
          onClick={onClear}
          disabled={isLoading}
          className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold rounded-full shadow-sm border border-neutral-400 text-neutral-700 bg-white hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 disabled:bg-neutral-200 disabled:text-neutral-400 transition-all duration-200 ease-in-out"
          title="Clear the drawing canvas"
        >
          <ClearIcon />
          Clear
        </button>
      </div>
    </div>
  );
});

export default SketchArea;
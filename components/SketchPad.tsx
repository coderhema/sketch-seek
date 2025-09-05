import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import type { SketchPadRef } from '../types';

interface SketchPadProps {
    onDrawingStart: () => void;
    brushColor: string;
    brushSize: number;
}

const SketchPad = forwardRef<SketchPadRef, SketchPadProps>(({ onDrawingStart, brushColor, brushSize }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scale = window.devicePixelRatio;
    const parent = canvas.parentElement;
    if(parent) {
        let resizeTimeout: number;
        const handleResize = () => {
            const context = canvas.getContext('2d');
            // Save drawing if it exists
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
                tempCtx.drawImage(canvas, 0, 0);
            }

            canvas.width = parent.offsetWidth * scale;
            canvas.height = parent.offsetHeight * scale;
            
            if (context) {
                context.scale(scale, scale);
                // Restore drawing
                context.drawImage(tempCanvas, 0, 0);

                // Re-apply styles after resize
                context.lineCap = 'round';
                context.strokeStyle = brushColor;
                context.lineWidth = brushSize;
                contextRef.current = context;
            }
        };

        const debouncedResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = window.setTimeout(handleResize, 100);
        };

        const initialContext = canvas.getContext('2d');
        if (initialContext) {
            contextRef.current = initialContext;
        }

        window.addEventListener('resize', debouncedResize);
        handleResize(); // Initial setup

        return () => {
            window.removeEventListener('resize', debouncedResize);
        };
    }
  }, []);

  useEffect(() => {
    const context = contextRef.current;
    if (context) {
        context.strokeStyle = brushColor;
        context.lineWidth = brushSize;
    }
  }, [brushColor, brushSize]);

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const { offsetX, offsetY } = getCoords(event);
    if (!contextRef.current || typeof offsetX === 'undefined' || typeof offsetY === 'undefined') return;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    if(!hasContent) {
        onDrawingStart();
        setHasContent(true);
    }
  };

  const stopDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    event.preventDefault();
    const { offsetX, offsetY } = getCoords(event);
    if (!contextRef.current || typeof offsetX === 'undefined' || typeof offsetY === 'undefined') return;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };
  
  const getCoords = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: undefined, offsetY: undefined };
    
    let clientX, clientY;
    if ('touches' in event.nativeEvent && event.nativeEvent.touches.length > 0) {
      clientX = event.nativeEvent.touches[0].clientX;
      clientY = event.nativeEvent.touches[0].clientY;
    } else if ('clientX' in event.nativeEvent) {
      clientX = event.nativeEvent.clientX;
      clientY = event.nativeEvent.clientY;
    } else {
        return { offsetX: undefined, offsetY: undefined };
    }
    
    const rect = canvas.getBoundingClientRect();
    return {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top
    };
  }

  useImperativeHandle(ref, () => ({
    clearCanvas() {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (canvas && context) {
        const scale = window.devicePixelRatio;
        context.clearRect(0, 0, canvas.width / scale, canvas.height / scale);
        setHasContent(false);
      }
    },
    getCanvasAsBase64() {
      const canvas = canvasRef.current;
      if (!canvas || !hasContent) return null;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if(!tempCtx) return null;
      
      // The canvas background is transparent, but we send a white-backed image to the AI
      tempCtx.fillStyle = '#ffffff'; // white
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(canvas, 0, 0);

      return tempCanvas.toDataURL('image/png').split(',')[1];
    },
  }));

  return (
    <canvas
    ref={canvasRef}
    onMouseDown={startDrawing}
    onMouseUp={stopDrawing}
    onMouseLeave={stopDrawing}
    onMouseMove={draw}
    onTouchStart={startDrawing}
    onTouchEnd={stopDrawing}
    onTouchCancel={stopDrawing}
    onTouchMove={draw}
    className="w-full h-full bg-indigo-50/50 rounded-2xl cursor-crosshair touch-none"
    aria-label="Drawing canvas for landmarks"
    />
  );
});

export default SketchPad;
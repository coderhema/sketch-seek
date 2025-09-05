import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

interface LightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNext, onPrev]);

  if (!images || images.length === 0) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-white hover:text-neutral-300 transition-colors z-50"
          onClick={onClose}
          aria-label="Close image viewer"
        >
          <CloseIcon className="w-8 h-8" />
        </button>

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors z-50"
            onClick={onPrev}
            aria-label="Previous image"
          >
            <ChevronLeftIcon className="w-8 h-8" />
          </button>
        )}

        {/* Image Display */}
        <div className="max-w-screen-lg max-h-screen-lg p-8">
            <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            />
        </div>


        {/* Next Button */}
        {images.length > 1 && (
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors z-50"
            onClick={onNext}
            aria-label="Next image"
          >
            <ChevronRightIcon className="w-8 h-8" />
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Lightbox;
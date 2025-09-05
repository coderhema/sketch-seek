import React, { useState } from 'react';
import { ImageIcon } from './icons';
import Lightbox from './Lightbox';

// Sub-component to handle individual image loading and error states
const GalleryImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
        <ImageIcon />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};


interface ImageGalleryProps {
  imageUrls: string[];
  name: string;
  isGenerating: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ imageUrls, name, isGenerating }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };
  
  const showNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
  };

  const showPrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
  };

  if (isGenerating) {
    return (
      <div className="text-center py-4 flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-3"></div>
        <p className="text-neutral-600 font-semibold">Generating a custom image for you...</p>
        <p className="text-sm text-neutral-500">This AI-powered magic takes a few seconds!</p>
      </div>
    );
  }

  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-neutral-500">No images were found for this landmark.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-4">
        {imageUrls.map((url, index) => (
          <button
            key={index}
            onClick={() => openLightbox(index)}
            className="block aspect-square rounded-2xl overflow-hidden bg-neutral-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 cursor-pointer"
            aria-label={`View image ${index + 1} of ${name}`}
          >
            <GalleryImage
              src={url}
              alt={`Image ${index + 1} of ${name}`}
            />
          </button>
        ))}
      </div>
      {isLightboxOpen && (
        <Lightbox
          images={imageUrls}
          currentIndex={currentImageIndex}
          onClose={closeLightbox}
          onNext={showNextImage}
          onPrev={showPrevImage}
        />
      )}
    </>
  );
};

export default ImageGallery;
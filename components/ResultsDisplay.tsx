import React, { useState } from 'react';
import MapDisplay from './MapDisplay';
import MiniTour from './MiniTour';
import AirplaneFinder from './AirplaneFinder';
import ImageGallery from './ImageGallery';
import AITypedExplanation from './AITypedExplanation';
import type { LocationData } from '../types';

interface ResultsDisplayProps {
  isLoading: boolean;
  isGeneratingImage: boolean;
  error: string | null;
  locationData: LocationData | null;
}

type ActiveTab = 'tour' | 'airplanes' | 'images';
type ImageSource = 'curated' | 'web';

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ isLoading, isGeneratingImage, error, locationData }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('images');
  const [activeImageSource, setActiveImageSource] = useState<ImageSource>('curated');

  const tabButtonClasses = (isActive: boolean) => 
    `px-4 py-2 text-sm sm:text-base font-semibold rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors duration-200 ${
      isActive
        ? 'bg-indigo-600 text-white'
        : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
    }`;

  const imageSourceButtonClasses = (isActive: boolean) => 
    `px-3 py-1 text-xs sm:text-sm font-semibold rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 transition-colors duration-200 ${
      isActive
        ? 'bg-indigo-100 text-indigo-700'
        : 'bg-transparent text-neutral-600 hover:bg-neutral-200'
    }`;

  return (
    <div className="flex flex-col gap-8">
      {isLoading && (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-neutral-50 rounded-3xl shadow-sm border border-neutral-200 min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-neutral-600 font-semibold">Analyzing your masterpiece...</p>
          <p className="text-sm text-neutral-500">This might take a moment.</p>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-2xl shadow-sm" role="alert">
          <p className="font-bold">Oops!</p>
          <p>{error}</p>
        </div>
      )}
      {!isLoading && !error && !locationData && (
           <div className="flex flex-col items-center justify-center text-center p-8 bg-neutral-50 rounded-3xl shadow-sm border border-neutral-200 min-h-[300px]">
              <h2 className="text-2xl font-bold text-neutral-700">Draw a landmark to begin!</h2>
              <p className="mt-2 text-neutral-500 max-w-sm">Sketch a famous place like the Eiffel Tower or the Statue of Liberty in the box to the left.</p>
           </div>
      )}
      {locationData && (
        <div className="flex flex-col gap-8">
          <div className="bg-neutral-50 p-6 rounded-3xl shadow-sm border border-neutral-200">
              <h2 className="text-3xl font-bold text-neutral-800">{locationData.name}</h2>
              <p className="mt-1 text-lg text-neutral-600">{locationData.description}</p>
          </div>
          <MapDisplay
            journey={locationData.journey}
          />
          <div className="bg-neutral-50 p-6 rounded-3xl shadow-sm border border-neutral-200">
            <div className="mb-4">
               <AITypedExplanation sectionName="Explore Section" />
            </div>
            <div className="flex items-center gap-2 sm:gap-4 mb-6 border-b border-neutral-200 pb-4 flex-wrap">
              <button
                onClick={() => setActiveTab('images')}
                className={tabButtonClasses(activeTab === 'images')}
                aria-pressed={activeTab === 'images'}
                title="See images of the landmark"
              >
                Images
              </button>
              <button
                onClick={() => setActiveTab('tour')}
                className={tabButtonClasses(activeTab === 'tour')}
                aria-pressed={activeTab === 'tour'}
                title="View your personalized mini-tour"
              >
                Your Mini-Tour
              </button>
              <button
                onClick={() => setActiveTab('airplanes')}
                className={tabButtonClasses(activeTab === 'airplanes')}
                aria-pressed={activeTab === 'airplanes'}
                title="Find airplanes flying nearby"
              >
                Airplanes Nearby
              </button>
            </div>
            <div>
              {activeTab === 'tour' && <MiniTour journey={locationData.journey.slice(1)} /> }
              {activeTab === 'airplanes' && <AirplaneFinder latitude={locationData.latitude} longitude={locationData.longitude} /> }
              {activeTab === 'images' && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => setActiveImageSource('curated')}
                      className={imageSourceButtonClasses(activeImageSource === 'curated')}
                      aria-pressed={activeImageSource === 'curated'}
                      title="View curated and AI-generated images"
                    >
                      Curated
                    </button>
                    <button
                      onClick={() => setActiveImageSource('web')}
                      className={imageSourceButtonClasses(activeImageSource === 'web')}
                      aria-pressed={activeImageSource === 'web'}
                      title="Find more images from the web"
                    >
                      Web Search
                    </button>
                  </div>
                  {activeImageSource === 'curated' ? (
                    <ImageGallery 
                      imageUrls={locationData.imageUrls} 
                      name={locationData.name} 
                      isGenerating={isGeneratingImage}
                    />
                  ) : (
                    <ImageGallery 
                      imageUrls={locationData.pexelsImageUrls}
                      name={locationData.name} 
                      isGenerating={isGeneratingImage}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
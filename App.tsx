import React, { useState, useRef } from 'react';
import Header from './components/Header';
import SketchArea from './components/SketchArea';
import ResultsDisplay from './components/ResultsDisplay';
import { identifyLandmarkFromDrawing, generateLandmarkImage, generateImageForLocation } from './services/geminiService';
import { fetchImagesFromUnsplash } from './services/unsplashService';
import { fetchImagesFromPexels } from './services/pexelsService';
import type { LocationData, SketchPadRef, JourneyStop } from './types';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [hasStartedDrawing, setHasStartedDrawing] = useState(false);

  const sketchPadRef = useRef<SketchPadRef>(null);

  const handleIdentify = async () => {
    const base64ImageData = sketchPadRef.current?.getCanvasAsBase64();
    if (!base64ImageData) {
      setError("Please draw something first!");
      return;
    }

    setIsLoading(true);
    setError(null);
    setLocationData(null);
    setIsGeneratingImage(false);

    try {
      // Step 1: Identify the landmark
      const landmarkData = await identifyLandmarkFromDrawing(base64ImageData);

      // Create a consistent journey array with the main landmark at the start
      const mainLandmarkAsStop: JourneyStop = {
          name: landmarkData.name,
          description: landmarkData.description,
          latitude: landmarkData.latitude,
          longitude: landmarkData.longitude,
      };
      const fullJourney = [mainLandmarkAsStop, ...landmarkData.journey];
      
      const initialLocationData: LocationData = { ...landmarkData, imageUrls: [], pexelsImageUrls: [], journey: fullJourney };
      setLocationData(initialLocationData);
      setIsLoading(false);

      // Step 2: Generate and fetch images in parallel from multiple sources
      setIsGeneratingImage(true);
      const generatedImagePromise = generateLandmarkImage(base64ImageData, landmarkData.name);
      const unsplashImagesPromise = fetchImagesFromUnsplash(landmarkData.name);
      const pexelsImagesPromise = fetchImagesFromPexels(landmarkData.name);
      
      const journeyImagePromises = fullJourney.map(stop => 
          generateImageForLocation(stop.name)
      );

      const [generatedImage, unsplashImages, pexelsImages, ...journeyStopImages] = await Promise.all([
        generatedImagePromise,
        unsplashImagesPromise,
        pexelsImagesPromise,
        ...journeyImagePromises
      ]);

      const curatedImageUrls = [
        generatedImage,
        ...unsplashImages,
      ].filter((url): url is string => !!url);
      
      // Map the resolved image URLs back to the full journey array
      const journeyWithImages = fullJourney.map((stop, index) => ({
        ...stop,
        imageUrl: journeyStopImages[index] || undefined,
      }));

      setLocationData(prev => prev ? { ...prev, imageUrls: curatedImageUrls, pexelsImageUrls: pexelsImages, journey: journeyWithImages } : null);

    } catch (err) {
      console.error(err);
      let errorMessage = "An unknown error occurred.";
      if (err instanceof Error) {
          errorMessage = `Failed to identify the landmark. ${err.message}`;
      }
      setError(errorMessage);
      setIsLoading(false);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleClear = () => {
    sketchPadRef.current?.clearCanvas();
    setIsLoading(false);
    setError(null);
    setLocationData(null);
    setHasStartedDrawing(false);
    setIsGeneratingImage(false);
  };
  
  const handleDrawingStart = () => {
    setHasStartedDrawing(true);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <main className="container mx-auto p-4 sm:p-6 md:p-8">
        <Header />
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="lg:sticky lg:top-8">
            <SketchArea
              ref={sketchPadRef}
              onIdentify={handleIdentify}
              onClear={handleClear}
              onDrawingStart={handleDrawingStart}
              isLoading={isLoading}
              hasStartedDrawing={hasStartedDrawing}
            />
          </div>
          <ResultsDisplay
            isLoading={isLoading}
            isGeneratingImage={isGeneratingImage}
            error={error}
            locationData={locationData}
          />
        </div>
      </main>
      <footer className="text-center p-4 text-neutral-500 text-sm">
        <p>Powered by Gemini, Unsplash, Pexels, and OpenSky Network. Created for the Google AI Hackathon.</p>
      </footer>
    </div>
  );
}

export default App;
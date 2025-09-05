import React from 'react';
import type { JourneyStop } from '../types';

interface MiniTourProps {
  journey: JourneyStop[];
}

const MiniTour: React.FC<MiniTourProps> = ({ journey }) => {
  // The first item in the journey is the main landmark, so we display the rest.
  const tourStops = journey;

  if (tourStops.length === 0) {
    return <p className="text-neutral-500">No other nearby stops were suggested.</p>
  }

  return (
    <div className="relative pl-6">
      <div 
          className="absolute left-6 top-2.5 bottom-2.5 w-0.5 bg-indigo-200" 
          aria-hidden="true"
      ></div>
      <ul className="space-y-8">
        {tourStops.map((stop, index) => (
          <li key={index} className="relative flex items-start gap-6">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full text-white font-bold ring-8 ring-white z-10">
              {index + 1}
            </div>
            <div className='pt-0.5'>
              <h4 className="font-semibold text-neutral-800">{stop.name}</h4>
              <p className="text-neutral-600">{stop.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MiniTour;
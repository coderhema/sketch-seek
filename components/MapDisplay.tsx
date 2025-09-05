import React, { useEffect, useRef } from 'react';
import type { JourneyStop } from '../types';
import AITypedExplanation from './AITypedExplanation';

// Tell TypeScript that L exists globally and has plugins attached.
declare const L: any;

interface MapDisplayProps {
  journey: JourneyStop[];
}

const MapDisplay: React.FC<MapDisplayProps> = ({ journey }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<any>(null); // Using 'any' to accommodate Leaflet plugin

    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            // Fix for default marker icon paths in Leaflet
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
            });

            const map = L.map(mapContainerRef.current, {
                center: [20, 0],
                zoom: 2,
                scrollWheelZoom: true,
            });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            mapRef.current = map;

            // Initialize MarkerClusterGroup
            if (L.markerClusterGroup) {
                markersRef.current = L.markerClusterGroup();
                map.addLayer(markersRef.current);
            } else {
                console.error("Leaflet.markercluster plugin not loaded. Using fallback LayerGroup.");
                markersRef.current = L.layerGroup();
                map.addLayer(markersRef.current);
            }
        }
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        const markerClusterGroup = markersRef.current;
        if (!map || !journey || !markerClusterGroup) return;

        markerClusterGroup.clearLayers();

        const iconWithAnimation = L.icon({
            ...L.Icon.Default.prototype.options,
            className: 'marker-animation'
        });

        journey.forEach(stop => {
            if (typeof stop.latitude !== 'undefined' && typeof stop.longitude !== 'undefined') {
                const marker = L.marker([stop.latitude, stop.longitude], { icon: iconWithAnimation });

                const tooltipContent = `
                    <div class="p-1 text-center">
                        <strong class="font-semibold text-neutral-800">${stop.name}</strong>
                        ${stop.imageUrl ? 
                            `<img src="${stop.imageUrl}" alt="AI generated image of ${stop.name}" class="mt-1 w-32 h-32 object-cover rounded-md shadow-lg"/>` :
                            '<div class="mt-1 w-32 h-32 flex items-center justify-center bg-neutral-200 text-neutral-500 text-xs p-2 rounded-md">Image generating...</div>'
                        }
                    </div>
                `;

                marker.bindTooltip(tooltipContent, {
                    offset: [0, -35],
                    permanent: false,
                    direction: 'top'
                });
                
                markerClusterGroup.addLayer(marker);
            }
        });

        if (markerClusterGroup.getLayers().length > 0) {
            // Check if the getBounds method exists (it does on MarkerClusterGroup, not on LayerGroup)
            if (typeof markerClusterGroup.getBounds === 'function') {
                map.fitBounds(markerClusterGroup.getBounds().pad(0.2));
            } else {
                // Fallback for simple LayerGroup
                const latLngs = journey
                    .filter(stop => typeof stop.latitude !== 'undefined' && typeof stop.longitude !== 'undefined')
                    .map(stop => L.latLng(stop.latitude, stop.longitude));
                if (latLngs.length > 0) {
                    map.fitBounds(L.latLngBounds(latLngs).pad(0.2));
                }
            }
        }

    }, [journey]);

    return (
        <div className="bg-neutral-50 p-6 rounded-3xl shadow-sm border border-neutral-200">
          <div className="mb-4">
             <AITypedExplanation sectionName="Interactive Map" />
          </div>
          <div ref={mapContainerRef} className="h-96 w-full rounded-2xl border border-neutral-200 bg-neutral-200" />
        </div>
    );
};

export default MapDisplay;
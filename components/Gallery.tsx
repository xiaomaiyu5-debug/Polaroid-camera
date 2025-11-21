import React from 'react';
import { Photo } from '../types';

interface GalleryProps {
  photos: Photo[];
  setView: (view: 'camera' | 'gallery') => void;
}

export const Gallery: React.FC<GalleryProps> = ({ photos, setView }) => {
  return (
    <div className="w-full min-h-screen bg-[#d8c8a8] flex flex-col">
      <div className="w-full p-4 flex justify-between items-center">
        <button 
          onClick={() => setView('camera')}
          className="bg-white/80 backdrop-blur border-2 border-gray-400 rounded-full px-6 py-2 shadow-[2px_2px_0px_rgba(0,0,0,0.2)] transform hover:-translate-y-1 transition-transform cursor-pointer"
        >
          <span className="font-hand font-bold text-gray-600 text-lg tracking-wide">
            ← BACK TO CAMERA
          </span>
        </button>
      </div>

      <div className="flex flex-col items-center justify-start pt-10">
        <h1 className="font-hand font-bold text-5xl text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
          PUBLIC PINBOARD GALLERY
        </h1>
        <h2 className="font-hand text-xl text-white/80 mt-2">
          SHARED MEMORIES FROM THE RETRO CAMERA COMMUNITY
        </h2>

        <div className="w-full max-w-6xl mx-auto mt-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {photos.map(photo => (
              <div key={photo.id} className="relative bg-white p-3 pb-8 shadow-lg border border-gray-200 transform -rotate-3">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full shadow-md"></div>
                <div className="bg-gray-900 w-full aspect-square overflow-hidden">
                  <img src={photo.dataUrl} className="w-full h-full object-cover" alt={`photo by ${photo.caption}`} />
                </div>
                <div className="mt-2 text-center">
                  <p className="font-hand text-lg">{photo.caption}</p>
                  <p className="font-hand text-sm text-gray-500">{new Date(photo.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
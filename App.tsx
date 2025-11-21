import React, { useState, useEffect } from 'react';
import { Camera } from './components/Camera';
import { PhotoCard } from './components/PhotoCard';
import { Photo } from './types';
import { generatePhotoCaption } from './services/geminiService';
import { Download, RefreshCw } from 'lucide-react';

import { Gallery } from './components/Gallery';

const SimpleUUID = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export default function App() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [printingPhoto, setPrintingPhoto] = useState<string | null>(null); // Stores dataUrl for animation
  const [view, setView] = useState<'camera' | 'gallery'>('camera');
  
  // Drag and Drop State
  const [dragState, setDragState] = useState<{
    id: string;
    startX: number;
    startY: number;
    initialPhotoX: number;
    initialPhotoY: number;
  } | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(10);

  // Global drag event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState) return;
      
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;

      setPhotos(prev => prev.map(p => {
        if (p.id === dragState.id) {
          return {
            ...p,
            x: dragState.initialPhotoX + dx,
            y: dragState.initialPhotoY + dy
          };
        }
        return p;
      }));
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    if (dragState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState]);

  const handleCapture = async (dataUrl: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setPrintingPhoto(dataUrl);

    // Prepare the new photo object
    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);

    // Create the photo object with initial position
    const newPhoto: Photo = {
      id: SimpleUUID(),
      dataUrl: dataUrl,
      timestamp: Date.now(),
      caption: "",
      rotation: (Math.random() * 10) - 5, // Random rotation between -5 and 5
      x: 20 + (Math.random() * 50), // Start near the "output" area of the desk
      y: 50 + (Math.random() * 50),
      zIndex: nextZ,
      isGeneratingCaption: true,
    };

    // 1. Start Printing Animation (Wait for animation to complete before adding to list)
    setTimeout(() => {
        // Add to main list
        setPhotos(prev => [newPhoto, ...prev]);
        setPrintingPhoto(null); // Clear animation placeholder
        setIsProcessing(false);
    }, 1500); // Matches CSS animation duration

    // 2. Trigger AI Caption in background
    try {
        const caption = await generatePhotoCaption(dataUrl);
        setPhotos(prev => prev.map(p => 
            p.id === newPhoto.id ? { ...p, caption, isGeneratingCaption: false } : p
        ));
    } catch (e) {
        setPhotos(prev => prev.map(p => 
            p.id === newPhoto.id ? { ...p, caption: "Nice shot!", isGeneratingCaption: false } : p
        ));
    }
  };

  const updateCaption = (id: string, newCaption: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, caption: newCaption } : p));
  };

  const deletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleDownloadAll = () => {
    if(photos.length > 0) {
        const link = document.createElement('a');
        link.href = photos[0].dataUrl;
        link.download = `instacam-${photos[0].id}.png`;
        link.click();
    }
  };

  const handlePhotoMouseDown = (e: React.MouseEvent, photo: Photo) => {
    // Bring to front
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);
    
    setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, zIndex: newZ } : p));

    setDragState({
        id: photo.id,
        startX: e.clientX,
        startY: e.clientY,
        initialPhotoX: photo.x,
        initialPhotoY: photo.y
    });
  };

  if (view === 'gallery') {
    return <Gallery photos={photos} setView={setView} />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col relative select-none">
      
      {/* Header / Top Bar */}
      <div className="w-full p-4 flex justify-between items-center z-40 relative pointer-events-none">
        <div className="pointer-events-auto bg-white/80 backdrop-blur border-2 border-pink-400 rounded-full px-6 py-2 shadow-[4px_4px_0px_rgba(244,114,182,1)] transform hover:-translate-y-1 transition-transform cursor-pointer">
            <span className="font-hand font-bold text-pink-500 text-lg tracking-wide">
                INSTACAM AI ✨
            </span>
        </div>

        <div className="flex gap-4 pointer-events-auto">
            <button 
                onClick={handleDownloadAll}
                className="bg-white border-2 border-black rounded-full px-4 py-2 font-hand font-bold hover:bg-gray-50 active:translate-y-1 transition-all flex items-center gap-2"
            >
                <Download size={18} /> DOWNLOAD LATEST
            </button>
            <button 
                onClick={() => setPhotos([])}
                className="bg-white border-2 border-red-400 text-red-500 rounded-full px-4 py-2 font-hand font-bold hover:bg-red-50 active:translate-y-1 transition-all flex items-center gap-2"
            >
                <RefreshCw size={18} /> RESET
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl mx-auto p-4 gap-8 md:gap-12 relative z-0">
        
        {/* Left Side: Camera Section */}
        <div className="relative flex flex-col items-center justify-center z-30 pointer-events-auto">
            <Camera onCapture={handleCapture} isProcessing={isProcessing} />
            
            {/* The Printer Slot Simulation */}
            <div className="absolute top-[280px] w-[200px] h-[10px] bg-[#1a1a1a] rounded-full z-20 shadow-inner"></div>
            
            {/* Ejecting Photo Animation */}
            {printingPhoto && (
                <div className="absolute top-[285px] z-10 w-[240px] animate-eject">
                    <div className="bg-white p-3 pb-8 shadow-md border border-gray-200">
                         <div className="bg-gray-900 w-full aspect-square overflow-hidden">
                            <img src={printingPhoto} className="w-full h-full object-cover opacity-50" alt="developing" />
                         </div>
                         <div className="h-8 mt-2 flex items-center justify-center">
                            <span className="text-gray-300 font-hand text-sm">Developing...</span>
                         </div>
                    </div>
                </div>
            )}
        </div>

        {/* Right Side: Gallery / Desk */}
        <div className="relative flex-1 h-[300px] sm:h-[400px] lg:h-full w-full flex items-start justify-start p-4 sm:p-10 perspective-[1000px]">
             
            {/* Empty State */}
            {photos.length === 0 && !printingPhoto && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 z-0">
                    <p className="font-hand text-2xl sm:text-3xl md:text-4xl text-gray-400 rotate-[-10deg] text-center">
                        Take a photo to start your collection! <br/>
                        <span className="text-sm block mt-2 sm:mt-4 ml-4 sm:ml-10">AI will caption it for you -{'>'}</span>
                    </p>
                    <div className="absolute right-4 sm:right-10 md:right-20 top-1/2">
                         <svg width="60" height="60" sm:width="80" sm:height="80" md:width="100" md:height="100" viewBox="0 0 100 100" className="stroke-gray-400 fill-none stroke-2 animate-bounce">
                             <path d="M10,50 Q30,10 50,50 T90,50" />
                             <path d="M80,40 L90,50 L80,60" />
                         </svg>
                    </div>
                </div>
            )}

            {/* Photo Stack Grid */}
            <div className="relative w-full h-full">
                {photos.map((photo) => (
                    <div 
                        key={photo.id}
                        className="absolute top-0 left-0"
                        style={{
                            transform: `translate(${photo.x}px, ${photo.y}px)`,
                            zIndex: photo.zIndex,
                            // Disable transition while dragging for instant responsiveness
                            transition: dragState?.id === photo.id ? 'none' : 'transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                        }}
                    >
                        <PhotoCard 
                            photo={photo} 
                            onUpdateCaption={updateCaption}
                            onDelete={deletePhoto}
                            onMouseDown={(e) => handlePhotoMouseDown(e, photo)}
                        />
                    </div>
                ))}
            </div>
        </div>

      </div>

      <div className="w-full p-4 sm:p-6 flex flex-col sm:flex-row justify-center sm:justify-between items-center sm:items-end z-50 pointer-events-none gap-4">
         <div onClick={() => setView('gallery')} className="pointer-events-auto bg-[#6b4c3e] text-[#f0eadd] px-6 py-3 rounded-lg sm:rounded-tr-2xl sm:rounded-bl-2xl shadow-lg border-b-4 border-[#4a3228] hover:translate-y-1 hover:border-b-0 transition-all cursor-pointer order-2 sm:order-1">
            <span className="font-hand font-bold text-lg sm:text-xl tracking-wider text-center">View Public Pinboard Gallery</span>
         </div>
         
         <div className="text-gray-400 font-hand text-sm text-center sm:text-right order-1 sm:order-2">
            <p>Use once to capture your day through everyone's eyes.</p>
            <p className="text-xs mt-1 opacity-70">Powered by Google Gemini 2.5 Flash</p>
         </div>
      </div>
    </div>
  );
}
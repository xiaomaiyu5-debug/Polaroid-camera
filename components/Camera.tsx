import React, { useRef, useEffect, useState } from 'react';

interface CameraProps {
  onCapture: (imageSrc: string) => void;
  isProcessing: boolean;
}

export const Camera: React.FC<CameraProps> = ({ onCapture, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [flashActive, setFlashActive] = useState(false);
  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            aspectRatio: 1,
            width: { ideal: 1080 },
            facingMode: 'user'
          },
          audio: false 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setPermissionError(true);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShutter = () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    // Trigger flash effect
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Flip horizontally for mirror effect (selfie mode)
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      onCapture(dataUrl);
    }
  };

  return (
    <div className="relative z-20 select-none">
      {/* Camera Body - Beige Shape */}
      <div className="relative w-[340px] h-[320px] bg-[#fdf6e3] rounded-[50px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2),inset_0_-8px_10px_rgba(0,0,0,0.05),inset_0_4px_10px_rgba(255,255,255,0.8)] flex items-center justify-center border-b-8 border-[#e6dec3]">
        
        {/* Decorative Screw (Top Left) */}
        <div className="absolute top-8 left-8 w-4 h-4 bg-gray-300 rounded-full shadow-inner border border-gray-400 flex items-center justify-center">
            <div className="w-2 h-[1px] bg-gray-500 transform rotate-45"></div>
            <div className="w-2 h-[1px] bg-gray-500 transform -rotate-45 absolute"></div>
        </div>

        {/* Viewfinder Window (Top Left-ish) */}
        <div className="absolute top-8 left-16 w-16 h-10 bg-[#2a2a2a] rounded-md border-4 border-gray-300 shadow-inner overflow-hidden">
             <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black opacity-80"></div>
             {/* Reflection */}
             <div className="absolute top-1 left-1 w-10 h-2 bg-white opacity-20 rounded-full transform -rotate-12"></div>
        </div>

        {/* Flash (Top Right) */}
        <div className="absolute top-8 right-12 w-12 h-12 bg-[#222] rounded-full border-4 border-gray-300 shadow-md flex items-center justify-center overflow-hidden">
            <div className={`w-full h-full bg-yellow-100 opacity-20 transition-opacity duration-100 ${flashActive ? 'opacity-100 bg-white' : ''}`}></div>
             <div className="absolute w-8 h-8 rounded-full border border-gray-500 opacity-50"></div>
        </div>
        
        {/* Sensor/Dot */}
        <div className="absolute top-6 left-1/2 w-3 h-3 bg-black rounded-full shadow-sm"></div>

        {/* Lens Assembly (Center) */}
        <div className="relative w-56 h-56 rounded-full bg-[#e8e0cc] shadow-[0_10px_20px_rgba(0,0,0,0.15),inset_0_2px_4px_rgba(255,255,255,0.5)] flex items-center justify-center border border-[#d6cfbb]">
           {/* Outer Ring (Chrome) */}
           <div className="w-52 h-52 rounded-full bg-gradient-to-b from-[#e0e0e0] to-[#b0b0b0] flex items-center justify-center shadow-[inset_0_2px_5px_rgba(255,255,255,0.8),0_5px_10px_rgba(0,0,0,0.2)]">
               {/* Inner Ring (Black) */}
               <div className="w-48 h-48 rounded-full bg-[#1a1a1a] flex items-center justify-center shadow-inner ring-4 ring-[#333]">
                  {/* The Lens / Video Feed */}
                  <div className="relative w-40 h-40 rounded-full overflow-hidden bg-black ring-4 ring-[#4a4a4a] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                    {permissionError ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 text-center p-4">
                            <span className="text-2xl">📷</span>
                            <span className="text-xs mt-2">Access Denied</span>
                        </div>
                    ) : (
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className="w-full h-full object-cover transform scale-x-[-1]" 
                        />
                    )}
                    {/* Lens Flare/Reflection Overlay */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-transparent to-white opacity-10 rounded-full pointer-events-none"></div>
                  </div>
               </div>
           </div>
        </div>

        {/* Shutter Button (Front Face Left) */}
        <button 
            onClick={handleShutter}
            disabled={isProcessing || permissionError}
            className={`absolute bottom-16 left-6 w-14 h-14 rounded-full border-4 border-[#d6cfbb] shadow-[0_4px_8px_rgba(0,0,0,0.2),inset_0_-2px_4px_rgba(0,0,0,0.1)] active:scale-95 transition-transform flex items-center justify-center group ${isProcessing ? 'cursor-wait' : 'cursor-pointer'}`}
            style={{ backgroundColor: '#eebfa1' }} // Pastel orange/pink button
        >
            <div className="w-10 h-10 rounded-full bg-[#e6b092] shadow-inner group-hover:bg-[#dca486] transition-colors"></div>
        </button>
        
        {/* Strap Hooks (Sides) */}
        <div className="absolute top-1/2 -left-3 w-3 h-8 bg-gray-300 rounded-l-md border-l border-gray-400"></div>
        <div className="absolute top-1/2 -right-3 w-3 h-8 bg-gray-300 rounded-r-md border-r border-gray-400"></div>

        {/* Branding */}
        <div className="absolute bottom-4 right-8 font-mono text-[10px] text-gray-400 tracking-widest opacity-60">
            GEMINI-INSTAX
        </div>

      </div>

      {/* Hidden Canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Flash Overlay (Full Screen) */}
      <div className={`fixed inset-0 bg-white z-50 pointer-events-none transition-opacity duration-300 ${flashActive ? 'opacity-80' : 'opacity-0'}`}></div>
    </div>
  );
};
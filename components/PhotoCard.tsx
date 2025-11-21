import React, { useState } from 'react';
import { Photo } from '../types';
import { Trash2, Edit3, Loader2 } from 'lucide-react';

interface PhotoCardProps {
  photo: Photo;
  onUpdateCaption: (id: string, newCaption: string) => void;
  onDelete: (id: string) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onUpdateCaption, onDelete, onMouseDown, className, style }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localCaption, setLocalCaption] = useState(photo.caption);

  const handleBlur = () => {
    setIsEditing(false);
    onUpdateCaption(photo.id, localCaption);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  return (
    <div 
      onMouseDown={onMouseDown}
      className={`relative group bg-white p-3 pb-8 shadow-xl cursor-grab active:cursor-grabbing ${className}`}
      style={{
        width: '240px',
        transform: `rotate(${photo.rotation}deg)`,
        ...style
      }}
    >
      {/* Tape Effect */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-red-500/80 transform -rotate-1 shadow-sm opacity-90 z-10 flex items-center justify-center pointer-events-none">
        <span className="text-white text-[10px] tracking-widest font-bold uppercase">Public Pinboard</span>
      </div>

      {/* Image Area */}
      <div className="bg-gray-900 w-full aspect-square mb-3 overflow-hidden border border-gray-100 pointer-events-none">
        <img 
          src={photo.dataUrl} 
          alt="Memory" 
          className="w-full h-full object-cover select-none" 
        />
      </div>

      {/* Caption Area */}
      <div 
        className="flex flex-col items-center justify-center min-h-[40px]"
        onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking caption area
      >
        {photo.isGeneratingCaption ? (
           <div className="flex items-center gap-2 text-gray-400 text-sm select-none">
             <Loader2 className="w-3 h-3 animate-spin" />
             <span>Thinking...</span>
           </div>
        ) : (
          isEditing ? (
            <input
              autoFocus
              value={localCaption}
              onChange={(e) => setLocalCaption(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full text-center font-hand text-lg text-gray-700 bg-transparent border-b border-gray-300 focus:outline-none focus:border-red-400"
            />
          ) : (
            <div 
              onClick={() => setIsEditing(true)}
              className="relative cursor-text group/text w-full text-center"
            >
              <p className="font-hand text-xl text-gray-800 leading-tight select-none">
                {photo.caption || "Click to write..."}
              </p>
              <span className="absolute -right-2 top-0 opacity-0 group-hover/text:opacity-100 transition-opacity text-gray-400">
                <Edit3 size={12} />
              </span>
              <p className="text-[10px] text-gray-400 mt-1 font-mono tracking-tighter select-none">
                {new Date(photo.timestamp).toLocaleDateString()}
              </p>
            </div>
          )
        )}
      </div>

      {/* Delete Button (Hidden by default, shown on hover) */}
      <button 
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(photo.id);
        }}
        className="absolute -bottom-2 -right-2 bg-white text-red-500 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all scale-75 hover:scale-100 hover:bg-red-50 border border-gray-200 z-20"
        title="Burn photo"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};
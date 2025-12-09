import React from 'react';
import { cn } from '../utils/cn';

interface ImageGalleryProps {
  images: string[];
  className?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, className }) => {
  if (!images || images.length === 0) return null;

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4", className)}>
      {images.map((img, idx) => (
        <div key={idx} className="group relative overflow-hidden rounded-xl border border-white/10 glass-panel aspect-square">
          <img
            src={`/${img}`}
            alt={`Generated result ${idx + 1}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
             <span className="text-white text-sm font-medium">Image {idx + 1}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

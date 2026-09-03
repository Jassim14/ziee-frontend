import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, ZoomIn } from 'lucide-react';

export default function GalleryViewer({ images = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, images]);

  if (!images || images.length === 0) {
    return null;
  }

  const nextImage = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % images.length);
  };

  const prevImage = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
  };

  const getImageUrl = (img) => {
    if (typeof img === 'string') return img;
    return img?.filePath || '';
  };

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <ImageIcon size={18} className="text-gray-500" />
        <h3 className="font-semibold text-gray-900 text-lg">Photo Gallery ({images.length})</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, idx) => {
          const url = getImageUrl(img);
          return (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className="group relative h-28 sm:h-36 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <img
                src={url}
                alt={img.originalName || "Gallery photo"}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>';
                }}
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <ZoomIn size={22} />
              </div>
            </button>
          );
        })}
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition z-10"
            aria-label="Close image viewer"
          >
            <X size={28} />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition z-10"
                aria-label="Previous image"
              >
                <ChevronLeft size={36} />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition z-10"
                aria-label="Next image"
              >
                <ChevronRight size={36} />
              </button>
            </>
          )}

          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
            <img
              src={getImageUrl(images[selectedIndex])}
              alt="Gallery photo"
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>';
              }}
            />
            <p className="text-white/70 text-sm mt-3">
              {selectedIndex + 1} of {images.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

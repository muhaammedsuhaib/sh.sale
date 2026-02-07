import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

export interface ImageCarouselProps {
  images: string[];
  height?: string | number;
  width?: string | number;
  showThumbnails?: boolean;
  showCounter?: boolean;
  showFullscreen?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
  imageClassName?: string;
  thumbnailClassName?: string;
  emptyStateText?: string;
  onImageClick?: (index: number) => void;
  onSlideChange?: (index: number) => void;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = React.memo(
  ({
    images,
    height = "24rem", // 96 = 24rem
    width = "100%",
    showThumbnails = true,
    showCounter = true,
    showFullscreen = true,
    autoPlay = false,
    autoPlayInterval = 5000,
    className = "",
    imageClassName = "",
    thumbnailClassName = "",
    emptyStateText = "No images available",
    onImageClick,
    onSlideChange,
  }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

    const goToPrevious = useCallback(() => {
      const newIndex =
        currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      setCurrentIndex(newIndex);
      onSlideChange?.(newIndex);
    }, [currentIndex, images.length, onSlideChange]);

    const goToNext = useCallback(() => {
      const newIndex =
        currentIndex === images.length - 1 ? 0 : currentIndex + 1;
      setCurrentIndex(newIndex);
      onSlideChange?.(newIndex);
    }, [currentIndex, images.length, onSlideChange]);

    const goToSlide = useCallback(
      (slideIndex: number) => {
        setCurrentIndex(slideIndex);
        onSlideChange?.(slideIndex);
      },
      [onSlideChange],
    );

    const toggleFullscreen = () => {
      setIsFullscreen(!isFullscreen);
    };

    const toggleAutoPlay = () => {
      setIsAutoPlaying(!isAutoPlaying);
    };

    const handleImageClick = () => {
      if (onImageClick) {
        onImageClick(currentIndex);
      } else if (showFullscreen) {
        toggleFullscreen();
      }
    };

    // Auto-play functionality
    useEffect(() => {
      if (!isAutoPlaying || images.length <= 1) return;

      const interval = setInterval(goToNext, autoPlayInterval);
      return () => clearInterval(interval);
    }, [isAutoPlaying, goToNext, autoPlayInterval, images.length]);

    // Handle keyboard navigation
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (isFullscreen) {
          if (event.key === "ArrowLeft") goToPrevious();
          if (event.key === "ArrowRight") goToNext();
          if (event.key === "Escape") setIsFullscreen(false);
          if (event.key === " ") {
            event.preventDefault();
            toggleAutoPlay();
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isFullscreen, goToPrevious, goToNext]);

    // Handle image loading error
    const handleImageError = useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.target as HTMLImageElement;
        target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='10' fill='%2394a3b8'%3EImage Error%3C/text%3E%3C/svg%3E`;
      },
      [],
    );

    if (images.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700">
          <ImageIcon className="h-16 w-16 text-slate-400 dark:text-slate-500 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-center">
            {emptyStateText}
          </p>
        </div>
      );
    }

    const CarouselContent = () => (
      <>
        {/* Main Image Container */}
        <div
          className="relative rounded-xl overflow-hidden bg-slate-900"
          style={{ height, width }}
        >
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className={`w-full h-full object-contain cursor-pointer ${imageClassName}`}
            onClick={handleImageClick}
            onError={handleImageError}
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {showCounter && images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm z-10">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Control Buttons */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            {/* Auto-play Toggle */}
            {autoPlay && images.length > 1 && (
              <button
                onClick={toggleAutoPlay}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
                title={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
                aria-label={
                  isAutoPlaying ? "Pause slideshow" : "Play slideshow"
                }
              >
                {isAutoPlaying ? "⏸️" : "▶️"}
              </button>
            )}

            {/* Fullscreen Button */}
            {showFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
                title="Toggle fullscreen"
                aria-label={
                  isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                }
              >
                {isFullscreen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">⛶</span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Thumbnails */}
        {showThumbnails && images.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto py-2 scrollbar-thin">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${thumbnailClassName} ${
                  index === currentIndex
                    ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20"
                    : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
                }`}
                aria-label={`View image ${index + 1}`}
                aria-current={index === currentIndex ? "true" : "false"}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </button>
            ))}
          </div>
        )}

        {/* Dots Navigation */}
        {!showThumbnails && images.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? "bg-blue-500 dark:bg-blue-400"
                    : "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </>
    );

    if (isFullscreen) {
      return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
          <div className="max-w-7xl w-full max-h-[90vh]">
            <CarouselContent />
          </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-slate-300 text-sm flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Exit Fullscreen (ESC)
            </button>
            {autoPlay && images.length > 1 && (
              <button
                onClick={toggleAutoPlay}
                className="text-white hover:text-slate-300 text-sm flex items-center gap-2"
              >
                {isAutoPlaying ? "⏸️ Pause" : "▶️ Play"}
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 ${className}`}
      >
        <CarouselContent />
      </div>
    );
  },
);

ImageCarousel.displayName = "ImageCarousel";

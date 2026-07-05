import React, { useRef } from 'react';

export default function DiffSlider({ beforeUrl, afterUrl, sliderPosition, setSliderPosition }) {
  const sliderRef = useRef(null);

  // Append static cache buster version to force browser cache bypass on new mockup images
  const getBustedUrl = (url) => {
    if (!url) return '';
    if (url.includes('localhost:') || url.includes('127.0.0.1:')) {
      const buster = 'v=hackathon_v3';
      return url.includes('?') ? `${url}&${buster}` : `${url}?${buster}`;
    }
    return url;
  };

  const beforeBusted = getBustedUrl(beforeUrl);
  const afterBusted = getBustedUrl(afterUrl);

  const handleSliderMove = (clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1) {
      handleSliderMove(e.clientX);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  return (
    <div 
      ref={sliderRef}
      className="diff-slider-wrapper"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseDown={(e) => handleSliderMove(e.clientX)}
    >
      {/* Before Screenshot */}
      <img 
        src={beforeBusted} 
        className="slider-image-before" 
        alt="Staging UI Before" 
      />
      
      {/* After Screenshot with clip-path polygon overlay */}
      <img 
        src={afterBusted} 
        className="slider-image-after" 
        style={{ 
          clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` 
        }}
        alt="Staging UI After" 
      />

      {/* Slider divider line handle */}
      <div className="slider-handle" style={{ left: `${sliderPosition}%` }}></div>
    </div>
  );
}

import React, { useRef } from 'react';

export default function DiffSlider({ beforeUrl, afterUrl, sliderPosition, setSliderPosition }) {
  const sliderRef = useRef(null);

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
        src={beforeUrl} 
        className="slider-image-before" 
        alt="Staging UI Before" 
      />
      
      {/* After Screenshot with clip-path polygon overlay */}
      <img 
        src={afterUrl} 
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

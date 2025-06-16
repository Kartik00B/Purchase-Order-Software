import React, { useEffect, useState } from 'react';
import '../SplashScreen.css';

const SplashScreen = () => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Preload the image
    const img = new Image();
    img.src = '/po.png';
    img.onload = () => setImageLoaded(true);
  }, []);

  return (
    <div className="splash-container">
      {imageLoaded ? (
        <img src="/po.png" className="logo" alt="Logo" />
      ) : (
        <div className="logo-placeholder"></div>
      )}
      <div className="title">Purchase Order System</div>
      <div className="loading-bar"></div>
      <div className="author">Developed by Krack</div>
    </div>
  );
};

export default SplashScreen;